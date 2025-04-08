import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import User from '../models/User.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ 
                message: "Cuenta no verificada",
                requiresVerification: false,
                requires2FA: false
            });
        }

        return res.status(200).json({
            message: "Por favor ingresa tu código 2FA",
            requires2FA: true,
            tempToken: jwt.sign(
                { userId: user._id, email: user.email, firstName: user.firstName},
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            )
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor: " + error.message });
    }
});

// Verificación 2FA
router.post('/verify-2fa', async (req, res) => {
    const { tempToken, code } = req.body;

    try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 1
        });

        if (!verified) {
            return res.status(401).json({ message: "Código 2FA inválido" });
        }

        const authToken = jwt.sign(
            { userId: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, rol: user.rol},
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            message: "Autenticación exitosa",
            token: authToken,
            user: {
                firstName: user.firstName,
                email: user.email,
                lastName: user.lastName,
                rol: user.rol 
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor: " + error.message });
    }
});

export default router;
