import Fastify from 'fastify'
// import all the types
import {
  AllSensorsData,
  DateWithoutTime,
  NewSensorRequestBody,
  SensorStatisticsByDateAndWeek,
  SensorName,
  Statistics,
} from './types'
// import all the functions
import {
  getDateWithoutTime,
  updateAllSensorsData,
  updateSensorData,
  updateWeekStatisticsForAllSensors,
  updateWeekStatisticsForEachSensor,
} from './utils'

async function main() {
  const app = Fastify({
    logger: {
      prettyPrint: true,
      level: 'error',
    },
  })

  // initiate 'local db'
  const statisticsOfEachSensor = new Map<SensorName, SensorStatisticsByDateAndWeek>()

  const statisticsOfAllSensors: AllSensorsData = {
    statisticsByDate: new Map<DateWithoutTime, Statistics>(),
    weekStatistics: {
      count: 0,
      sum: 0,
      max: null,
      min: null,
    },
  }

  // the time in ms for the function to be updated
  const msInOneSecond = 1000
  const runEachDay = msInOneSecond * 60 * 60 * 24

  // runs this functions for every fixed time, update week statistics from 7 days ago
  setInterval(function updateWeekStatistics() {
    updateWeekStatisticsForEachSensor(statisticsOfEachSensor)
    updateWeekStatisticsForAllSensors(statisticsOfAllSensors)
  }, runEachDay)

  app.get(`/`, (reqtime, res) => {
    res.send(`${new Date()} - this is a server for collecting data from sensors`)
  })

  // gets a new data from a sensor
  app.post<{
    // the name of the sensor and its sample
    Body: NewSensorRequestBody
  }>(`/add-sensor-data`, (req, res) => {
    const dateWithoutTime = getDateWithoutTime(new Date())
    const newSensorData = req.body.data
    updateSensorData(statisticsOfEachSensor, req.body.sensorName, newSensorData, dateWithoutTime)
    updateAllSensorsData(statisticsOfAllSensors, newSensorData, dateWithoutTime)

    res.send(`The data: ${req.body.data} from sensor: ${req.body.sensorName} was recieved`)
  })

  // the params and the reply's structure
  app.get<{
    Params: {
      sensorName: string
    }
    Reply:
    | {
      sensorName: string
      avg: number
      max: number
      min: number
    }
    | {
      sensorName: string
      error: string
    }
    // the reply
  }>(`/get-sensor-statistics-by-week/:sensorName`, (req, res) => {
    const { sensorName } = req.params
    const sensorDataByDate = statisticsOfEachSensor.get(sensorName)
    // if the sensor's name exists (already got data from it)
    if (!sensorDataByDate) {
      res.status(400)
      res.send({
        sensorName,
        error: `no data on this sensor`,
      })
      // there is data from the sensor
    } else {
      res.send({
        sensorName,
        // @ts-ignore
        max: sensorDataByDate.weekStatistics.max,
        // @ts-ignore
        min: sensorDataByDate.weekStatistics.min,
        avg: sensorDataByDate.weekStatistics.sum / sensorDataByDate.weekStatistics.count,
      })
    }
  })

  // the reply's structure
  app.get<{
    Reply: {
      avg: number | null
      max: number | null
      min: number | null
    }
    // the reply
  }>(`/get-all-sensors-statistics-by-week`, (req, res) => {
    const avg =
      statisticsOfAllSensors.weekStatistics.sum !== null && statisticsOfAllSensors.weekStatistics.count !== null
        ? statisticsOfAllSensors.weekStatistics.sum / statisticsOfAllSensors.weekStatistics.count
        : null
    res.send({
      max: statisticsOfAllSensors.weekStatistics.max,
      min: statisticsOfAllSensors.weekStatistics.min,
      avg,
    })
  })

  const address = await app.listen(8080)

  console.log(`server listening on: ${address}`)
}

main()
