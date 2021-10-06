Run Project:
1. Install nodejs
2. `npm install`
3. `npm run start`

Routes:

1. GET http://127.0.0.1:8080/
```
curl --location --request GET 'http://127.0.0.1:8080/'
```
2. GET http://127.0.0.1:8080/get-all-sensors-statistics-by-week
```
curl --location --request GET 'http://127.0.0.1:8080/get-all-sensors-statistics-by-week'
```
3. GET http://127.0.0.1:8080/get-sensor-statistics-by-week/:sensorName
```
curl --location --request GET 'http://127.0.0.1:8080/get-sensor-statistics-by-week/:sensorName'
```
4. POST http://127.0.0.1:8080/add-sensor-data BODY: {sensorName: string, data: number}
```
curl --location --request POST 'http://localhost:8080/add-sensor-data' \
--header 'Content-Type: application/json' \
--data-raw '{
    "sensorName": "sensor2",
    "data": 100
}'
```