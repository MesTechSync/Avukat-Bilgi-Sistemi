from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Test Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test backend çalışıyor!"}

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Backend sağlıklı"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=9000)
