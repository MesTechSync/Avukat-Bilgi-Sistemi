import io
import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

# Ensure local toolkit modules are importable
import sys
BASE_DIR = Path(__file__).parent.resolve()
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from main import main as docx_to_udf_main  # type: ignore
from scanned_pdf_to_udf import pdf_to_udf  # type: ignore


app = FastAPI(title="UDF Conversion API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok", "service": "udf-api"})


def _save_upload_to_tmp(upload: UploadFile) -> Path:
    """Persist uploaded file to a temporary location and return the path."""
    suffix = Path(upload.filename or "uploaded").suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as f:
        tmp_path = Path(f.name)
        # Read in chunks
        while True:
            chunk = upload.file.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
    return tmp_path


def _convert_docx_to_udf(input_path: Path) -> Path:
    out_path = input_path.with_suffix(".udf")
    # Toolkit's main(docx_file, udf_file) writes zip to out_path
    docx_to_udf_main(str(input_path), str(out_path))
    if not out_path.exists():
        raise RuntimeError("UDF output not created for DOCX input")
    return out_path


def _convert_pdf_to_udf(input_path: Path) -> Path:
    out_path = input_path.with_suffix(".udf")
    pdf_to_udf(str(input_path), str(out_path))
    if not out_path.exists():
        raise RuntimeError("UDF output not created for PDF input")
    return out_path


@app.post("/api/convert-udf")
async def convert_udf(file: UploadFile = File(...)):
    filename = file.filename or "uploaded"
    name_lower = filename.lower()
    try:
        src_path = _save_upload_to_tmp(file)
        if name_lower.endswith(".docx"):
            udf_path = _convert_docx_to_udf(src_path)
        elif name_lower.endswith(".pdf"):
            udf_path = _convert_pdf_to_udf(src_path)
        else:
            raise HTTPException(status_code=415, detail="Only .docx or .pdf supported")

        data = udf_path.read_bytes()
        out_name = Path(filename).with_suffix(".udf").name
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename=\"{out_name}\"",
                "X-Source-Filename": filename,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")
    finally:
        try:
            # Clean temp files
            if 'src_path' in locals() and isinstance(src_path, Path) and src_path.exists():
                src_path.unlink(missing_ok=True)  # type: ignore
            if 'udf_path' in locals() and isinstance(udf_path, Path) and udf_path.exists():
                # Keep output file on disk? We can remove since we streamed bytes
                udf_path.unlink(missing_ok=True)  # type: ignore
        except Exception:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("udf_api:app", host="127.0.0.1", port=8010, reload=False)
