const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { getCarByDriverId } = require('../repository/carQueries')
const { createRide, deleteRecentEmptyRides, cancelRecentRegularRides, getRideByRideId } = require('../repository/rideQueries')
const { getUserByDriverId, getUserByUserId } = require('../repository/userQueries')
const {getAverageRating } = require('../repository/reviewQueries')

const { deleteIgnoredRidesRequests } = require('../repository/rideBookingQueries')


//
async function checkSeats(rideInfo, seats) {
    if (!(rideInfo.status === 'scheduled')) {
        return {iserror : true, response : "Ride isn't scheduled"} 
    }
    if(!typeof(seats, Int32Array)){
        return {iserror : true, response : "Seats are not int"}
    }  
    if (isNaN(seats)) {
        return {iserror : true, response : "Seats entered is not a valid number"}
    }
    if (rideInfo.seats <= 0 || seats <= 0 || rideInfo.seats - seats < 0 || seats > 6) {
        return {iserror : true, response : "Problem with number of seats requested"}
    }
    return {iserror: false, response : "Requested seats acceptable"}
}


async function deleteRecentEmptyRidesAndRequests(currTime) {  
    await deleteIgnoredRidesRequests(currTime);
     await cancelRecentRegularRides(currTime)
    await deleteRecentEmptyRides(currTime);
    return null
} 


async function addProfileToRideArray(rideArray,isWantedRideRequest) {
    let userInfo;
    if (!Array.isArray(rideArray) || rideArray.length === 0) {
      //  console.log('empty')
        return rideArray;
    }
    for (let i = 0; i < rideArray.length; i++) {
        try {
            if (rideArray[i].passenger && !isWantedRideRequest) {
                userInfo = await getUserByUserId(rideArray[i].passengerid); //userid stored in driver id for passenger rides
            }
            else {
                userInfo = await getUserByDriverId(rideArray[i].driverid);
            }
            if (userInfo && userInfo.userid) {
                //`${req.protocol}://${req.get('host')}/user/profile_images/${req.file.filename}`;
                rideArray[i].profilePictureUrl = `https://${process.env.serverip}:3001/user/profile_images/${userInfo.profile_image}`;
                rideArray[i].driverName = userInfo.name;
                rideArray[i].driverUserId = userInfo.userid;
                rideArray[i].averagerating = userInfo.averagerating;
            } else {
                rideArray[i].profilePictureUrl = null;
            }
        } catch (error) {
            console.error(`Error processing driver ${rideArray[i].driverid}: ${error.message}`);
        }
    }

    return rideArray;
}

async function addProfileToRequestArray(rideArray) {

    if (!Array.isArray(rideArray) || rideArray.length === 0) {
    //    console.log('empty req')
        return rideArray;
    }

    for (let i = 0; i < rideArray.length; i++) {
        try {
            let user = await getUserByUserId(rideArray[i].userid);
            let ride = await getRideByRideId(rideArray[i].rideid);
            if (user && user.userid) {
                rideArray[i].profilePictureUrl = `https://${process.env.serverip}:3001/user/profile_images/${user.profile_image}`;
                rideArray[i].name = user.name;
                rideArray[i].averagerating = user.averagerating;
                rideArray[i].ride = ride;
            }
        } catch (error) {
            console.error(`Error processing user ${rideArray[i].userid}: ${error.message}`);
        }
    }

    return rideArray;
}

async function removeNewZealand(str) {
    const pattern = ", New Zealand"
    const replacement = ""
    const match =
      typeof pattern === 'string'
        ? pattern
        : (str.match(new RegExp(pattern.source, 'g')) || []).slice(-1)[0];
    if (!match) return str;
    const last = str.lastIndexOf(match);
    return last !== -1
      ? `${str.slice(0, last)}${replacement}${str.slice(last + match.length)}`
      : str;
};

async function filterAddress(str) {
    const regexpReplaceStreetNumbers = /^\d+\w+/; // How it works: ^ = Start of the string. \d = Number [0-9]. + = Repeated values. \w = Alphabetic letter and numbers. Basically if the first character in the string is a digit(and the repeated), when there are no more digits, then any other characters that are trailing.
    const regexpRemovePostcode = /\d+$/;
    let filteredAddress = await str.trim()
    filteredAddress = await removeNewZealand(filteredAddress);
    filteredAddress = await filteredAddress.replace(regexpRemovePostcode, "");

    if (filteredAddress.match(/^\d/)) { 
        if (filteredAddress.charAt(1) == " ") {
            filteredAddress = await filteredAddress.replace(/^\d/, "")
        } else {
            filteredAddress = await filteredAddress.replace(regexpReplaceStreetNumbers, "");            
        }
    }

    return await filteredAddress.trim()
}

async function addRide(driverId, starttime, origin, destination, seats, origincoordinates, destinationcoordinates,price,distance,duration,passenger,passengerid,regularid,flexable) {
    let car;
     if (!passenger) {
     car = await getCarByDriverId(driverId)
    if(!car){
        return {iserror : true, response : "No car associated with driver"}
    }
     }
    if(!typeof(seats, Int32Array)){
        return {iserror : true, response : "Seats are not int"}
    }   
    if (isNaN(seats)) {
        return {iserror : true, response : "Seats entered is not a valid number"}
    }
    if (seats < 1){
        return {iserror : true, response : "Rides have a minimum of 1 seat"}
    }
    if (seats > 6) {
        return {iserror : true, response : "Too many seats entered"}
    }
    const originCoordString = `(${origincoordinates.lat}, ${origincoordinates.lng})`;
    const destinationCoordString = `(${destinationcoordinates.lat}, ${destinationcoordinates.lng})`;
    if (!(duration && distance && price)) {
        return {iserror : true, response : "Problem with duration,distance or price"}
    }

    const tidyOrigin = await filterAddress(origin);

    const tidyDestination = await filterAddress(destination);
    let rideRes;
    if (passenger) {
        rideRes = await createRide(driverId,1, starttime, tidyOrigin, tidyDestination, duration, distance, price, seats, originCoordString, destinationCoordString,regularid,passenger,passengerid,flexable)
    }
    else {
        rideRes = await createRide(driverId, car.carid, starttime, tidyOrigin, tidyDestination, duration, distance, price, seats, originCoordString, destinationCoordString,regularid,passenger,passengerid,flexable)
    }
   
    if (rideRes.code){
        return {iserror : true, response : "Failed, Ride - Database Error"}
    }
    
    return {iserror : false, response : "Accepted"}
}
module.exports = {
    addRide,
    addProfileToRideArray,
    addProfileToRequestArray,
    deleteRecentEmptyRidesAndRequests,
    checkSeats
}