const { getDriverByDriverId, updateRidesDrivenByDriverId} = require('../repository/driverQueries')
const { createReceipt, getReceiptByRide } = require('../repository/receiptQueries')
const { getAcceptedRideRequests } = require('../repository/rideBookingQueries')
const { updatePriceByRideId, getRideByRideId } = require('../repository/rideQueries')
const { getUserByDriverId, getUserByUserId, updateRidesCompletedByUserId } = require('../repository/userQueries')

function getPassengerStripePay(driverPay) {
  let total;
//  const driveramount = Math.round(driverPay)
  const fee = driverPay * 0.12
  if (fee < 2) {
      total = driverPay + 2
      return total
  }
  else if (fee > 10) {
      total = driverPay + 10
      return total
  }
  else {
      let rawtotal = driverPay + fee
      total = rawtotal.toFixed(2)
      let totalParsed = parseFloat(total)
      return totalParsed
  }
}

async function generateReceipts(rideid){
  //Check if receipts already made
  let receipts = await getReceiptByRide(rideid)
  //'receipts response',receipts)
  if (!receipts) {
  let currentRide = await getRideByRideId(rideid)
  //passengersRideBooking
  const bookings = await getAcceptedRideRequests(currentRide.rideid)

  // Get user by driver id.
  const driverUserInfo = await getUserByDriverId(currentRide.driverid)
  let driverPay = 0
  let passengers = 0
  for (let i = 0; i < bookings.length; i++) {
    //Passenger Receipts
     let bookingprice = getPassengerStripePay(bookings[i].price)
     updateRidesCompletedByUserId(bookings[i].userid)
     await createReceipt(currentRide.rideid, bookings[i].userid, currentRide.starttime, bookings[i].requestedorigin, bookings[i].requesteddest, bookings[i].seatsrequested,bookingprice,false) 
    driverPay += bookings[i].price
    passengers += bookings[i].seatsrequested
  }
  const driverInfo = await getDriverByDriverId(currentRide.driverid)
  let driverRidesDriven = driverInfo.ridesdriven + 1
  await updateRidesDrivenByDriverId(currentRide.driverid, driverRidesDriven)
  //await updatePriceByRideId(currentRide.rideid, driverPay) 
  //Driver Receipt
  updateRidesCompletedByUserId(driverUserInfo.userid)
  await createReceipt(currentRide.rideid, driverUserInfo.userid, currentRide.starttime, currentRide.origin, currentRide.destination,passengers,driverPay,true)

}
}

module.exports = {
  generateReceipts
}