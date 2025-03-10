path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const {getPaypalPayoutTotal,getLatestAccounts,updatePaypalTransferred,createAccountsEntry,getTotalPayouts,getTotalRefunds,getStripeBookedCount,getAkahuBookedCount, updateUserBlacklist, createblacklist, getTotalWithdrawn, getUsersCount} = require('../repository/adminQueries')
const { pauseAccount, resumeAccount } = require('../repository/adminQueries');
const { AkahuClient } = require('akahu');
const { sendPaypalPayouts } = require('./paypalServices');
const { getUserByUserId } = require('../repository/userQueries');
const { getBankAccountByUserID, getPaypalEmail } = require('../repository/payment');

const nodemailer = require('nodemailer');
const { getReport, createReport, getReportedCount } = require('../repository/reportQueries');
const { getRidesByDriverId, changeRideStatus, getRideByRideId, getRegular, createRide, updateGenerate, getRegularNew, getRidesByRegularID } = require('../repository/rideQueries');
const { getDriverByUserId } = require('../repository/driverQueries');
const { getAcceptedRideRequests, getActiveRideRequests, deleteRideRequest, getPassengerRideRequests } = require('../repository/rideBookingQueries');
const { sendNotification } = require('./notificationServices');
const { processRefund } = require('./payServices');
const { deleteOldMessages } = require('../repository/messageQueries');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'admin@trippr.org',
    pass: 'bzgu cqmh uhwi ynrv'
  }
});

async function getDriverLicenceUrl(userId){ //Generates URLs for both licences
  // s3 crap was here
    return null
}


const akahu = new AkahuClient({
    // Configure your app token here and secret here.
    // Both app token and secret are required to complete the auth code exchange
    appToken: process.env.AKAHU_APP_TOKEN,
    appSecret: process.env.AKAHU_APP_SECRET
});
//'adminServices.js')
let onehour = 1000*60*60 //one min temp, change to one hour production
/*setInterval(()=>{
  updateAccounts()
  regenRegular()
  deleteOldMessages()
},onehour)*/


async function regenRegular() {
  let week = 1000*60*60*24*7;
  let month = 1000*60*60*24*30;
  let now = Date.now()
  let day = 1000*60*60*24;
  let monthfromnow = Number(now) + Number(month);
  let regrides = await getRegularNew() //All from rides and regular where regular is still ongoing
 //console.log('all regrides: ',regrides)
  let previous = 0;
  let newstarttimes;
  let starttimes;
 // console.log(regrides)
  for (let element of regrides) {
    //   console.log('inside first for loop')
       if (previous !== element.regularid) { //Only does first ride per regular array
        let rides = await getRidesByRegularID(element.regularid) //Checks if any rides are still scheduled
        let needregen = false;
        if (rides) {
         // let timelist = []
         if(rides.length > 0) {
              rides.sort((a, b) => b.starttime - a.starttime);
                 //Sort largest to smallest
              if (rides[0].starttime < (now + day))
              {
                needregen = true;
              }
            
          }
        }
        if (rides && needregen) {
              starttimes = element.starttimes
              newstarttimes = []
              for (let starttime of starttimes) {      
                if (starttime > monthfromnow) {
                    //Corrupt ride, stop regular
                  await updateRegular(element.regularid,false);
                  break;
                }
             //   console.log('inside second for loop, starttime: ',starttime) //Create new batch of rides 
                let newstart = Number(starttime) + Number(week);
             //   console.log('inside second for loop, new starttime: ',newstart) //Create new batch of rides 
                let originCoordString = `(${element.origincoordinates.x}, ${element.origincoordinates.y})`;
                let destinationCoordString = `(${element.destinationcoordinates.x}, ${element.destinationcoordinates.y})`;
              //  console.log('new ride data: ',element.driverid,element.carid,newstart,element.origin,element.destination,element.duration,element.distance,element.price,element.seats,originCoordString,destinationCoordString,element.regularid)
                createRide(element.driverid,element.carid,newstart,element.origin,element.destination,element.duration,element.distance,element.price,element.seats,originCoordString,destinationCoordString,element.regularid,false,null,false)
                newstarttimes.push(newstart)
              }
              //Update generate
             // console.log('update generate: ',element.regularid,newstarttimes,now)
              updateGenerate(element.regularid,newstarttimes,now)
        //  }
      }
     }
     previous = element.regularid
   }
}

//Runs every 12 hours to create an accounting entry and transfer needed funds to our paypal account for paypal payouts
async function updateAccounts() {  
  //  await sendPaypalPayouts() //Send pending paypal payouts
    //'sendPaypalPayouts resp',resp) 
    let latestAccounts = await getLatestAccounts() // the most recent accounts row
    let onedayago = Date.now() - 1000*60*60*24
        if (latestAccounts && latestAccounts.date !== undefined) {
      if (latestAccounts.date < onedayago) {
    let total_payouts = await getTotalPayouts() //Total credited payouts
    let total_refunds = await getTotalRefunds() //Total refunded payouts
    let total_withdrawn = await getTotalWithdrawn()
    let total_users = await getUsersCount()
  //  let akahu_booked_count = await getAkahuBookedCount() //Total ridebookings via akahu
    let stripe_booked_count = await getStripeBookedCount() //Total ridebookings via stripe
   // let paypalPayoutTotal = await getPaypalPayoutTotal() //Total amount not refunded from paypal payouts
    let now = Date.now()
    //total_payouts.sum,total_refunds.sum,akahu_booked_count.count,stripe_booked_count.count,paypalPayoutTotal.sum)
    createAccountsEntry(now,total_payouts.sum,total_refunds.sum,0,stripe_booked_count.count,0)
    
    const mailOptions = {
      from: 'admin@trippr.org',
      to: 'conal@trippr.org',
      cc: 'tripprupdates@gmail.com',
      subject: 'Accounts',
      html:
      `<html>
      <body>
          <p>Total Users</p>       
          <p>${total_users.count}</p> 
          <p>Total credited payouts</p>       
          <p>${total_payouts.sum}</p>  
          <p>total_refunded payouts</p>   
          <p>${total_refunds.sum}</p>
          <p>Total withdrawn</p>
          <p>${total_withdrawn.sum}</p>      
          <p>stripe_booked_count</p>   
          <p>${stripe_booked_count.count}</p>             
      </body>
      </html>`
  };
  
  transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
          //error);
       console.log('admin mail error',error)
      } else {
          //'Email sent: ' + info.response);
         // return res.status(201).json({ message: 'email sent', messageType: "Accepted" })
      }
  });

      }
  }
  else {
    //Create first entry
    createAccountsEntry(0,0,0,0,0,0)
  }
    
}

