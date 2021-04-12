from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
import psutil

app = FastAPI()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <div>
            <div id="chart"></div>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
            <script>
                TESTER = document.getElementById('chart');
                var ws = new WebSocket("ws://localhost:8000/ws");
                var cnt = 0;
                cnt_threshold = 10;
                ws.onmessage = function(event) {
                    console.log(event.data);
                    var ceva = JSON.parse(event.data);
                    console.log(ceva.cpu);
                    Plotly.extendTraces(TESTER, {y: [[ceva.cpu]]}, [0]);

                    cnt++;
                    
                    if (cnt > cnt_threshold) {
                        Plotly.relayout(TESTER, {
                            xaxis: {
                                range: [cnt - cnt_threshold, cnt]
                            }
                        });
                    }
                };
                Plotly.plot(TESTER, [{
                    y: [0],
                    type: 'line',
                }]);
            </script>
        </div>
    </body>
</html>
"""


@app.get("/")
async def get():
    return HTMLResponse(html)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        # data = await websocket.receive_text()
        cpu_perc = psutil.cpu_percent(interval=1)
        await websocket.send_json({"cpu": cpu_perc})
