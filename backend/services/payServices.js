
path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { getRideRequest, changePaidStatus, addTransactionId } = require('../repository/rideBookingQueries')
const { updateRideIsCompleted, recentlyCompleted, getRideByRideId, updateRidesSetCompleted } = require('../repository/rideQueries');
const { getUserByDriverId, getUserByUserId, creditUserAccount } = require('../repository/userQueries');
const { deleteRecentEmptyRidesAndRequests, checkSeats } = require('../services/rideServices')
const { getStripeIdByUserID, getValidPayouts, getPayout, setPayoutRefunded, creditDriver, createPayout, setPayoutCredited, getAkahuIdByUserID, getAkahuTokenByUserID, addAkahuId, addBankAccount, getBankAccountByUserID, getAkahuHook } = require('../repository/payment')
const { sendNotification } = require('./notificationServices');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
//const stripe = Stripe(process.env.stripeTESTKEY);
const stripe = Stripe(process.env.stripeLIVEKEY);
const { AkahuClient } = require('akahu');
const { generateReceipts } = require('./receiptServices');

const akahu = new AkahuClient({
    // Configure your app token here and secret here.
    // Both app token and secret are required to complete the auth code exchange
    appToken: process.env.AKAHU_APP_TOKEN,
    appSecret: process.env.AKAHU_APP_SECRET
});

const transporter = nodemailer.createTransport({ //Sends us an email on server start, so we know if it crashes
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'trippr.general@gmail.com',
        pass: 'hnbg kavd zlmh zloq'
    }
});
const mailOptions = {
    from: 'trippr.general@gmail.com',
    to: 'trippr.verify@gmail.com',
    subject: 'Server started',
    text: `the server has restarted`
}
transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        //error);
        return null
    } else {
        //'Email sent: ' + info.response);
        return null
    }
});
//One minute for testing
//setInterval(processRecentRides, 1000 * 60 * 30); //Runs every 24 hours, deletes empty completed rides and ignored requests.

//COmmented out creditdrivers until DB and payment repository is updated
//setInterval(creditDrivers, 1000 * 60 * 30);// Runs every hour for testing purposes, change to 6 hours when live, credits driver, with valid (undisputed not refunded) payouts, see function for more details
//'payServices.js')

/**THIS Function WILL MOVE ACTUAL MONEY dont run it unless testing payments*/
/**THIS Function WILL MOVE ACTUAL MONEY dont run it unless testing payments*/
async function testPayment() {
    /**THIS Function WILL MOVE ACTUAL MONEY dont run it unless testing payments*/
    let sender = 1 //Userid
    let reciever = 2 //Userid
    let amount = 5
    const senderToken = await getAkahuTokenByUserID(sender)
    const recieverToken = await getAkahuTokenByUserID(reciever)
    let sender_bank_account = ''
    let reciever_bank_account = ''
    let recievername = ''
    if (!senderToken || !recieverToken) {
        //'no akahu account connected')
        return null
    }
    //must be let to ressign string after null response
    let senderId = await getAkahuIdByUserID(sender)
    let recieverId = await getAkahuIdByUserID(reciever)
    if (!senderId) {
        const accounts = await akahu.accounts.list(senderToken)
        //'accounts')
        //accounts)
        if (accounts) {
            senderId = accounts[0]._id
            sender_bank_account = accounts[0].formatted_account
            //status = accounts[0].status ('active' if still connected)
            //available = accounts[0].balance.available (available balance)
            // can also pull their full name and balance from akahu with: accounts[0].meta.holder and accounts[0].balance.available
            await addAkahuId(senderId, sender)
            await addBankAccount(sender_bank_account, sender)
        }
        else {
            //'akahu payment error')
        }

    }
    if (!recieverId) {
        const accounts = await akahu.accounts.list(recieverToken)
        //'accounts')
        //accounts)
        if (accounts) {
            recieverId = accounts[0]._id
            reciever_bank_account = accounts[0].formatted_account
            recievername = accounts[0].meta.holder
            // can also pull their full name and balance from akahu with: accounts[0].meta.holder and accounts[0].balance.available
            await addAkahuId(recieverId, reciever)
            await addBankAccount(reciever_bank_account, reciever)
        }
        else {
            //'akahu payment error')

        }
    }
    else {
        reciever_bank_account = await getBankAccountByUserID(reciever)
        let user = await getUserByUserId(reciever)
        recievername = user.name
    }
    const resp = await payWithAkahuTEST(amount, senderId, senderToken, reciever_bank_account, recievername)
    //'test response')
    //resp)
    if (resp) {
        //'paid success')
    }
    else {
        //'akahu attempt payment failed')
        //resp)
    }
}

