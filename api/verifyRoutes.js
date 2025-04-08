import express from 'express';
import speakeasy from 'speakeasy';
import User from '../models/User.js';

const router = express.Router();

router.post('/verify', async (req, res) => {
    const { email, token } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1  
        });

        if (verified) {
            user.isVerified = true;
            await user.save();
            res.json({ message: "Cuenta verificada con éxito." });
        } else {
            res.status(400).json({ message: "Código inválido." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor: " + error.message });
    }
});

export default router;
