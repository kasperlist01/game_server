import random
from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os
from pydantic import BaseModel
import psutil

app = FastAPI()

# Путь к статическим файлам
static_folder_path = '/app/frontend/build'
app.mount("/static", StaticFiles(directory=os.path.join(static_folder_path, 'static')), name="static")


@app.get("/", include_in_schema=False)
async def serve():
    full_path = os.path.join(static_folder_path, 'index.html')
    return FileResponse(full_path)


class Metrics(BaseModel):
    cpu_usage: float
    memory_usage: float
    disk_space_used: float
    network_activity: float


@app.get("/metrics", response_model=Metrics)
async def get_metrics():
    cpu_usage = psutil.cpu_percent(interval=1)  # Процент использования CPU
    memory_info = psutil.virtual_memory()  # Информация о памяти
    disk_info = psutil.disk_usage('/')  # Информация о дисковом пространстве
    net_info = psutil.net_io_counters()  # Информация о сетевой активности

    metrics = Metrics(
        cpu_usage=cpu_usage,
        memory_usage=int(memory_info.used / (1024 * 1024)),  # Преобразование в МБ
        disk_space_used=int(disk_info.used / (1024 * 1024 * 1024)),  # Преобразование в ГБ
        network_activity=round((net_info.bytes_sent + net_info.bytes_recv) / (1024 * 1024), 2)  # Преобразование в МБ
    )
    return JSONResponse(content=metrics.dict())


@app.post("/server/start")
async def start_server(game: str = Query(...)):
    print(f"Starting server for {game}")
    return JSONResponse(content={"status": "Running"})


@app.post("/server/stop")
async def stop_server():
    print("Stopping server")
    return JSONResponse(content={"status": "Stopped"})


@app.post("/server/restart")
async def restart_server():
    print("Restarting server")
    return JSONResponse(content={"status": "Restarting"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
