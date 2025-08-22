from fastapi import FastAPI
from app.core.config import settings
from app.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title=settings.APP_NAME)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth_router, prefix=settings.API_STARTING_PATH)

@app.get("/")
async def root():
    return {"message": "Hello World"}

# if __name__ == "__main__":
#     import uvicorn

#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)