const { createDriver,updateDriverId} = require('../repository/driverQueries')

const {addPaypal, addBankAccount} = require('../repository/payment')
const sharp = require('sharp');

async function formatImage(image){
  const imageSize = image.size
  let imageBuffer = image.buffer

  if (imageSize > 300000) { //Maximum image size is 300 Kilo BYTES, any larger image will be reduced in size
    imageBuffer = await sharp(image.buffer).resize(300, 300).toFormat('jpeg').toBuffer()
  } else {
    imageBuffer = await sharp(image.buffer).toFormat('jpeg').toBuffer()
  }
  return imageBuffer
}

async function putDriverLicence(userId, pictures){
  const frontLicenceImageBuffer = await formatImage(pictures.frontlicence[0]);
  const backLicenceImageBuffer = await formatImage(pictures.backlicence[0]);
  
  if (!frontLicenceImageBuffer || !backLicenceImageBuffer) {
    return {iserror : true, response : "Error with Image buffer."}
  }

  //S3 crap was here 
}

async function generateDriver(userId, driverslicense, preferences,bankacc){
    // Test PP, DL, Pref
    //"use paypal driver services",usepaypal,paypal)
   let driverEntity = await createDriver(driverslicense, preferences)    
    await updateDriverId(userId, driverEntity.driverid)
    await addBankAccount(bankacc,userId)
   /* if (usepaypal) {
      let lower = paypal.toLowerCase();
      addPaypal(lower,userId)
    } */
    return {iserror : false, response : "Accepted"}
  }

module.exports = {
  generateDriver,
  putDriverLicence
}