"""
HTTP adapter for MCP Auth Toolkit OAuth endpoints
Exposes MCP OAuth tools as HTTP endpoints for Claude.ai integration
"""

import os
import logging
import secrets
import time
from typing import Optional
from urllib.parse import urlencode, quote
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request, Query, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse

# Try to import Clerk SDK
try:
    import importlib
    importlib.import_module("clerk_backend_api")
    clerk_available = True
except ImportError as e:
    clerk_available = False

logger = logging.getLogger(__name__)

router = APIRouter()

# OAuth configuration
BASE_URL = os.getenv("BASE_URL", "https://yargimcp.com")


@router.get("/.well-known/oauth-authorization-server")
async def get_oauth_metadata():
    """OAuth 2.0 Authorization Server Metadata (RFC 8414)"""
    return JSONResponse({
        "issuer": BASE_URL,
        "authorization_endpoint": f"{BASE_URL}/authorize",
        "token_endpoint": f"{BASE_URL}/token",
        "registration_endpoint": f"{BASE_URL}/register",
        "response_types_supported": ["code"],
        "grant_types_supported": ["authorization_code", "refresh_token"],
        "code_challenge_methods_supported": ["S256"],
        "token_endpoint_auth_methods_supported": ["none"],
        "scopes_supported": ["mcp:tools:read", "mcp:tools:write", "openid", "profile", "email"],
        "service_documentation": f"{BASE_URL}/mcp/"
    })


@router.get("/.well-known/oauth-protected-resource")
async def get_protected_resource_metadata():
    """OAuth Protected Resource Metadata (RFC 9728)"""
    return JSONResponse({
        "resource": BASE_URL,
        "authorization_servers": [BASE_URL],
        "bearer_methods_supported": ["header"],
        "scopes_supported": ["mcp:tools:read", "mcp:tools:write"],
        "resource_documentation": f"{BASE_URL}/docs"
    })


@router.get("/authorize")
async def authorize_endpoint(
    response_type: str = Query(...),
    client_id: str = Query(...),
    redirect_uri: str = Query(...),
    code_challenge: str = Query(...),
    code_challenge_method: str = Query("S256"),
    state: Optional[str] = Query(None),
    scope: Optional[str] = Query(None)
):
    """OAuth 2.1 Authorization Endpoint - Uses Clerk SDK for custom domains"""
    
    logger.info(f"OAuth authorize request - client_id: {client_id}, redirect_uri: {redirect_uri}")
    
    if not clerk_available:
        logger.error("Clerk SDK not available")
        raise HTTPException(status_code=500, detail="Clerk SDK not available")
    
    # Store OAuth session for later validation
    try:
        from mcp_server_main import app as mcp_app
        import importlib
        _m = importlib.import_module("mcp_auth_factory")
        oauth_provider = getattr(_m, "get_oauth_provider")(mcp_app)
        if not oauth_provider:
            raise HTTPException(status_code=500, detail="OAuth provider not configured")
        
        # Generate session and store PKCE
        session_id = secrets.token_urlsafe(32)
        if state is None:
            state = secrets.token_urlsafe(16)
        
        # Create PKCE challenge
        from mcp_auth.oauth import PKCEChallenge
        pkce = PKCEChallenge()
        
        # Store session data
        session_data: dict[str, object] = {
            "pkce_verifier": pkce.verifier,
            "pkce_challenge": code_challenge,  # Store the client's challenge
            "state": state,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "scopes": scope.split(" ") if scope else ["mcp:tools:read", "mcp:tools:write"],
            "created_at": time.time(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).timestamp(),
        }
        oauth_provider.storage.set_session(session_id, session_data)
        
        # For Clerk with custom domains, we need to use their hosted sign-in page
        # We'll pass our callback URL and session info in the state
        callback_url = f"{BASE_URL}/auth/callback"
        
        # Encode session info in state for retrieval after Clerk auth
        combined_state = f"{state}:{session_id}"
        
        # Use Clerk's sign-in URL with proper parameters
        clerk_domain = os.getenv("CLERK_DOMAIN", "accounts.yargimcp.com")
        sign_in_params = {
            "redirect_url": f"{callback_url}?state={quote(combined_state)}",
        }
        
        sign_in_url = f"https://{clerk_domain}/sign-in?{urlencode(sign_in_params)}"
        
        logger.info(f"Redirecting to Clerk sign-in: {sign_in_url}")
        
        return RedirectResponse(url=sign_in_url)
        
    except Exception as e:
        logger.exception(f"Authorization failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/auth/callback")
