export type SensorName = string
// a date without the hour
export type DateWithoutTime = string

// the data that each sensor holds
export type Statistics = {
  min: number | null
  max: number | null
  sum: number
  count: number
}

// the statistics for every day and all the samples from this day
export type SensorDataOfSpecificDate = {
  statistics: Statistics
  allDataOfSensor: number[]
}

// all the data for each sensor, for all the days and for a week
export type SensorStatisticsByDateAndWeek = {
  // a map with the days as keys and the all the data from the days as value
  statisticsByDate: Map<DateWithoutTime, SensorDataOfSpecificDate>
  weekStatistics: Statistics
}

// the statistics for every day that combines all the data from the sensors and the data for a week
export type AllSensorsData = {
  // a map with the days as keys and the all the data from the days (combines from all the sensors) as value
  statisticsByDate: Map<DateWithoutTime, Statistics>
  weekStatistics: Statistics
}

// the data that all sensor sends, its name and a sample
export type NewSensorRequestBody = {
  sensorName: string
  data: number
}
