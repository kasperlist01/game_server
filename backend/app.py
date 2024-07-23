import paramiko
from fastapi import FastAPI, WebSocket
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from pydantic import BaseModel
import psutil
from starlette.websockets import WebSocketDisconnect

from config import host, user, secret, port
import asyncio

app = FastAPI()

# Путь к статическим файлам
static_folder_path = '/app/frontend/build'
app.mount("/static", StaticFiles(directory=os.path.join(static_folder_path, 'static')), name="static")
app.mount("/icons", StaticFiles(directory=os.path.join(static_folder_path, 'icons')), name="icons")


@app.get("/", include_in_schema=False)
async def serve():
    full_path = os.path.join(static_folder_path, 'index.html')
    return FileResponse(full_path)


@app.get("/manifest.json", include_in_schema=False)
async def manifest():
    full_path = os.path.join(static_folder_path, 'manifest.json')
    if os.path.exists(full_path):
        return FileResponse(full_path)
    return JSONResponse(content={"error": "manifest.json not found"}, status_code=404)


class Metrics(BaseModel):
    cpu_usage: float
    memory_usage: float
    disk_space_used: float
    network_activity: float


class StatusMetrics(BaseModel):
    cpu_usage: float
    memory_usage: float
    disk_space_used: float
    network_activity: float
    server_status: str


class GameRequest(BaseModel):
    game: str


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
    return metrics


async def get_status():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname=host, username=user, password=secret, port=port)
    stdin, stdout, stderr = client.exec_command('docker ps')

    stderr_output = stderr.read().decode('utf-8')
    stdout_output = stdout.read().decode('utf-8')

    client.close()

    if "valheim_server" in stdout_output:
        return "Running"
    else:
        return "Stopped"


@app.websocket("/ws/metrics")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            metrics = await get_metrics()
            server_status = await get_status()
            status_metrics = StatusMetrics(
                cpu_usage=metrics.cpu_usage,
                memory_usage=metrics.memory_usage,
                disk_space_used=metrics.disk_space_used,
                network_activity=metrics.network_activity,
                server_status=server_status
            )
            await websocket.send_json(status_metrics.dict())
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        print("Client disconnected")


@app.get("/metrics", response_model=Metrics)
async def get_metrics_http():
    metrics = await get_metrics()
    server_status = await get_status()
    status_metrics = StatusMetrics(
        cpu_usage=metrics.cpu_usage,
        memory_usage=metrics.memory_usage,
        disk_space_used=metrics.disk_space_used,
        network_activity=metrics.network_activity,
        server_status=server_status
    )
    return JSONResponse(content=status_metrics.dict())


@app.post("/server/start")
async def start_server(request: GameRequest):
    game = request.game
    if game == 'Valheim':
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=host, username=user, password=secret, port=port)
        stdin, stdout, stderr = client.exec_command('docker-compose -f projects/valheim/docker-compose.yml up -d')

        stderr_output = stderr.read().decode('utf-8')
        stdout_output = stdout.read().decode('utf-8')

        client.close()

        if "Container valheim_server  Started" in stderr_output or "Container valheim_server  Running" in stderr_output:
            return JSONResponse(content={"status": "Started", "message": stderr_output + stdout_output})
        else:
            return JSONResponse(content={"status": "Error", "message": stderr_output + stdout_output})


@app.post("/server/stop")
async def stop_server(request: GameRequest):
    game = request.game
    if game == 'Valheim':
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=host, username=user, password=secret, port=port)
        stdin, stdout, stderr = client.exec_command('docker-compose -f projects/valheim/docker-compose.yml down')

        stderr_output = stderr.read().decode('utf-8')
        stdout_output = stdout.read().decode('utf-8')

        if "Container valheim_server  Stopping" or "" in stderr_output:
            client.close()
            return JSONResponse(content={"status": "Stopped", "message": stderr_output + stdout_output})
        else:
            client.close()
            return JSONResponse(content={"status": "Error", "message": stderr_output + stdout_output})


@app.post("/server/restart")
async def stop_restart(request: GameRequest):
    game = request.game
    if game == 'Valheim':
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(hostname=host, username=user, password=secret, port=port)
        stdin, stdout, stderr = client.exec_command('docker-compose -f projects/valheim/docker-compose.yml restart')

        stderr_output = stderr.read().decode('utf-8')
        stdout_output = stdout.read().decode('utf-8')

        if "Container valheim_server  Restarting" in stderr_output:
            client.close()
            return JSONResponse(content={"status": "Started", "message": stderr_output + stdout_output})
        else:
            client.close()
            return JSONResponse(content={"status": "Error", "message": stderr_output + stdout_output})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