async def oauth_callback(
    request: Request,
    state: Optional[str] = Query(None),
    clerk_token: Optional[str] = Query(None)
):
    """Handle OAuth callback from Clerk - supports both JWT token and cookie auth"""
    
    logger.info(f"OAuth callback received - state: {state}")
    logger.info(f"Query params: {dict(request.query_params)}")
    logger.info(f"Cookies: {dict(request.cookies)}")
    logger.info(f"Clerk JWT token provided: {bool(clerk_token)}")
    
    # Support both JWT token (for cross-domain) and cookie auth (for subdomain)
    
    try:
        if not state:
            logger.error("No state parameter provided")
            return JSONResponse(
                status_code=400,
                content={"error": "invalid_request", "error_description": "Missing state parameter"}
            )
        
        # Parse state to get original state and session ID
        try:
            if ":" in state:
                original_state, session_id = state.rsplit(":", 1)
            else:
                original_state = state
                session_id = state  # Fallback
        except ValueError:
            logger.error(f"Invalid state format: {state}")
            return JSONResponse(
                status_code=400,
                content={"error": "invalid_request", "error_description": "Invalid state format"}
            )
        
        # Get OAuth provider
        from mcp_server_main import app as mcp_app
        import importlib
        _m = importlib.import_module("mcp_auth_factory")
        oauth_provider = getattr(_m, "get_oauth_provider")(mcp_app)
        if not oauth_provider:
            raise HTTPException(status_code=500, detail="OAuth provider not configured")
        
        # Get stored session
        oauth_session = oauth_provider.storage.get_session(session_id)
        
        if not oauth_session:
            logger.error(f"OAuth session not found for ID: {session_id}")
            return JSONResponse(
                status_code=400,
                content={"error": "invalid_request", "error_description": "OAuth session expired or not found"}
            )
        
        # Check if we have a JWT token (for cross-domain auth)
        user_authenticated = False
        auth_method = "none"
        
        if clerk_token:
            logger.info("Attempting JWT token validation from claims only")
            try:
                import jwt
                decoded_token = jwt.decode(clerk_token, options={"verify_signature": False})
                user_id = decoded_token.get("sub") or decoded_token.get("user_id")
                if user_id:
                    logger.info(f"JWT token contains user_id: {user_id}")
                    user_authenticated = True
                    auth_method = "jwt_token"
                    oauth_session["user_id"] = user_id
                    oauth_session["auth_method"] = "jwt_token"
                else:
                    logger.error("JWT token validation failed - no user identifier in claims")
            except Exception as e:
                logger.error(f"JWT token parsing failed: {str(e)}")
                # Fall through to cookie validation
        
        # If no JWT token or validation failed, check cookies
        if not user_authenticated:
            logger.info("Checking for Clerk session cookies")
            clerk_session_cookie = request.cookies.get("__session")
            if clerk_session_cookie:
                logger.info("Found Clerk session cookie, treating as authenticated for same-site flow")
                user_authenticated = True
                auth_method = "cookie"
                oauth_session["auth_method"] = "cookie"
        
        # Do not trust redirects without proof; require JWT or cookie
        if not user_authenticated:
            logger.error("Authentication proof missing (no JWT, no session cookie)")
            return JSONResponse(
                status_code=401,
                content={"error": "invalid_grant", "error_description": "Authentication proof required"}
            )
        
        logger.info(f"User authenticated: {user_authenticated}, method: {auth_method}")
        
        # Generate simple authorization code for custom domain flow
        auth_code = f"clerk_custom_{session_id}_{int(time.time())}"
        
        # Store the code mapping for token exchange  
        code_data: dict[str, object] = {
            "session_id": session_id,
            "clerk_authenticated": user_authenticated,
            "auth_method": auth_method,
            "custom_domain_flow": True,
            "created_at": time.time(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).timestamp(),
        }
        if "user_id" in oauth_session:
            code_data["user_id"] = oauth_session["user_id"]
            
        oauth_provider.storage.set_session(f"code_{auth_code}", code_data)
        
        # Build redirect URL back to Claude
        redirect_params = {
            "code": auth_code,
            "state": original_state
        }
        
        redirect_url = f"{oauth_session['redirect_uri']}?{urlencode(redirect_params)}"
        logger.info(f"Redirecting back to Claude: {redirect_url}")
        
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        logger.exception(f"Callback processing failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "server_error", "error_description": str(e)}
        )


@router.post("/register")
async def register_client(request: Request):
    """Dynamic Client Registration (RFC 7591)"""
    
    data = await request.json()
    logger.info(f"Client registration request: {data}")
    
    # Simple dynamic registration - accept any client
    client_id = f"mcp-client-{os.urandom(8).hex()}"
    
    return JSONResponse({
        "client_id": client_id,
        "client_secret": None,  # Public client
        "redirect_uris": data.get("redirect_uris", []),
        "grant_types": ["authorization_code", "refresh_token"],
        "response_types": ["code"],
        "client_name": data.get("client_name", "MCP Client"),
        "token_endpoint_auth_method": "none",
        "client_id_issued_at": int(datetime.now().timestamp())
    })


@router.post("/token")
async def token_endpoint(request: Request):
    """OAuth 2.1 Token Endpoint"""
    
    # Parse form data
    form_data = await request.form()
    grant_type = form_data.get("grant_type")
    code = form_data.get("code")
    redirect_uri = form_data.get("redirect_uri")
    _client_id = form_data.get("client_id")
    _code_verifier = form_data.get("code_verifier")
    
    code_preview = code if isinstance(code, str) else None
    logger.info(f"Token exchange - grant_type: {grant_type}, code: {code_preview[:20] if code_preview else 'None'}...")
    
    if grant_type != "authorization_code":
        return JSONResponse(
            status_code=400,
            content={"error": "unsupported_grant_type"}
        )
    
    try:
        # OAuth token exchange - validate code and return Clerk JWT
        # This supports proper OAuth flow while using Clerk JWT tokens
        
        if not code or not redirect_uri:
            logger.error("Missing required parameters: code or redirect_uri")
            return JSONResponse(
                status_code=400,
                content={"error": "invalid_request", "error_description": "Missing code or redirect_uri"}
            )
        
        # Validate authorization code format only; actual exchange must be implemented with IdP
        if isinstance(code, str) and len(code) > 10:
            logger.error("Authorization code exchange with IdP not implemented; refusing to issue mock token")
            return JSONResponse(
                status_code=401,
                content={
                    "error": "invalid_grant",
                    "error_description": "Real JWT required from identity provider"
                }
            )
        else:
            logger.error(f"Invalid code format: {code}")
            return JSONResponse(
                status_code=400,
                content={"error": "invalid_grant", "error_description": "Invalid authorization code"}
            )
        
    except Exception as e:
        logger.exception(f"Token exchange failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "server_error", "error_description": str(e)}
        )