/*async function checkTransactionId(combinedPrice, id) {
    const totalPrice = await getPassengerStripePay(combinedPrice)
    const {paymentIntent} = await stripe.retrievePaymentIntent(clientSecret or id);

    if (paymentIntent && paymentIntent.status === 'succeeded') { //Not sure of succeeded is the correct status...
      if (paymentIntent.amount_capturable == totalPrice)
        return true
    }
    return false
}*/
//Takes seats * seat price as the input parameter
async function getPassengerStripePay(driverPay) {
    let total;
    const driveramount = Math.round(driverPay * 100)
    const fee = Math.round(driverPay * 0.12 * 100)
    if (fee < 200) {
        total = driveramount + 200
        return total
    }
    else if (fee > 1000) {
        total = driveramount + 1000
        return total
    }
    else {
        total = driveramount + fee
        return total
    }
}

async function getPassengerAkahuPay(driverPay) {
    let totalRaw;
    let total;
    const fee = driverPay * 0.09
    if (fee < 2)  //These shouldnt need rounding as we just add an int to seats*price
    {
        total = driverPay + 2
        return total
    }
    else if (fee > 10) {
        total = driverPay + 10
        return total
    }
    else {
        totalRaw = driverPay + fee
        total = totalRaw.toFixed(2)
        let totalParsed = parseFloat(total) // Javascript is whack and makes a string when you round with .toFixed()
        return totalParsed
    }
}

//This, is called from websocket accept request, finalises payments which have a hold and charges payments from saved cards and akahu accounts
async function processAcceptRequest(rideId, userId, requestedseats,adminemail) {
    
    //const passengerStripeId = await getStripeIdByUserID(userId)
    const ride = await getRideByRideId(rideId)
    let iserror, response = await checkSeats(ride, requestedseats)
    if (iserror) {
        return { message: response, messageType: "InputError" }
    }
    //getBooking
    const request = await getRideRequest(rideId, userId)
    const paymentType = request.paymenttype
    //Moved price calculation here so its not being re-run for each method + consistency
    const driverPay = Number(request.price) //**Very important that price comes from booking instead of ride
    const stripePay = await getPassengerStripePay(driverPay) // 1.12 = 12% margin for app, stripe and GST.
    const akahuPay = await getPassengerAkahuPay(driverPay)   // 1.09 = 9% margin for app, akahu and GST
    //'amount stripe', stripePay)
    //'amount akahu', akahuPay)
    if (adminemail === 'conal@trippr.org') {
        //create payout
        createPayout(userId, ride.driverid, rideId, ride.starttime, driverPay)
        //Update booking paid status
        changePaidStatus(rideId, userId)
        return { ok: true }
    }
    switch (paymentType) {
        case "stripe":
            const intent = await stripe.paymentIntents.capture(request.paymentid)
            //intent)
            if (intent && intent.status === 'succeeded') {
                //Finalise the one-off payment intent
                //Change booking status to paid
                createPayout(userId, ride.driverid, rideId, ride.starttime, driverPay)
                changePaidStatus(rideId, userId)
                return { ok: true }
            }
            else {
                return { ok: false }
            }
        case "stripesave":
            const response = await savedStripePayment(rideId, userId, requestedseats, stripePay)
            //console.log(response)
            if (response)
            {
              if (response.status === 'succeeded') {
                //'stripe saved success')
                await addTransactionId(response.id, userId, rideId)
                //create payout
                createPayout(userId, ride.driverid, rideId, ride.starttime, driverPay)
                //Update booking paid status
                changePaidStatus(rideId, userId)
                return { ok: true }
            }
            else {
                //'saved stripe payment failed')
                return { ok: false }
            }
          }
          else {
            return { ok: false }
          }
        case "akahu":
            const akahuToken = await getAkahuTokenByUserID(userId)
            let bank_account = ''
            if (!akahuToken) {
                //'no akahu account connected')
                //Let user know payment failed
                return { ok: false }
            }
            let akahuId = await getAkahuIdByUserID(userId)
            if (!akahuId) {
                const accounts = await akahu.accounts.list(akahuToken)
                if (accounts) {
                    akahuId = accounts[0]._id
                    bank_account = accounts[0].formatted_account
                    // can also pull their full name and balance from akahu with: accounts[0].meta.holder and accounts[0].balance.available
                    await addAkahuId(akahuId, userId)
                    await addBankAccount(bank_account, userId)
                }
                else {
                    //'akahu payment error')
                    return { ok: false }
                }
            }
            const resp = await payWithAkahu(akahuPay, akahuId, akahuToken)
            if (resp.ok) {
                createPayout(userId, ride.driverid, rideId, ride.starttime, driverPay)
                //Update booking paid status
                //'Booking accept akahu payment success')
                changePaidStatus(rideId, userId)
                return { ok: true }
            }
            else {
                //'akahu attempt payment failed')
                //resp)
                return { ok: false }
            }
        // Check response here
    }
}

