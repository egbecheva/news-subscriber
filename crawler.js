require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);

const url = 'http://dg123sharl-pero.com/novini/';
const previousContentFile = 'previousContent.txt';

async function checkForChanges() {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const newContent = $('body').html();

    if (fs.existsSync(previousContentFile)) {
      const previousContent = fs.readFileSync(previousContentFile, 'utf8');

      if (newContent !== previousContent) {
        console.log('Changes detected!');
        notifyChanges();
        fs.writeFileSync(previousContentFile, newContent);
      } else {
        console.log(`No changes detected for ${url}`);
      }
    } else {
      fs.writeFileSync(previousContentFile, newContent);
      console.log('Content saved for the first time.');
    }
  } catch (error) {
    console.error('Error fetching the webpage:', error);
  }
}

function notifyChanges() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'egbecheva@gmail.com',
    subject: 'DG Sharl Pero Content Change Detected',
    text: `Changes have been detected on the website: ${url}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Run the script immediately
checkForChanges();
