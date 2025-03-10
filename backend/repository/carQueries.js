const { queryDatabase } = require('./db');


async function createCar (registration, driverId, vehicleMake, vehicleModel, vehicleColour) {
   const query = `INSERT INTO car ("registration",  "driverid", "vehiclemake", "vehiclemodel", "vehiclecolour") VALUES ($1, $2, $3, $4, $5) RETURNING *`
   let requirements =  [registration, driverId, vehicleMake, vehicleModel, vehicleColour]
    const response = await queryDatabase(query, requirements)
    return response
  }

  async function deleteCar (driverid) {
    let deleted = 'deleted'
    const query = `UPDATE car
      SET registration = $2
      WHERE driverid = $1;`
    const requirements = [driverid,deleted]
    await queryDatabase(query,requirements)
  }

  
  async function getCarByCarId (carId) {
    const query = `SELECT * FROM car WHERE carid = ${carId}`
    const car = await queryDatabase(query)
    return car[0];
  }

  async function getCarByRego (rego) {
    const query = `SELECT * FROM car WHERE registration = $1`
    reqs = [rego]
    const car = await queryDatabase(query, reqs)
    return car[0];
  }
  
  async function getCarByDriverId (driverId) {
    const query = `SELECT * FROM car WHERE driverid = ${driverId}`
    const car = await queryDatabase(query)
    return car[0];
  }

  async function getCarsByDriverId (driverId) {
    const query = `SELECT * FROM car WHERE driverid = ${driverId}`
    const cars = await queryDatabase(query)
    return cars;
  }
  
  async function updateCarDetailsByDriverId (driverId, rego, vehicleMake, vehicleModel, vehicleColour) {
    query = `UPDATE car SET registration = $2, vehiclemake = $3, vehiclemodel = $4, vehiclecolour = $5 WHERE driverid = $1 RETURNING *`
    requirements =  [driverId, rego, vehicleMake, vehicleModel, vehicleColour]
    const response = await queryDatabase(query, requirements)
    return response
  }

  module.exports = {
    createCar,
    deleteCar,
    getCarByCarId,
    getCarByDriverId,
    getCarsByDriverId,
    updateCarDetailsByDriverId,
    getCarByRego
}