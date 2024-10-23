// /backend/utils/emailService.js

const nodemailer = require('nodemailer');

// Setup mailtrap transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 587,
    auth: {
        user: process.env.MAILTRAP_USER,  // Set these in your .env file
        pass: process.env.MAILTRAP_PASS
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates
    }
});

const sendConfirmationEmail = async (to, token) => {
    const url = `http://localhost:5001/api/auth/confirm/${token}`;

    console.log('Preparing to send confirmation email to:', to);
    console.log('Confirmation URL:', url);

    const mailOptions = {
        from: '"Sofa Store"  @geric.morit@tup.edu.ph, @roschel.anoos@tup.edu.ph', // Use a single sender address
        to,
        subject: 'Email Confirmation',
        html: `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: auto;
                            background: #ffffff;
                            padding: 20px;
                            border-radius: 5px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #333333;
                            text-align: center;
                        }
                        p {
                            color: #555555;
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        a {
                            display: inline-block;
                            margin: 20px 0;
                            padding: 10px 20px;
                            background-color: #007bff;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            text-align: center;
                        }
                        a:hover {
                            background-color: #0056b3;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Welcome to SofaStore!</h1>
                        <p>Thank you for registering with us. Please confirm your email address to complete your registration.</p>
                        <p>Click the button below to confirm your email:</p>
                        <a href="${url}">Confirm Email</a>
                        <p>If you did not create an account, no further action is required.</p>
                    </div>
                </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully!');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};
module.exports = { sendConfirmationEmail };