async function processRefund(rideid, userid) {
    let user = await getUserByUserId(userid)
    let reques = await getRideRequest(rideid, userid)
    let payout = await getPayout(rideid, userid)
    if (user.email === 'conal@trippr.org') { //admin acc doesnt pay
        setPayoutRefunded(rideid, userid) //sets refunded = true
                //notifyuser
        sendNotification(userid, "Trip booking refunded", `$${payout.amount} has been sent to your connected account`)
        return { ok: true }
    }
    let success = false
    if (payout) {
        if (payout.credited === false && payout.refunded === false) {
            if (reques.paymenttype === 'akahu') {
                let akahuToken = await getAkahuTokenByUserID(userid)
                if (akahuToken) {
                    //Same function as driver payout/withdraw to refund via akahu
                    let resp = await payoutCreditAkahu(userid, akahuToken, user.name, payout.amount, 'refund')
                    if (resp.ok) {
                        success = true
                    }
                }
            }
            else {
                let stripeamount = Math.round(payout.amount * 100)
                //Stripe refund
                const refund = await stripe.refunds.create({
                    amount: stripeamount,
                    payment_intent: reques.paymentid,
                });
                if (refund.status === 'succeeded') {
                    success = true
                }
            }
            if (success) {
                setPayoutRefunded(rideid, userid) //sets refunded = true
                //notifyuser
                sendNotification(userid, "Trip booking refunded", `$${payout.amount} has been sent to your connected account`)
                return { ok: true }
            }
            else {
                return { ok: false }
            }
        }
    }
    return { ok: false }
}

