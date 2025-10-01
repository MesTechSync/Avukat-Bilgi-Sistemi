#!/usr/bin/env python3
"""
Thin launcher for the Panel backend app.

Defaults to the lightweight Enterprise (development) backend to avoid optional
infrastructure dependencies (like Redis) during local development. Set the
environment variable PANEL_BACKEND_MODE=production to force the production
backend that enables Redis caching and additional enterprise patterns.
"""

import os
import uvicorn

# Decide which backend to load based on environment
_backend_mode = os.getenv("PANEL_BACKEND_MODE", "development").lower()
_loaded = None

if _backend_mode in ("production", "prod"):  # explicit production
    try:
        from panel_backend_production import app  # type: ignore
        _loaded = "production"
        print("✅ Production backend loaded (Opus patterns, Redis if available)")
    except Exception as e:
        # Fallback to enterprise (dev) if production import fails
        from panel_backend_enterprise import app  # type: ignore
        _loaded = "enterprise"
        print(f"⚠️ Production import failed ({e}); using enterprise backend")
else:
    # Default: Enterprise (development) backend
    try:
        from panel_backend_enterprise import app  # type: ignore
        _loaded = "enterprise"
        print("Enterprise (development) backend loaded")
    except Exception as e:
        # Last resort: try production
        from panel_backend_production import app  # type: ignore
        _loaded = "production"
        print(f"Enterprise import failed ({e}); using production backend")

if __name__ == "__main__":
    banner_title = (
        "PANEL ICTIHAT & MEVZUAT - " +
        ("PRODUCTION (Opus Patterns)" if _loaded == "production" else "DEVELOPMENT (Enterprise)")
    )
    banner = (
        "=" * 80 + "\n" +
        f"{banner_title}\n" +
        "=" * 80 + "\n" +
        "Starting Legal Research System...\n" +
        ("Circuit Breaker + Tool Isolation + Auto-Recovery ACTIVE\nRedis Caching + Process Isolation ENABLED\n"
         if _loaded == "production" else
         "Dev-friendly backend (no Redis requirement)\n") +
        "Access: http://localhost:9000\n" +
        "Docs: http://localhost:9000/docs\n" +
        ("Health: http://localhost:9000/health/production\n" if _loaded == "production" else "") +
        "=" * 80
    )
    try:
        print(banner)
    except Exception:
        # Fallback print without raising on encoding issues
        sys_stdout = getattr(__import__('sys'), 'stdout', None)
        if sys_stdout is not None:
            try:
                sys_stdout.buffer.write((banner + "\n").encode(errors='ignore'))
                sys_stdout.flush()
            except Exception:
                pass
    uvicorn.run(
        "panel_backend:app",  # this module re-exports enterprise app
        host="0.0.0.0",
        port=9000,
        reload=True,
        reload_includes=["*.py"],
        reload_excludes=[
            "node_modules",
            "dist",
            ".git",
            "__pycache__",
            "*.log"
        ],
        log_level="info",
        access_log=True,
    )
