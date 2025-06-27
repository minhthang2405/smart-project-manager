import nodemailer from 'nodemailer';

export const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });
};

export const sendMail = async ({ to, subject, text }) => {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"SmartPM" <${process.env.EMAIL}>`,
        to,
        subject,
        text,
    });
};
