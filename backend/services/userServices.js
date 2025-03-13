const bcrypt = require('bcrypt');
const { createUser, updateUserDetailsByEmail } = require('../repository/userRepo')



async function validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

function validEmail(email) {
  const emailFormat = /^[\w\.-]+@[\w\.-]+\.\w+$/
  return emailFormat.test(email)
}

function validDob(dob){
  const dobFormat = /^\d{2}\/\d{2}\/\d{4}$/
  if(!(dobFormat.test(dob))){
    return false
  }
  dobSplit = dob.split("/")
  const day = Number(dobSplit[0])
  const month = Number(dobSplit[1])
  const year = Number(dobSplit[2])

  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
    return false;
  }
  return true
}

function validPhoneNumber(phone) {
//**should allow for international numbers and local ones eg +642041163885,02040252969,021440955,123-456-7890 */
const phoneFormat = /^\+?(\d{1,3})?[\s.-]?(\d{2,4})[\s.-]?(\d{3,4})[\s.-]?(\d{3,4})$/
if(phoneFormat.test(phone)) {
  return true
}
else {
  return false
}
}


async function generateUser(name, email, password, phonenumber){
  if(name == "" || name.length > 30){
    return {iserror : true, response : "No valid name provided, please try again"}
  }
  if(!validEmail(email) || email.length > 40){
    return {iserror : true, response : "Please enter a valid email"}
  }
  if(phonenumber.length > 14 || !validPhoneNumber(phonenumber)){
    return {iserror : true, response : "Please enter a valid phone number"}
  }
  if (password.length < 8 || password.length > 30) {
    return {iserror : true, response : "Invalid password"}
}
  const defaultBiography = "Hi, I am new to Trippr"

  await createUser(name, email, password, phonenumber, defaultBiography)
  return {iserror : false, response : "Accepted"}
  
}

async function updateUserDetails(email, name, phoneNumber){
  if(name == ""){
    return {iserror : true, response : "Please enter your name"}
  }
  if (phoneNumber) { //Stops crash if user only submits name
  if(phoneNumber.length > 14 || !validPhoneNumber(phoneNumber)){
    return {iserror : true, response : "Please enter a valid phone number"}
  }
  }
  else {
    phoneNumber = null
  }

  await updateUserDetailsByEmail(email, name, phoneNumber)

  return {iserror : false, response : "Accepted"}

}

module.exports = {
    validatePassword,
    generateUser,
    validEmail,
    validDob,
    updateUserDetails
}