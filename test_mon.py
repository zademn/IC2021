import psutil
import time
import requests
import json
url = "http://127.0.0.1:8000/app-mon-status/c6b7d4f2-bf81-4476-ad04-060561e86a2d"
while True:
    cpu = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory().percent
    print(memory)
    time.sleep(2)
    r = requests.post(url, data=json.dumps({"cpu": cpu, 'memory': memory}), headers={'accept': 'application/json',
                                                                                     'Content-Type': 'application/json'})
    print(r.json)
