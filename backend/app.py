from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# Путь к статическим файлам
static_folder_path = '/app/frontend/build'
app.mount("/app/frontend/build/static", StaticFiles(directory=static_folder_path), name="static")


@app.get("/{path:path}", include_in_schema=False)
async def serve(path: str):
    full_path = os.path.join(static_folder_path, path)
    print("Requested path:", path)
    print("Full path:", full_path)
    if path and os.path.exists(full_path):
        return FileResponse(full_path)
    else:
        return FileResponse(os.path.join(static_folder_path, 'index.html'))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
