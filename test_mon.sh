while true; do 
    RANDOM=$(date +%s%N | cut -b10-19)
    i=$(( $RANDOM % 113 + 1 ))
    echo $i
    curl -X 'POST' \
    'http://127.0.0.1:8000/app-mon-status/c6b7d4f2-bf81-4476-ad04-060561e86a2d' \
    -H 'accept: application/json' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmcm9udHVzZXJAZ21haWwuY29tIiwiZXhwIjoxNjIxNjIxNTkwfQ.SeGsZr-kVv30bmYVLIp8IOnNyygrz6Jy-LW_Z720czk' \
    -H 'Content-Type: application/json' \
    -d '{
    "cpu": "'"$i"'"
    }'
    sleep 1
done