async function getPauseOrBlacklistReason(reasonCode){
    let reason = null;
    try{
        reasonCode = parseInt(reasonCode)
    } catch {
        console.log("Failed to parse getPauseORBlacklistedReason code")
        return null
    }
    switch (reasonCode) {
        case 0:
          reason = "Issue with drivers licence, please re-upload and try again. The picture should be clear, with the whole id in frame";
          break;
        case 1:
          reason = "Your account has been temporarily suspended. Please wait until our team service team investigates. We will get back to you."
          break;
        case 2:
          reason = "Your account has been banned. If you believe this was unjustified, email our support team."
          break;
        default:
          reason = null
          break;
      }
    return reason
}

async function processPauseUser(userId, reasonCode) {
    const reasonForPause = await getPauseOrBlacklistReason(reasonCode);
  
    if (!reasonForPause) {
        return {iserror: true, response: reasonCode}
    }
    const res = await pauseAccount(userId, reasonCode)
    if (!res) {
        return {iserror: true, response: "Failed db query"}
    }
    if (reasonCode == 2) {
        const user = await getUserByUserId(userId)
        const bankacc = await getBankAccountByUserID(userId)
        if (bankacc) {
            await createblacklist(userId,user.email,'akahu',bankacc)
        }
        else {
           let paypal = await getPaypalEmail(user.email)
           if (paypal) {
            await createblacklist(userId,user.email,'paypal',paypal)
           }
           else {
            await createblacklist(userId,user.email)
           }
        }
        await updateUserBlacklist(userId)
        return {iserror: false, response: `User ${userId} blacklisted`}
    }
    return {iserror: false, response: `User ${userId} paused`}
} 

async function processResumeUser(userId){
    const res = await resumeAccount(userId)
    if (!res) {
        return {iserror: true, response: "Failed db query"}
    }
    return {iserror: false, response: `User account ${userId} has been resumed`}
}

async function processReportUser(reporterid,reportedid,reportdescription) {
  let report = await getReport(reporterid,reportedid)
  if (report) {
    //User has already reported other user, take no action
    return {ok: false}
  }
  await createReport(reporterid,reportedid,reportdescription)
  let reportedcount = await getReportedCount(reportedid)
  if (reportedcount) {
    if (reportedcount.count > 2) {
      //Cancel all rides
      let driver = await getDriverByUserId(reportedid)
      if (driver) {
        let driverrides = await getRidesByDriverId(driver.driverid) //All ongoing rides for driver
      //  console.log(driverrides)
        if (driverrides.length > 0) {
          for (let ride of driverrides) { 
            await canceldriverride(ride.rideid)
          }
        }
      }
      // cancel all requests
      let passengerrequests = await getPassengerRideRequests(reportedid) 
      if (passengerrequests.length > 0) {
       
        for (let request of passengerrequests) { 
          let trip = await getRideByRideId(request.rideid)
          let notify = "Your trip to " + trip.destination + ", has been cancelled, you will be refunded"
          if (request.requeststatus === 'accepted') {
            await processRefund(request.rideid, request.userid)
          }
          await deleteRideRequest(request.rideid, request.userid) 
          sendNotification(request.userid, "Trip cancelled", notify)
        }
      }
      //Pause / blacklist
      console.log('blacklisting via reportcount breach, check if worked')
      processPauseUser(reportedid,1)
      //in future add email of all user reports and option to review / undo action
    }
  }
  return {ok:true}

}


async function canceldriverride(rideid) {
         await changeRideStatus(rideid, "cancelled")
         let acceptedrequests = await getAcceptedRideRequests(rideid)
         let pendingrequests = await getActiveRideRequests(rideid)
         let trip = await getRideByRideId(rideid)
         let notify = "Your trip to " + trip.destination + ", has been cancelled, you will be refunded"
          if (pendingrequests.length > 0) {
          for (let request of pendingrequests) { 
            await deleteRideRequest(request.rideid, request.userid) 
            sendNotification(request.userid, "Trip cancelled", notify)
          }
        }
          if (acceptedrequests.length !== 0) {
            for (let reques of acceptedrequests) { 
              //Refund user  
              await processRefund(reques.rideid, reques.userid)
              await deleteRideRequest(reques.rideid, reques.userid)
              // Delete / Cancel ride bookings here too so payment is not taken
              sendNotification(reques.userid, "Trip cancelled", notify)
          
            }
          }
  
}

module.exports = {
    processPauseUser,
    processResumeUser,
    processReportUser,
    getPauseOrBlacklistReason,
    getDriverLicenceUrl
}