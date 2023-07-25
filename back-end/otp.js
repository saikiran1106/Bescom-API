const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Twilio setup
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const client = twilio(accountSid, authToken);

// API endpoints
app.post('/api/send-otp', (req, res) => {
  const { phoneNumber } = req.body;

  client.verify
    .services('YOUR_TWILIO_VERIFY_SERVICE_SID')
    .verifications.create({ to: phoneNumber, channel: 'sms' })
    .then((verification) => {
      res.json({ sid: verification.sid });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to send OTP' });
    });
});

app.post('/api/verify-otp', (req, res) => {
  const { phoneNumber, verificationSid, otp } = req.body;

  client.verify
    .services('YOUR_TWILIO_VERIFY_SERVICE_SID')
    .verificationChecks.create({
      to: phoneNumber,
      code: otp,
      verificationSid: verificationSid,
    })
    .then((verificationCheck) => {
      if (verificationCheck.status === 'approved') {
        res.json({ message: 'OTP verification success' });
      } else {
        res.status(400).json({ error: 'Invalid OTP' });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
