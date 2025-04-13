// src/app/api/sendMail/route.js

import nodemailer from 'nodemailer';

export async function POST(req) {
  const body = await req.json();
  const { to, subject, text, html } = body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,     // your email
        pass: process.env.EMAIL_PASS,     // your app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    return Response.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
    });
  }
}
