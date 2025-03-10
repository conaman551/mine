// Import dependencies
const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
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

 

const joinRequestEmail = async(to,senderId,senderName,tripDestination) => {
const profilepic = `https://publicpicturestestbucket.s3.ap-southeast-2.amazonaws.com/profilepictures/${senderId}.jpeg`;
const subject = 'New trip request!'
const body = `
<html>
<body style="font-family: Arial, sans-serif;">
    <div style="background-color: #ccc; color: white; padding: 10px; text-align: center;">
        <img src="https://www.trippr.org/trippr.png" alt="Company Logo" width="200" height="100">
        <h1>Trip request</h1>
    </div>
    <div style="padding: 20px;">
        <img src="${profilepic}" alt="profile picture" width="100" height="100">
        <h2>${senderName} is requesting to join your trip to ${tripDestination}</h2>
        <p>Open the app to accept or decline the request</p>
        <p>Sent with ❤️ from Trippr</p>
        <a href="https://www.trippr.org" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; margin-top: 20px; border-radius: 5px;">Learn More</a>
    </div>
    <div style="margin-top: 20px; font-size: 14px; color: #666;">
        <p>Contact us at:</p>
        <p>Email: admin@trippr.org</p>
        <p>Phone: +64 20 41163885</p>
    </div>
</body>
</html>

`
postEmail(to,subject,body)
}

const acceptedRequestEmail = async(to,senderId,senderName,tripDestination) => {
  const profilepic = `https://publicpicturestestbucket.s3.ap-southeast-2.amazonaws.com/profilepictures/${senderId}.jpeg`;
  const subject = 'Trip request accepted!'
  const body = `
  <html>
  <body style="font-family: Arial, sans-serif;">
      <div style="background-color: #ccc; color: white; padding: 10px; text-align: center;">
          <img src="https://www.trippr.org/trippr.png" alt="Company Logo" width="200" height="100">
          <h1>Request accepted</h1>
      </div>
      <div style="padding: 20px;">
          <img src="${profilepic}" alt="profile picture" width="100" height="100">
          <h2>${senderName} has accepted your trip request to ${tripDestination}!</h2>
          
          <p>Sent with ❤️ from Trippr</p>
          <a href="https://www.trippr.org" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; margin-top: 20px; border-radius: 5px;">Learn More</a>
      </div>
      <div style="margin-top: 20px; font-size: 14px; color: #666;">
          <p>Contact us at:</p>
          <p>Email: admin@trippr.org</p>
          <p>Phone: +64 20 41163885</p>
      </div>
  </body>
  </html>
  
  `
  postEmail(to,subject,body)
  }


// Function to send an email
const postEmail = async(to, subject, text) => {
  const mailOptions = {
    from: 'admin@trippr.org', // Sender address
    to: to, // List of receivers
    subject: subject, // Subject line
    html: text, // Plain text body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(`Error: ${error}`);
    }
    console.log(`Message sent: ${info.response}`);
  });
};

// let testuser = await getUserByUserId(1)
//let profilepic = `https://publicpicturestestbucket.s3.ap-southeast-2.amazonaws.com/profilepictures/${1}.jpeg`;
//let destination = 'Taupo'
//joinRequestEmail('forestellum@gmail.com',profilepic,'Conal',destination)

// Send a test email

module.exports = {
    joinRequestEmail,
    acceptedRequestEmail
  }