async function savedStripePayment(rideId, userId, seats, amount) {

    // Charge a saved payment method ** We probably change this to an api call on driver accept.**
    const ride = await getRideByRideId(rideId)
    if (!ride) {
        return { message: "Ride does not exist", messageType: "InputError" }
    }
    const booking = await getRideRequest(rideId,userId)
    if (!booking) {
        return { message: "Booking does not exist", messageType: "InputError" }
    }

    let stripeId = await getStripeIdByUserID(userId)

    const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeId,
        type: 'card',
    });

    //'attached payment methods accept request')
    //paymentMethods.data) //should be an empty array if user has not saved any payment methods
    // OLD amount: Math.round(rounded*0.87), //0.87 because eg 10 * 1.15 = 11.5, 11.5*0.87 = ~10 for the driver.
    if (paymentMethods.data.length !== 0) {
        //let driverStripeId = await getStripeIdByUserID(driverUserId)

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'nzd',
                // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
                automatic_payment_methods: { enabled: true },
                customer: stripeId,
                payment_method: paymentMethods.data[0].id,
                metadata: {
                    rideid: rideId,
                    userid: userId,
                    seat_price: booking.price,
                    seats: seats
                },
                // return_url: 'https://example.com/order/123/complete',
                off_session: true,
                confirm: true,
            });

            return paymentIntent;
        } catch (err) {
           // console.log("err",err)
            return false
            //We can try their next saved method if they have more than one
            // Error code will be authentication_required if authentication is needed
            //'Error is: ', err);
            const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
            //'PI retrieved: ', paymentIntentRetrieved.id);
        }
    }

}

// Runs every hour
async function processRecentRides() {
    const currTime = Date.now();
    const recent = currTime - 1000 * 60 * 60 * 24 // Keep ride visible for 12 Hours
    await deleteRecentEmptyRidesAndRequests(currTime);
    updateRidesSetCompleted(recent)
    //Set rides that have bookings to completed that have happened already
    return null;

}

//Runs every 6 hours *** This replaces take payments ***
async function creditDrivers() {
    /* getValidPayouts gets payouts that haven't been disputed for at least two days since the ride started and which have not been paid, credited or refunded
    sql: `SELECT * FROM payout WHERE starttime < ${recent} AND disputed = false AND paid = false AND refunded = false AND credited = false`
    */
    const validPayouts = await getValidPayouts();
    if (validPayouts.length !== 0) {
        //validPayouts)
        for (let payout of validPayouts) {
            //Create Receipts
            await generateReceipts(payout.rideid)
            //Add credit
            const rounded = payout.amount.toFixed(2)
            const roundedNumber = parseFloat(rounded)
            creditDriver(payout.driverid, roundedNumber)
            //Very important to prevent double payment
            setPayoutCredited(payout.payoutid)
            //Notify Driver 
            const user = await getUserByDriverId(payout.driverid)
            sendNotification(user.userid, 'Payout recieved', `Your account has been credited with $${roundedNumber}, you can withdraw anytime from the profile menu`)
        }

    }
}

async function payWithAkahuTEST(amount, akahuid, akahutoken, reciever, recievername) {
    let success = false
    const to = { //testing only
        name: recievername,
        account_number: reciever //bank account 12_3406_.... 
    }
    const paymentCreateParams = {
        from: akahuid, //acc_...
        to: to,
        amount: amount,
        meta: { source: { code: 'trippr', reference: 'trip joined' } }
    }
    const akahuResponse = await akahu.payments.create(akahutoken, paymentCreateParams)
    //'akahu payment response')
    //akahuResponse)
    if (akahuResponse._id) {
        for (let i = 0; i < 5; i++) {
            let getStatus = await delayedGetStatus(akahutoken, akahuResponse._id)
            //'getStatus')
            //getStatus)
            if (getStatus.status === 'SENT') {
                //'sent')
                success = true
                break;
            }
            if (getStatus.status === 'DECLINED') {
                //'declined')
                break;
            }
        }
    }
    return { ok: success }
}

async function delayedGetStatus(token, paymentid) {
    await new Promise(resolve => setTimeout(resolve, 3500));
    let getStatus = await akahu.payments.get(token, paymentid);
    return getStatus
}

