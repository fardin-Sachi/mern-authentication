import {createTransport} from 'nodemailer';
import { 
    SMTP_PASSWORD, 
    SMTP_USER 
} from '../config/env.config.js';

const sendMail = async({email, subject, html}) => {
    try {
        const transport = createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transport.sendMail({
            from: SMTP_USER,
            to: email,
            subject,
            html
        })   
    } catch (error) {
        console.error("Failed to send email:", error.message);
    }
    
};

export default sendMail;