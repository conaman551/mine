
const {  getTrueAvailableRides } = require('../repository/rideQueries')
const { calcOriginDistance, calcDestDistance } = require('../repository/locationQueries');
const googleAPIKey = process.env.googleAPIKey


/* Legacy getNearbyRidesFromCoords **should test speed difference with postgres
const prunedList = []
  const nearbyRidesList = []
  const rideList = await getTrueAvailableRides();
  for (let i = 0; i < rideList.length; i++) { 
    if (rideList[i].driverid != passengersDriverId) {
      let originGeo = rideList[i].origincoordinates
      try {
        let distance = await calculateCoordinatesDistance(lat,lng, originGeo.x, originGeo.y)
        if (distance < 40){
          rideList[i].userDistance = distance
          nearbyRidesList.push(rideList[i])
        }
      } catch {
        console.log("Failed to calculate distance between", rideList[i].origin, "and user")
        //placeCoords, originGeo)
      }
    }
  }
   */



// Gathers a list of rides which start close to the given coordinates
//Closesness = less than 50kms
//Developer - Michael
async function getNearbyRidesFromCoords(lat,lng)  {
  const nearbyRidesList = await calcOriginDistance(lat,lng)
  const prunedList = []
 
  if (nearbyRidesList.length > 50) {
    for (let i = 0; i < 50; i++) {
      prunedList.push(nearbyRidesList[i])
    }
    return {iserror: false, response: prunedList}
  }
  return {iserror: false, response: nearbyRidesList}
}
//Conal - Gathers a list of rides that go to or near to a place, 25km radius
async function getRidesNearDestination(lat,lng)  {
  const prunedList = []
  const nearbyRidesList = await calcDestDistance(lat,lng)
  //Limits results to 30
  if (nearbyRidesList.length > 50) {
    for (let i = 0; i < 50; i++) {
      prunedList.push(nearbyRidesList[i])
    }
    return {iserror: false, response: prunedList}
  }
  return {iserror: false, response: nearbyRidesList}
}


//Gathers a list of rides which start close to the requestPickup and requestDropOff locations
//Developer Conal, 
//Closesness = **pure cast a net** less than 20% of the requested trip length  (between requestOrigin/tripOrigin, requestDestination/tripDestination)
//This function should return to the main search function, Cast a net especially important in cities as <50km will give every trip. 
//Developer - Michael
async function getRidesByPassengersPlaces(passengerOriginCoordinates, passengerDestinationCoordinates){
  //passengerCoordinates are returned from google, as such in lat/lng form
  //Geospatial data in database is stored as x/y
  const nearbyRidesList = []
  const rideList = await calcOriginDistance(passengerOriginCoordinates.lat, passengerOriginCoordinates.lng)
  // Dev Conal, just moved this outside the for loop
  const requestedTripDistance = await calculateCoordinatesDistance(passengerOriginCoordinates.lat, passengerOriginCoordinates.lng, passengerDestinationCoordinates.lat, passengerDestinationCoordinates.lng)
  //"Requested trip distance is ", requestedTripDistance)
  for (let i = 0; i < rideList.length; i++) {
    const rideDestinationCoordinates = rideList[i].destinationcoordinates
      try {
        if (rideList[i].distancex < requestedTripDistance * 0.2){  // for example if I want to travel 60km from grey lynn to wellsford, this finds trips departing with 0.2 * 60km = 12km from me. If from Auck uni to Albany, roughly all trips within 0.2*15km = 3km of university
          let dropOffDistance = await calculateCoordinatesDistance(passengerDestinationCoordinates.lat, passengerDestinationCoordinates.lng, rideDestinationCoordinates.x, rideDestinationCoordinates.y)
          if (dropOffDistance < requestedTripDistance * 0.2){
            nearbyRidesList.push(rideList[i]);
          }
        }
      } catch (error){
        console.log("Error", error)
      }
  }

  nearbyRidesList.sort(function(a, b) {
    if (a[1] == b[1]) {
      return a[2] - b[2];
    }
    return a[1] - b[1];
    });

  return {iserror: false, response: nearbyRidesList}
}

function shuffleArray(array) {
   for (let i = array.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [array[i], array[j]] = [array[j], array[i]]; 
     } 
     return array; 
    }

async function getAllRides() {
  let reducedList = [];
  let prunedList = [];
  let rideList = await getTrueAvailableRides();
  let shuffledTrips;
  if (rideList.length > 300) {
    for (let i = 0; i < 300; i++) {
      reducedList.push(rideList[i])
    }
    shuffledTrips = shuffleArray(reducedList)
  }
  else {
    shuffledTrips = shuffleArray(rideList)
  }
  //Limit returned results to 50
  if (shuffledTrips.length > 50) {
  for (let i = 0; i < 50; i++) {
    prunedList.push(shuffledTrips[i])
  }
  return prunedList
  }
  else {
    return shuffledTrips
  }
}

