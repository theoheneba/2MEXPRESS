import nodemailer from 'nodemailer';

/**
 * @desc   Create the transporter 
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', 
  port: 465, 
  secure: true, 
  auth: {
      user: 'ticket@2mexpress.com.gh',
      pass: '2MexpressLtd@18' 
  },
  tls: {
      rejectUnauthorized: false,
  },
  connectionTimeout: 60000, 
  socketTimeout: 60000,
});

// Footer Template
const footerTemplate = `
  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #555;">
    <p style="margin: 5px 0;">2M Express</p>
    <p style="margin: 5px 0;">Comfortably safe!</p>
  </div>
`;

// Helper function to create a styled email template
const createEmailTemplate = (title, message) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
      <h1 style="color: #020065;">${title}</h1>
      <p>${message}</p>
      ${footerTemplate}
    </div>
  `;
};


/**
 * @desc   Function to send password reset email
 */
const sendPasswordResetEmail = async (email, defaultPassword) => {
  try {
    const message = `Your password has been reset to: <strong>${defaultPassword}</strong><br>Please reset it to your preferred password.`;
    const htmlContent = createEmailTemplate('Password Reset', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: email,
      subject: '2M Password Reset',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send password reset email: ${error}`);
  }
};


/**
 * @desc    Function to send a welcome email
 */
const sendWelcome = async (email, message) => {
  try {
    const htmlContent = createEmailTemplate('Welcome to 2M!', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: email,
      subject: 'Welcome to 2M!',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send welcome email: ${error}`);
  }
};


/**
 * @desc   Function to send a newsletter email
 */
const sendNewsletter = async (email, message) => {
  try {
    const htmlContent = createEmailTemplate('2M Newsletter', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: email,
      subject: '2M Newsletter',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send newsletter email: ${error}`);
  }
};


/**
 * @desc   Function to send an unsubscribe email
 */
const sendUnsubscribeNewsletter = async (email, message) => {
  try {
    const htmlContent = createEmailTemplate('Unsubscribe Confirmation', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: email,
      subject: 'Unsubscribe Confirmation',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send unsubscribe email: ${error}`);
  }
};


/**
 * @desc   Function to send a resubscribe email
 */
const sendResubscribeNewsletter = async (email, message) => {
  try {
    const htmlContent = createEmailTemplate('Resubscribe Confirmation', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: email,
      subject: 'Resubscribe Confirmation',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send resubscribe email: ${error}`);
  }
};


/**
 * @desc   Function to send ticket purchase confirmation email
 */
const sendTicketPurchaseEmail = async (userEmail, ticketDetails) => {
  try {
    const message = `
      <p>Thank you for choosing to travel with 2M! Here are your ticket details:</p>
      <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Ticket Number:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${ticketDetails.ticketNumber}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Origin:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${ticketDetails.origin}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Destination:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${ticketDetails.destination}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Seat Number:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${ticketDetails.seat}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Bus Number:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${ticketDetails.busNumber}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Status:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${ticketDetails.status}</td>
        </tr>
      </table>
      <p>We look forward to providing you with a comfortable and safe journey!</p>
    `;

    const htmlContent = createEmailTemplate('Your 2M Ticket Update', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: userEmail,
      subject: 'Your 2M Ticket Update',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send ticket purchase email. SMTP Error:', error);
  }
};


/**
 * @desc   Function to send parcel booking confirmation email
 */
const sendParcelBookingEmail = async (userEmail, parcelDetails) => {
  try {
    const message = `
      Thank you for choosing 2M for your parcels! Here are your parcel details:<br>
      <pre>${JSON.stringify(parcelDetails, null, 2)}</pre>
    `;
    const htmlContent = createEmailTemplate('Parcel Booking Confirmation', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: userEmail,
      subject: 'Parcel Booking Confirmation',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send parcel booking email: ${error}`);
  }
};


/**
 * @desc   Function to send parcel arrival/delivery notification email
 */
const sendParcelEmail = async (userEmail, parcelDetails) => {
  try {
    const message = `
      Your parcel has arrived/delivered! Here are the details:<br>
      <pre>${JSON.stringify(parcelDetails, null, 2)}</pre>
    `;
    const htmlContent = createEmailTemplate('Parcel Arrival/Delivery Notification', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: userEmail,
      subject: '2M Parcel Notification',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send parcel arrival email: ${error}`);
  }
};


/**
 * @desc   Function to send trip start email
 */
const sendTripStartEmail = async (userEmail, tripDetails) => {
  try {
    const message = `
      <p>Your trip has started! Here are the details:</p>
      <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Trip ID:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${tripDetails.tripId}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Origin:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${tripDetails.origin}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Destination:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${tripDetails.destination}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Departure Time:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${tripDetails.departureTime}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Bus Number:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${tripDetails.busNumber}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>Status:</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${tripDetails.status}</td>
        </tr>
      </table>
      <p>We wish you a safe and enjoyable journey!</p>
    `;

    const htmlContent = createEmailTemplate('Your Trip Has Started', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: userEmail,
      subject: 'Your Trip Has Started',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send trip start email: ${error}`);
  }
};


/**
 * @desc   Function to send trip end notification email
 */
const sendTripEndEmail = async (userEmail, tripDetails) => {
  try {
    const message = `
      Your trip has ended! Here are the details:<br>
      <pre>${JSON.stringify(tripDetails, null, 2)}</pre>
    `;
    const htmlContent = createEmailTemplate('Your Trip Has Ended', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: userEmail,
      subject: 'Your Trip Has Ended',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send trip end email: ${error}`);
  }
};


/**
 * @desc   Function to send rate email after trip ends
 */
const sendRateEmail = async (userEmail, tripId) => {
  try {
    const message = `
      We hope you enjoyed your trip! Please take a moment to rate your trip with ID: <strong>${tripId}</strong>.
    `;
    const htmlContent = createEmailTemplate('Rate Your Trip', message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: userEmail,
      subject: 'Rate Your Trip',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send rate email: ${error}`);
  }
};


/**
 * @desc   Function to send official communications email
 */
const sendOfficialCommunicationEmail = async (userEmail, subject, message) => {
  try {
    const htmlContent = createEmailTemplate(subject, message);

    const mailOptions = {
      from: '"2M Express" <ticket@2mexpress.com.gh>',
      to: userEmail,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send official communication email: ${error}`);
  }
};

export {
  sendPasswordResetEmail,
  sendWelcome,
  sendNewsletter,
  sendUnsubscribeNewsletter,
  sendResubscribeNewsletter,
  sendTicketPurchaseEmail,
  sendParcelBookingEmail,
  sendParcelEmail,
  sendTripStartEmail,
  sendTripEndEmail,
  sendRateEmail,
  sendOfficialCommunicationEmail,
};
