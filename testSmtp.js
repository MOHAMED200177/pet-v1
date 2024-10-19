// testSmtp.js
require('dotenv').config();
const nodemailer = require('nodemailer');

// Print environment variables for debugging
console.log('Host:', process.env.EMAIL_HOST);
console.log('Port:', process.env.EMAIL_PORT);
console.log('User:', process.env.EMAIL_USERNAME);
console.log('Pass:', process.env.EMAIL_PASSWORD);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // Use secure if port is 465
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error('SMTP connection failed:', error);
    } else {
        console.log('SMTP connection successful:', success);
    }
});


























export default function getStudentIdsSum(students) {
    return students.reduce((sum, num) => sum + num.id , 0);
}