//For live payments to our bank acccount
async function payWithAkahu(amount, akahuid, akahutoken) {
    let success = false
    let ourBankAccount = process.env.ourBankAccount
    const to = {
        name: 'trippr tech ltd',
        account_number: ourBankAccount
    }
    const paymentCreateParams = {
        from: akahuid, //acc_...
        to: to,
        amount: amount,
        meta: { source: { code: 'trippr', reference: 'trip joined' } }
    }
    const akahuResponse = await akahu.payments.create(akahutoken, paymentCreateParams)
    //'akahu payment response')
    //akahuResponse)
    if (akahuResponse._id) {
        for (let i = 0; i < 5; i++) {
            let getStatus = await delayedGetStatus(akahutoken, akahuResponse._id)
            //'getStatus')
            //getStatus)
            if (getStatus.status === 'SENT') {
                //'sent')
                success = true
                break;
            }
            if (getStatus.status === 'DECLINED') {
                //'declined')
                break;
            }
        }
    }
    return { ok: success }

}


async function payoutCreditAkahu(bank_acc, name, amount, type) {
    let ourAkahuToken = process.env.AKAHU_USER_TOKEN
    let acccountid;
    let ouraccountid = await getAkahuIdByUserID(1) //user 1 is our akahu account
    console.log('our acc id',ouraccountid)
    if (!ouraccountid) {
        const accounts = await akahu.accounts.list(ourAkahuToken)
        console.log('our account id',accounts[0]._id)
        await addAkahuId(accounts[0]._id,1)  
        acccountid = accounts[0]._id 
    }
    else {
        acccountid = ouraccountid
    }
    let totalRaw = amount - 0.2 // Akahu withdrawal fee
    let total = totalRaw.toFixed(2)
    let totalParsed = parseFloat(total)
   // let driverBankAccount = await getBankAccountByUserID(userId)
    let success = false
    //'driver payout bank account')
    //driverBankAccount)
    /*if (!driverBankAccount) {
        const accounts = await akahu.accounts.list(access_token)
        //'accounts')
        //accounts)
        if (accounts) {
            let accountId = accounts[0]._id
            driverBankAccount = accounts[0].formatted_account
            //status = accounts[0].status ('active' if still connected)
            //available = accounts[0].balance.available (available balance)
            // can also pull their full name and balance from akahu with: accounts[0].meta.holder and accounts[0].balance.available
            await addAkahuId(accountId, userId)
            await addBankAccount(driverBankAccount, userId)
        }
        else {
            //'akahu payment error')
            return { ok: success }
        }
    } */
    const to = {
        name: name,
        account_number: bank_acc
    }
    const payment = {
        from: acccountid, //acc_...
        to: to,
        amount: totalParsed,
        meta: { source: { code: 'trippr', reference: type } } //type eg refund, payout, trip joined etc
    }
    const akahuResponse = await akahu.payments.create(ourAkahuToken, payment)
    if (akahuResponse._id) {
        for (let i = 0; i < 5; i++) {
            let getStatus = await delayedGetStatus(ourAkahuToken, akahuResponse._id)

            if (getStatus.status === 'SENT') {
                //'sent')
                success = true
                break;
            }
            if (getStatus.status === 'DECLINED') {
                //'declined')
                break;
            }
        }
    }
    return { ok: success }

    //If sucessful, delete their credit in DB.
}

async function issueRefund(driverid, userid, amount) {
    //Deduct from driver credit.
}
//For when a user deletes their account
async function revokePaymentAccounts(userid) {
   // const akahuToken = await getAkahuTokenByUserID(userid)
    const stripeCustNo = await getStripeIdByUserID(userid)
  /*  if (akahuToken) {
     let webhookid = await getAkahuHook(email)
      //'webhookid',webhookid)
      if (webhookid){
      await akahu.webhooks.unsubscribe(akahuToken,webhookid)
      } 
      await akahu.auth.revoke(akahuToken)
    } */
if (stripeCustNo) {
await stripe.customers.del(stripeCustNo);
}
//'stripe delete resp',resp)
}

module.exports = {
    payoutCreditAkahu,
    issueRefund,
    getPassengerStripePay,
    revokePaymentAccounts,
    // checkTransactionId,
    // authorisePayment,
    processAcceptRequest,
    savedStripePayment,
    processRefund
}



