const { createCar, updateCarDetailsByDriverId, getCarByRego } = require('../repository/carQueries')




async function generateCar(driverId, registration, vehicleMake, vehicleModel, vehicleColour) {
  if (registration == "") {
    return { iserror: true, response: "Please enter your registration" }
  }
  if (vehicleMake == "") {
    return { iserror: true, response: "Please enter your vehicle make" }
  }
  if (vehicleModel == "") {
    return { iserror: true, response: "Please enter your vehicle model" }
  }
  if (vehicleColour == "") {
    return { iserror: true, response: "Please enter your vehicle colour" }
  }

  try {
    registration = registration.toUpperCase();
    vehicleMake = vehicleMake.toUpperCase();
    vehicleModel = vehicleModel.toUpperCase();
    vehicleColour = vehicleColour.toUpperCase();
    await createCar(registration, driverId, vehicleMake, vehicleModel, vehicleColour);
    return { iserror: false, response: "Accepted" }

  } catch {
    return { iserror: true, response: "Error creating car!" }
  }
}

async function updateCarDetails(driverId, rego, vehicleMake, vehicleModel, vehicleColour) {
  if (rego == "") {
    return { iserror: true, response: "Please enter your registration" }
  }
  if (vehicleMake == "") {
    return { iserror: true, response: "Please enter your vehicle make" }
  }
  if (vehicleModel == "") {
    return { iserror: true, response: "Please enter your vehicle model" }
  }
  if (vehicleColour == "") {
    return { iserror: true, response: "Please enter your vehicle colour" }
  }


   rego = rego.toUpperCase();
   vehicleMake = vehicleMake.toUpperCase();
   vehicleModel = vehicleModel.toUpperCase();
   vehicleColour = vehicleColour.toUpperCase();
  await updateCarDetailsByDriverId(driverId, rego, vehicleMake, vehicleModel, vehicleColour)

  return { iserror: false, response: "Accepted" }

}


module.exports = {
  generateCar,
  updateCarDetails
  
}


