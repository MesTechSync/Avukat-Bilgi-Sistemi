#!/usr/bin/env python3
"""
Thin launcher to run the Enterprise backend app.
Keeps existing entrypoint (python panel_backend.py) but serves app from panel_backend_enterprise.app
"""

import uvicorn

# Re-export FastAPI app from PRODUCTION module for tooling that imports panel_backend:app
try:
    from panel_backend_production import app  # type: ignore
    print("✅ PRODUCTION backend loaded with Opus patterns")
except Exception as e:  # Fallback to enterprise
    try:
        from panel_backend_enterprise import app  # type: ignore
        print("⚠️ Fallback to enterprise backend")
    except Exception as e2:
        raise SystemExit(f"Backend import failed: {e} / {e2}")

if __name__ == "__main__":
    banner = (
        "=" * 80 + "\n" +
        "🏛️ PANEL İÇTİHAT & MEVZUAT - PRODUCTION WITH OPUS PATTERNS\n" +
        "=" * 80 + "\n" +
        "🚀 Starting Enterprise-Grade Legal Research System...\n" +
        "🛡️ Circuit Breaker + Tool Isolation + Auto-Recovery ACTIVE\n" +
        "📦 Redis Caching + Process Isolation ENABLED\n" +
        "🌐 Access: http://localhost:9000\n" +
        "📚 Docs: http://localhost:9000/docs\n" +
        "🔍 Health: http://localhost:9000/health/production\n" +
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
