const axios = require('axios');

/**
 * Sends real SMS to emergency contact phone numbers.
 * Supports:
 * 1. Fast2SMS API (Ideal for Indian mobile numbers like +91 7385433433)
 * 2. Twilio API (Ideal for global numbers)
 * 3. Graceful fallback logging if no API credentials configured in .env
 */
async function sendSMS(toPhone, messageText) {
  if (!toPhone || toPhone === 'N/A') {
    return { success: false, reason: 'No phone number provided' };
  }

  // Clean phone number (remove spaces, hyphens, non-digits except leading +)
  let cleanPhone = toPhone.replace(/[^\d+]/g, '');

  // 1. Try Fast2SMS (India Gateway)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      // Extract 10-digit Indian mobile number
      let raw10 = cleanPhone.replace(/^\+91/, '').slice(-10);
      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'q',
          message: messageText,
          language: 'english',
          flash: 0,
          numbers: raw10
        },
        {
          headers: {
            'authorization': process.env.FAST2SMS_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log(`[REAL SMS DISPATCH] Fast2SMS status for ${raw10}:`, response.data);
      return { success: true, provider: 'Fast2SMS', response: response.data };
    } catch (err) {
      console.error('[REAL SMS DISPATCH ERROR] Fast2SMS failed:', err.response?.data || err.message);
    }
  }

  // 2. Try Twilio API (Global Gateway)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      let formattedPhone = cleanPhone;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone; // Default to India country code if omitted
      }

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromPhone = process.env.TWILIO_PHONE_NUMBER;

      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', formattedPhone);
      params.append('From', fromPhone);
      params.append('Body', messageText);

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        params.toString(),
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );

      console.log(`[REAL SMS DISPATCH] Twilio SID: ${response.data.sid} to ${formattedPhone}`);
      return { success: true, provider: 'Twilio', sid: response.data.sid };
    } catch (err) {
      console.error('[REAL SMS DISPATCH ERROR] Twilio failed:', err.response?.data || err.message);
      return { success: false, provider: 'Twilio', reason: err.response?.data?.message || err.message };
    }
  }

  // 3. Fallback warning if no API keys are present in .env
  console.warn(`[SMS GATEWAY NOT CONFIGURED] Real SMS to ${toPhone} requires FAST2SMS_API_KEY or TWILIO credentials in backend .env!`);
  return {
    success: false,
    reason: 'SMS Gateway Credentials missing in backend .env. Add FAST2SMS_API_KEY or TWILIO credentials to activate real cellular SMS delivery.'
  };
}

const nodemailer = require('nodemailer');

/**
 * Sends real email alerts via free Gmail account.
 */
async function sendEmailAlert(toEmail, subject, text) {
  if (!toEmail || toEmail === 'N/A' || !toEmail.includes('@')) {
    return { success: false, reason: 'No valid email address provided' };
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(`[EMAIL NOT CONFIGURED] Real Email to ${toEmail} requires GMAIL_USER and GMAIL_APP_PASSWORD in backend .env!`);
    return {
      success: false,
      reason: 'Email Credentials missing in backend .env. Add GMAIL_USER and GMAIL_APP_PASSWORD to enable free email dispatch.'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"TourGuardian SOS" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: text
    });

    console.log(`[REAL EMAIL DISPATCH] Email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, provider: 'Gmail', messageId: info.messageId };
  } catch (err) {
    console.error('[REAL EMAIL DISPATCH ERROR] Nodemailer failed:', err.message);
    return { success: false, provider: 'Gmail', reason: err.message };
  }
}

module.exports = { sendSMS, sendEmailAlert };
