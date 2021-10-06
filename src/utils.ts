import Fastify from 'fastify'
import {
  Statistics,
  AllSensorsData,
  DateWithoutTime,
  NewSensorRequestBody,
  SensorDataOfSpecificDate,
  SensorStatisticsByDateAndWeek,
  SensorName,
} from './types'

// example: 2021-10-06T08:47:28.712Z -->> '2021-10-06'
export function getDateWithoutTime(date: Date): string {
  return date.toISOString().split('T')[0]
}

// creates statistics for a sensor with its data
export function initStatistics(newSensorData: number): Statistics {
  return {
    count: 1,
    sum: newSensorData,
    min: newSensorData,
    max: newSensorData,
  }
}

// update the statistics when getting a new data from a sensor
export function updateStatistics(statistics: Statistics, newSensorData: number): void {
  statistics.count++
  statistics.sum += newSensorData
  if (statistics.min === null || newSensorData < statistics.min) {
    statistics.min = newSensorData
  }
  if (statistics.max === null || statistics.max < newSensorData) {
    statistics.max = newSensorData
  }
}

// update all sensors data when getting a new data from a sensor
export function updateAllSensorsData(
  allSensorsData: AllSensorsData,
  newSensorData: number,
  dateNow: DateWithoutTime,
): void {
  const sensorsDateInSpecificDate = allSensorsData.statisticsByDate.get(dateNow)

  updateStatistics(allSensorsData.weekStatistics, newSensorData)

  if (!sensorsDateInSpecificDate) {
    allSensorsData.statisticsByDate.set(dateNow, initStatistics(newSensorData))
  } else {
    updateStatistics(sensorsDateInSpecificDate, newSensorData)
  }
}

// update the sensor's data when getting new data
export function updateSensorData(
  sensorDataBySensorName: Map<SensorName, SensorStatisticsByDateAndWeek>,
  sensorName: string,
  newSensorData: number,
  dateNow: DateWithoutTime,
): void {
  // getting all the data from the sensor
  const sensorData = sensorDataBySensorName.get(sensorName)
  // if there is no data on this sensor
  if (sensorData === undefined) {
    const dataByDate = new Map<DateWithoutTime, SensorDataOfSpecificDate>()
    dataByDate.set(dateNow, {
      statistics: initStatistics(newSensorData),
      allDataOfSensor: [newSensorData],
    })
    sensorDataBySensorName.set(sensorName, {
      weekStatistics: initStatistics(newSensorData),
      statisticsByDate: dataByDate,
    })
    // if there is data on this sensor
  } else {
    updateStatistics(sensorData.weekStatistics, newSensorData)
    const sensorDataInSpecificDate = sensorData.statisticsByDate.get(dateNow)

    // if there is no data on this sensor in this date
    if (!sensorDataInSpecificDate) {
      sensorData.statisticsByDate.set(dateNow, {
        statistics: initStatistics(newSensorData),
        allDataOfSensor: [newSensorData],
      })
      // if there is data on this sensor in this date
    } else {
      updateStatistics(sensorDataInSpecificDate.statistics, newSensorData)
      sensorDataInSpecificDate.allDataOfSensor.push(newSensorData)
    }
  }
}

// get the date before 'daysAgo' days
export function getDateWithoutTimeBefore(date: Date, daysAgo: number): string {
  const copy = new Date(date)
  copy.setDate(copy.getDate() - daysAgo)
  return getDateWithoutTime(copy)
}

// update the week statistics for a sensor with the 'right' 7 days ago
export function updateWeekStatisticsForEachSensor(
  sensorDataBySensorName: Map<SensorName, SensorStatisticsByDateAndWeek>,
): void {
  for (const value of sensorDataBySensorName.values()) {
    const { weekStatistics, statisticsByDate } = value
    // initiate the data for the 'previous' week
    weekStatistics.count = 0
    weekStatistics.sum = 0
    weekStatistics.min = null
    weekStatistics.max = null
    for (let i = 1; i <= 7; i++) {
      // create `date.now` - `i` days
      const dateWithoutTime = getDateWithoutTimeBefore(new Date(), i)
      const sensorData = statisticsByDate.get(dateWithoutTime)
      // add the data of this previous day to the sensor data
      if (sensorData) {
        weekStatistics.count += sensorData.statistics.count
        weekStatistics.sum += sensorData.statistics.sum
        if (
          weekStatistics.min === null ||
          (sensorData.statistics.min !== null && weekStatistics.min < sensorData.statistics.min)
        ) {
          weekStatistics.min = sensorData.statistics.min
        }
        if (
          weekStatistics.max === null ||
          (sensorData.statistics.max !== null && sensorData.statistics.max < weekStatistics.max)
        ) {
          weekStatistics.max = sensorData.statistics.max
        }
      }
    }
  }
}

// update the week statistics for all the sensors with the 'right' 7 days ago
export function updateWeekStatisticsForAllSensors(allSensorsData: AllSensorsData): void {
  // initiate the data for the 'previous' week
  allSensorsData.weekStatistics.count = 0
  allSensorsData.weekStatistics.sum = 0
  allSensorsData.weekStatistics.min = null
  allSensorsData.weekStatistics.max = null
  for (let i = 1; i <= 7; i++) {
    // create `date.now` - `i` days
    const dateWithoutTime = getDateWithoutTimeBefore(new Date(), i)
    const statistics = allSensorsData.statisticsByDate.get(dateWithoutTime)
    // add the data of this previous day to the sensor data
    if (statistics) {
      allSensorsData.weekStatistics.count += statistics.count
      allSensorsData.weekStatistics.sum += statistics.sum
      if (
        allSensorsData.weekStatistics.min === null ||
        (statistics.min !== null && allSensorsData.weekStatistics.min < statistics.min)
      ) {
        allSensorsData.weekStatistics.min = statistics.min
      }
      if (
        allSensorsData.weekStatistics.max === null ||
        (statistics.max !== null && statistics.max < allSensorsData.weekStatistics.max)
      ) {
        allSensorsData.weekStatistics.max = statistics.max
      }
    }
  }
}
