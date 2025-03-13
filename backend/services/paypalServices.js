'use strict';
path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const payoutsNodeJssdk = require('@paypal/payouts-sdk');
const { getDriversByRequestedPayout, getPayoutsByDriverid, payoutrequested, getPaypalEmail, setPayoutPaid, zeroCredit } = require('../repository/payment');
const { getUserByDriverId } = require('../repository/userRepo');
const { sendNotification } = require('./notificationServices');

async function sendPaypalPayouts() {

  let drivers = await getDriversByRequestedPayout()
  if (drivers) {
    //'drivers',drivers)
    let payoutList = []
    for (const element of drivers) {
      let driverTotal = 0;
      let payouts = await getPayoutsByDriverid(element.driverid);
      let user = await getUserByDriverId(element.driverid)
      let paypalEmail = await getPaypalEmail(user.email)
      if (payouts) {
        for (let payout of payouts) {
          driverTotal += payout.amount
          //Set payout paid == true
          setPayoutPaid(payout.payoutid,'paypal')
        }
        //Deduct fees and round driver total
        let subtotal = driverTotal * 0.97
        let rounded = subtotal.toFixed(2)
        payoutList.push({ amount: rounded, email: paypalEmail })
      }
      //setRequestedPayout to false ***IMPORTANT***
       payoutrequested(element.driverid,false)
       zeroCredit(element.driverid)
       sendNotification(user.userid, 'Paypal payout sent!', `Your payout of $${driverTotal} has been sent`)
      // Do something with payouts
    }

    if (payoutList.length !== 0) {

      let items = []
      let date = new Date().toLocaleString([], { day: 'numeric', month: 'short' })
      let time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

      for (let payo of payoutList) {
        let obj = {
          recipient_type: 'EMAIL',
          amount: { value: payo.amount, currency: 'NZD' },
          note: 'Thanks for carpooling with Trippr',
          sender_item_id: `payout ${date} + ${time}`,
          receiver: payo.email
        }
        items.push(obj)
      }

      //'paypal payouts', items[0])

      let payoutsObj = {
        sender_batch_header: {
          sender_batch_id: `batch payout ${date} + ${time}`,
          email_subject: "You've recieved a payout from Trippr!",
          email_message: "You have received a payout! Thanks for using our service!"
        },
        items: items
      }

      //let payoutsString = JSON.stringify(payoutsObj)

      function client() {
        return new payoutsNodeJssdk.core.PayPalHttpClient(environment());
      }

      function environment() {
        let clientId = process.env.PAYPAL_CLIENT_ID || 'AVVchB7KOFueuU_HcxA1vWvzUz24ugHGgRO6N2AyUGsPA_WcFhZ9Rpxfv5rQbiRVADGOy7Ui4x7_l-3j';
        let clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EFqb2RsLOddyln5uadI3iVQAg-WSHt4x8EsB-xfLu16zAK2hKRfeMZkvH00cY_BDid72N6K5C8jk37yb';

        if (process.env.NODE_ENV === 'production') {
          return new payoutsNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
        }

        return new payoutsNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
      }

      // Construct a request object and set desired parameters


      async function createPayout() { 
        const request = new payoutsNodeJssdk.payouts.PayoutsPostRequest();
        request.requestBody(payoutsObj)
        try {
          const response = await client().execute(request);
          //`Payout created with batch ID: ${response.result.batch_header.payout_batch_id}`);
          console.log(`Payouts Create Response: ${JSON.stringify(response)}`);
        } catch (err) {
          console.error(err);
        }
        return {ok:true}
      }
      createPayout()
      //createPayout().then(data => { //'Sent paypal payouts successfully',data);  return {ok:true} }).catch(console.error);
    }
  }
  else {
    return { ok: true }
  }

}


module.exports = {
  sendPaypalPayouts
}


