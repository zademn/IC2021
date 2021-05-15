import asyncio

from fastapi import FastAPI
from fastapi import WebSocket
import websockets

app = FastAPI()

ws_b_uri = "ws://localhost:8001/ws_b"


async def forward(ws_a: WebSocket, ws_b: websockets.WebSocketClientProtocol):
    while True:
        data = await ws_a.receive_bytes()
        print("websocket A received:", data)
        await ws_b.send(data)


async def reverse(ws_a: WebSocket, ws_b: websockets.WebSocketClientProtocol):
    while True:
        data = await ws_b.recv()
        await ws_a.send_text(data)
        print("websocket A sent:", data)


@app.websocket("/ws_a")
async def websocket_a(ws_a: WebSocket):
    await ws_a.accept()
    async with websockets.connect(ws_b_uri) as ws_b_client:
        fwd_task = asyncio.create_task(forward(ws_a, ws_b_client))
        rev_task = asyncio.create_task(reverse(ws_a, ws_b_client))
        await asyncio.gather(fwd_task, rev_task)


@app.websocket("/ws_b")
async def websocket_b(ws_b_server: WebSocket):
    await ws_b_server.accept()
    while True:
        data = await ws_b_server.receive_bytes()
        print("websocket B server recieved: ", data)
        await ws_b_server.send_text('{"response": "value from B server"}')