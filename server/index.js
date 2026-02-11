const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const nodemailer = require('nodemailer');


// Configure Nodemailer Transporter
console.log('--- SMTP Configuration ---');
console.log('Host:', "smtp.gmail.com");
console.log('Port:', 587);
console.log('User:', process.env.SMTP_USER);
console.log('Pass:', process.env.SMTP_PASS ? '********' : 'NOT SET');
console.log('Pass Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);
console.log('--------------------------');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

// API: Submit Enquiry
app.post('/api/enquiries', async (req, res) => {
    try {
        const { name, email, phone, course, branch, queries } = req.body;
        
        // 1. Insert into Database
        const [result] = await db.query(
            'INSERT INTO enquiries (name, email, phone, course, branch, queries) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, course, branch, queries]
        );

        // 2. Send Email Notification
        const mailOptions = {
            from: `"ACE Admissions" <${process.env.SMTP_USER}>`,
            to: process.env.EMAIL_TO || 'admin@example.com', // Placeholder
            cc: process.env.EMAIL_CC || 'cc@example.com',   // Placeholder
            bcc: process.env.EMAIL_BCC || 'bcc@example.com', // Placeholder
            subject: `New Admission Enquiry: ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #02254b;">New Admission Enquiry Received</h2>
                    <p>Details of the candidate:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Course</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${course}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Branch</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${branch}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Queries</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${queries || 'N/A'}</td>
                        </tr>
                    </table>
                    <br>
                    <p>This is an automated notification from the ACE Admission Enquiry Portal.</p>
                </div>
            `,
        };

        // Send email asynchronously (don't block response)
        console.log(`Attempting to send notification email for: ${name}...`);
        transporter.sendMail(mailOptions)
            .then(info => {
                console.log('Email sent successfully:', info.messageId);
            })
            .catch(err => {
                console.error('Error sending email:', err);
            });

        res.status(201).json({ message: 'Enquiry submitted successfully', id: result.insertId });
    } catch (error) {
        console.error('Error submitting enquiry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Get Enquiries (with filters)
app.get('/api/enquiries', async (req, res) => {
    try {
        const { search, branch, year, startDate, endDate } = req.query;
        let query = 'SELECT * FROM enquiries WHERE 1=1';
        let params = [];

        if (search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR queries LIKE ?)';
            const searchVal = `%${search}%`;
            params.push(searchVal, searchVal, searchVal, searchVal);
        }

        if (branch && branch !== 'All') {
            query += ' AND branch = ?';
            params.push(branch);
        }

        if (year && year !== 'All') {
            query += ' AND YEAR(timestamp) = ?';
            params.push(year);
        }

        if (startDate) {
            query += ' AND timestamp >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND timestamp <= ?';
            params.push(endDate + ' 23:59:59');
        }

        query += ' ORDER BY timestamp DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Admin Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
