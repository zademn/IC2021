import asyncio
from models import HealthCheckStatus, HealthCheck, User
from datetime import datetime, timedelta
from mail import simple_send


async def check_db_every_x_seconds(timeout, stuff):
    while True:
        await asyncio.sleep(timeout)
        await stuff()


# don't try this at home
# peak db looping right here
async def clean_late_entries():
    users = await User.all()
    for user in users:
        healthchecks = await HealthCheck.all().filter(user=user)
        if healthchecks != []:
            for health_check in healthchecks:
                hc_status = await HealthCheckStatus.all().filter(health_check=health_check)
                last_entry = hc_status[len(hc_status)-1]

                curr_time = datetime.now()
                # if the check is late ...
                if curr_time > last_entry.next_receive.replace(tzinfo=None):
                    print(
                        f"Check is late for {user.email} with app {health_check.name}, we should've received a check at {last_entry.next_receive.replace(tzinfo=None)}")

                    await simple_send([user.email],
                                      f"{user.email}, your healthcheck for <b>{health_check.name}</b> is late!, we should've received a check at {last_entry.next_receive.replace(tzinfo=None)}.<br>Please investigate!",
                                      subject=f"{health_check.name} health check is late.")

                    # in this case, wait for the next one
                    next_receive = curr_time + \
                        timedelta(minutes=health_check.period +
                                  health_check.grace)

                    health_check_status = await HealthCheckStatus.create(
                        last_received=curr_time,
                        next_receive=next_receive,
                        health_check=health_check
                    )
