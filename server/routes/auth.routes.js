import express from 'express';
import { googleLogin, sendInvite } from '../controllers/auth.controller.js';
import nodemailer from 'nodemailer';
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

router.post('/google', googleLogin);
router.post('/send-invite', (req, res) => sendInvite(req, res, transporter));

export default router;
