import random
from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os
from pydantic import BaseModel
import docker

app = FastAPI()

# Путь к статическим файлам
static_folder_path = '/app/frontend/build'
app.mount("/static", StaticFiles(directory=os.path.join(static_folder_path, 'static')), name="static")

# Создаем клиента Docker
docker_client = docker.from_env()

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
    # Получаем метрики всех контейнеров
    containers = docker_client.containers.list()
    total_cpu = 0.0
    total_memory = 0.0
    total_network_in = 0.0
    total_network_out = 0.0

    for container in containers:
        stats = container.stats(stream=False)
        cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
        system_cpu_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
        number_cpus = len(stats['cpu_stats']['cpu_usage'].get('percpu_usage', []))  # Используем get для безопасного доступа
        if system_cpu_delta > 0 and number_cpus > 0:
            total_cpu += (cpu_delta / system_cpu_delta) * number_cpus * 100.0

        memory_usage = stats['memory_stats']['usage']
        total_memory += memory_usage / (1024 * 1024)  # Преобразование в МБ

        network_stats = stats['networks']
        for interface, interface_stats in network_stats.items():
            total_network_in += interface_stats['rx_bytes']
            total_network_out += interface_stats['tx_bytes']

    metrics = Metrics(
        cpu_usage=total_cpu,
        memory_usage=total_memory,
        disk_space_used=random.uniform(100.0, 500.0),  # Пример данных для дискового пространства
        network_activity=(total_network_in + total_network_out) / (1024 * 1024)  # Преобразование в МБ
    )
    return JSONResponse(content=metrics.dict())


@app.post("/server/start")
async def start_server(game: str = Query(...)):
    # Реализация логики запуска сервера игры
    print(f"Starting server for {game}")
    return JSONResponse(content={"status": "Running"})


@app.post("/server/stop")
async def stop_server():
    # Реализация логики остановки сервера игры
    print("Stopping server")
    return JSONResponse(content={"status": "Stopped"})


@app.post("/server/restart")
async def restart_server():
    # Реализация логики перезапуска сервера игры
    print("Restarting server")
    return JSONResponse(content={"status": "Restarting"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
