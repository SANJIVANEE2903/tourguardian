require('dotenv').config();
const { sendSMS } = require('./src/utils/smsService');

(async () => {
  console.log("Testing SMS delivery...");
  const result = await sendSMS('+918208101532', 'Test message from TourGuardian Backend');
  console.log("Result:", result);
})();
