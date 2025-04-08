import express from 'express';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "El correo ya está registrado." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const secret = speakeasy.generateSecret({ name: `FFC: ${email}`, length: 20 });

        const newUser = new User({ 
            firstName, 
            lastName, 
            email, 
            password: hashedPassword,
            twoFactorSecret: secret.base32,
            isVerified: false 
        });

        await newUser.save();

        qrcode.toDataURL(secret.otpauth_url, (err, qrCodeUrl) => {
            if (err) {
                console.error("Error generando QR:", err);
                return res.status(500).json({ message: "Error generando QR" });
            }

            res.status(201).json({ 
                message: "Escanea el QR con Google Authenticator",
                qrCodeUrl,
                secret: secret.base32
            });
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor: " + error.message });
    }
});

export default router;
