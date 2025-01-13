import axios from "axios";

// API Key for Arkesel services (set this as an environment variable or directly here)
const API_KEY = process.env.ARKESAL_API_KEY || 'VVB2WVJ2TGpySG1KR1l5YlFyeG0';


// Arkesel API base URLs
const ARKESEL_SMS_V1_URL = 'https://sms.arkesel.com/sms/api';
const ARKESEL_SMS_V2_URL = 'https://sms.arkesel.com/api/v2/sms/send';
const ARKESEL_OTP_GENERATE_URL = 'https://sms.arkesel.com/api/otp/generate';
const ARKESEL_OTP_VERIFY_URL = 'https://sms.arkesel.com/api/otp/verify';


/**
 * Send SMS using Arkesel API V1.
 * @param {Object} smsDetails - The SMS details.
 * @param {string} smsDetails.to - The recipient phone number(s), separated by commas for multiple numbers.
 * @param {string} smsDetails.from - The sender ID (must be max 11 characters).
 * @param {string} smsDetails.sms - The message content.
 * @returns {Promise<Object>} - Response data from the API.
 */
const sendSMSV1 = async ({ to, from, sms }) => {
  try {
    const response = await axios.get(ARKESEL_SMS_V1_URL, {
      params: {
        action: 'send-sms',
        api_key: API_KEY,
        to,
        from,
        sms,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending SMS (V1):', error.message);
    throw error;
  }
};


/**
 * Send SMS using Arkesel API V2.
 * @param {Object} smsDetails - The SMS details.
 * @param {string} smsDetails.sender - The sender ID (must be max 11 characters).
 * @param {string} smsDetails.message - The message content.
 * @param {Array<string>} smsDetails.recipients - Array of recipient phone numbers.
 * @returns {Promise<Object>} - Response data from the API.
 */
const sendSMSV2 = async ({ sender, message, recipients }) => {
  try {
    const response = await axios.post(
      ARKESEL_SMS_V2_URL,
      { sender, message, recipients },
      { headers: { 'api-key': API_KEY } }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending SMS (V2):', error.message);
    throw error;
  }
};


/**
 * Send scheduled SMS using Arkesel API V2.
 * @param {Object} smsDetails - The SMS details.
 * @param {string} smsDetails.sender - The sender ID (must be max 11 characters).
 * @param {string} smsDetails.message - The message content.
 * @param {Array<string>} smsDetails.recipients - Array of recipient phone numbers.
 * @param {string} smsDetails.scheduled_date - The date and time when the message should be sent (e.g., '2021-03-17 07:00 AM').
 * @returns {Promise<Object>} - Response data from the API.
 */
const sendScheduledSMS = async ({ sender, message, recipients, scheduled_date }) => {
  try {
    const response = await axios.post(
      ARKESEL_SMS_V2_URL,
      { sender, message, recipients, scheduled_date },
      { headers: { 'api-key': API_KEY } }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending scheduled SMS:', error.message);
    throw error;
  }
};


/**
 * Send SMS with delivery webhook using Arkesel API V2.
 * @param {Object} smsDetails - The SMS details.
 * @param {string} smsDetails.sender - The sender ID (must be max 11 characters).
 * @param {string} smsDetails.message - The message content.
 * @param {Array<string>} smsDetails.recipients - Array of recipient phone numbers.
 * @param {string} smsDetails.callback_url - The callback URL for delivery notifications.
 * @returns {Promise<Object>} - Response data from the API.
 */
const sendSMSWithDeliveryWebhook = async ({ sender, message, recipients, callback_url }) => {
  try {
    const response = await axios.post(
      ARKESEL_SMS_V2_URL,
      { sender, message, recipients, callback_url },
      { headers: { 'api-key': API_KEY } }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending SMS with delivery webhook:', error.message);
    throw error;
  }
};


/**
 * Generate OTP using Arkesel OTP API.
 * @param {Object} otpDetails - The OTP details.
 * @param {string} otpDetails.expiry - OTP expiration time in minutes.
 * @param {string} otpDetails.length - Length of the OTP.
 * @param {string} otpDetails.medium - The medium to send the OTP ('sms' or 'voice').
 * @param {string} otpDetails.message - The message template with %otp_code% placeholder.
 * @param {string} otpDetails.number - The recipient phone number.
 * @param {string} otpDetails.sender_id - The sender ID.
 * @param {string} otpDetails.type - OTP type ('numeric' or 'alphanumeric').
 * @returns {Promise<Object>} - Response data from the API.
 */
const generateOTP = async ({ expiry, length, medium, message, number, sender_id, type }) => {
  try {
    const response = await axios.post(
      ARKESEL_OTP_GENERATE_URL,
      { expiry, length, medium, message, number, sender_id, type },
      { headers: { 'api-key': API_KEY } }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating OTP:', error.message);
    throw error;
  }
};


/**
 * Verify OTP using Arkesel OTP API.
 * @param {Object} otpDetails - The OTP verification details.
 * @param {string} otpDetails.code - The OTP code to verify.
 * @param {string} otpDetails.number - The recipient phone number.
 * @returns {Promise<Object>} - Response data from the API.
 */
const verifyOTP = async ({ code, number }) => {
  try {
    const response = await axios.post(
      ARKESEL_OTP_VERIFY_URL,
      { code, number },
      { headers: { 'api-key': API_KEY } }
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    throw error;
  }
};


// Exporting utility functions
export {
  sendSMSV1,
  sendSMSV2,
  sendScheduledSMS,
  sendSMSWithDeliveryWebhook,
  generateOTP,
  verifyOTP,
};
