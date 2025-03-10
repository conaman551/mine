const { Expo } = require('expo-server-sdk');
const { getFirebaseToken, getUserByUserId } = require('../repository/userQueries')
const { SNSClient, PublishCommand, CheckIfPhoneNumberIsOptedOutInputFilterSensitiveLog } = require("@aws-sdk/client-sns");

const expo = new Expo()
const sendNotification = async(userid,title,message,databody) => {
    let token = await getFirebaseToken(userid)
    //token)
    if (token) {
    if (token.firebase_token) {
        expo.sendPushNotificationsAsync([
            {
                to:token.firebase_token,
                title:title,
                body: message,
                data:databody
            },        
        ])
    }
}
}

async function checkPhonenumber(phonenumber) {
    if (!phonenumber){ //Nothing passed to function
        console.log("Failed: No number provided")
        return false
    }
    //Checks number is numeric
    if (isNaN(phonenumber)) {
        return false
    } 
    //Checks phonenumber length
    if (phonenumber.length < 5 || phonenumber.length > 20) {
        return false
    }
    return true
}

//Optionally could pass userid, and get the telephone number in sendSMS
async function sendJoinRequestSMS(phonenumber) {
    const message = "Trippr: A user has requested to join your ride.";
    sendSMS(phonenumber, message);
}

//Optionally could pass userid, and get the telephone number in sendSMS
async function sendSMS(phonenumber, message) {
    const useUserid = true
    
    if (useUserid) {
        const userid = 1
        const userInfo = await getUserByUserId(userid)
        phonenumber = userInfo.phonenumber
    }

    const phonenumberIsValid = await checkPhonenumber(phonenumber);
    if (!phonenumberIsValid) {
        console.log("Failed phonenumber check")
        return null
    }

    console.log("Edit sendSMS function to enable SMS notification")
    return null

    const client = new SNSClient()
    console.log(`Number : Message || ${phonenumber} ${message}`)
    let params = {
        Message: message,
        PhoneNumber: '+' + phonenumber,
    }
    const command = new PublishCommand(params);
    const response = await client.send(command);
    console.log("Response ", response)
}


module.exports = {
    sendNotification,
    sendJoinRequestSMS
  }