//Calculates the distance between two given points
// Developer - Michael
async function calculateCoordinatesDistance(passLat, passLng, rideLat, rideLng){
  
  // Formula from https://www.movable-type.co.uk/scripts/latlong.html

  const R = 6371e3; // metres
  const phi1 = passLat * Math.PI/180; // phi, lambda in radians
  const phi2 = rideLat * Math.PI/180;
  const changeInLambda = (rideLng-passLng) * Math.PI/180;
  const x = (changeInLambda) * Math.cos((phi1 + phi2)/2);
  const y = (phi2-phi1);
  const distance = Math.round(Math.sqrt(x*x + y*y) * R);
  
  return distance
}


//Returns the distance and time estimates for a journey. Used in ride creation. Cheaper than using directions.
// Developer - Michael
async function getDistanceMatrix(origin, destination, departureTime){
  try {
  const distMatrixFetch = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?departure_time=${departureTime}&traffic_model=best_guess&destinations=${destination.lat},${destination.lng}&origins=${origin.lat},${origin.lng}&key=${googleAPIKey}`);
  
  if (!distMatrixFetch.ok) {
    return null
  }
  const distanceMatrix = await distMatrixFetch.json();
  return distanceMatrix
  } catch (e) {
    console.log("Error in getDistanceMatrix", e)
    return null
  }
}

//Converts from human readible time to computer time.
async function calculateTimeInSeconds(time){
  try {
  
  let splitTime = time.split(" ")
  let startDDMMYY = splitTime[0].split("/");
  let splitHHMM = splitTime[1].split(":")
  let splitHH = parseInt(splitHHMM[0])
  if (splitTime[2] == "PM"){
      if (!isNaN(splitHH)){
          if (splitHH != 12) {
              splitHH += 12
          }
      } else {
          return {iserror : true, response : "Error calculating start time"}
      }
  } 
  if (splitHH == 12 && splitTime[2] == "AM"){
      splitHH = 0
  }
  splitHH += 13 //Account for NZ time zone +13 hrs, newDate is based off GMT. 

  let newStartTime = new Date(startDDMMYY[2], startDDMMYY[1], startDDMMYY[0], splitHH, splitHHMM[1])

  if (isNaN(newStartTime)){
    //"Calculating route with default start time")
      newStartTime = "now"
  } else {
    newStartTime = newStartTime.getTime()
  }
  return newStartTime
  } catch (e) {
    return "now" //Google takes unix time, or "now"
  }
}

//Developer - Michael
//Calculates the duration/distance/price
async function calculateDurationDistancePrice(startTime, origin, destination){

    let startTimeInSecs = await calculateTimeInSeconds(startTime)
    if (!startTimeInSecs) {
      console.log(startTimeInSecs)
      return { iserror: true, data: "Problem calculating time"}
    }

    let data = await getDistanceMatrix(origin, destination, startTimeInSecs)

    ////"Printing createRide - distance data", data)
    
    if (data == null){
      return { iserror: true, data: "Problem getting location information"}
    }
    if (data.destination_addresses[0] == '') {
      //"Destination does not exist")
      return { iserror: true, data: "Destination could not be found"}
    }
    if (data.origin_addresses[0] == '') {
      //"Origin does not exist")
      return { iserror: true, data: "Origin could not be found"}
    }
    let distance;
    let duration;
    try {
      duration = data.rows[0].elements[0].duration.text
      distance = Math.round(data.rows[0].elements[0].distance.value / 1000)
    } catch {
      return { iserror: true, data: "Problem calculating route, Check starting and end locations."}
    }
  
    let estimatedPrice = await calculatePrice(distance)

  return { iserror: false, data: [duration, distance, estimatedPrice, data.origin_addresses[0], data.destination_addresses[0]] }
}

//Developer - Michael
//Calculates the price of the trip
async function calculatePrice(distance){
  // Fuel Eco = 9.2L per 100km == 0.092 per 1km
  // Fuel Price = $3.1 per liter
  let averageFuelPrice = 3.1
  let estimatedFuelUsed = distance * 0.14
  let estimatedPrice = Math.round(estimatedFuelUsed * averageFuelPrice / 3)//4 People per trip, Conal wants this to be for the social aspect too, not to make money for a driver.
  //Conal - I made it so 3 people is enough to cover fuel, if they have four then bonus for the driver (might consider going to 2 or 2.5 later as full car trips are likely to be rare).
  if (estimatedPrice < 5){
    estimatedPrice = 5
  }
  return estimatedPrice
}


// Conal - Commented out returns of redundant code.

module.exports = {
  getDistanceMatrix,
  calculateDurationDistancePrice,
  getNearbyRidesFromCoords,
  getRidesNearDestination,
  getRidesByPassengersPlaces,
  getAllRides
}

