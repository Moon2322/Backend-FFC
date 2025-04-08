import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// 1. Endpoint para solicitar restablecimiento de contraseña

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Generar código de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hora
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordCode = resetCode; // Guardamos el código
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Enviar correo con el código (sin enlace)
        await sendPasswordResetEmail(email, resetCode);

        res.json({ 
            message: "Correo de recuperación enviado",
            token: resetToken // Enviamos el token al frontend para verificación posterior
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Función para enviar correo (actualizada)
async function sendPasswordResetEmail(email, code) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: '"Soporte FFC" <soporte@FFC.com>',
        to: email,
        subject: 'Código para restablecer tu contraseña',
        html: `
            <p>Tu código de verificación es:</p>
            <h2 style="font-size: 24px; letter-spacing: 3px;">${code}</h2>
            <p>Este código expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, por favor ignora este correo.</p>
        `
    });
}

// 2. Endpoint para verificar token
router.post('/verify-reset-code', async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ 
            email,
            resetPasswordCode: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Código inválido o expirado" });
        }

        // Generar token temporal para permitir el cambio de contraseña
        const tempToken = jwt.sign(
            { userId: user._id, token: user.resetPasswordToken },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ 
            message: "Código verificado",
            tempToken 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Endpoint para actualizar contraseña
router.post('/reset-password', async (req, res) => {
    const { tempToken, newPassword } = req.body;
    try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        const user = await User.findOne({
            _id: decoded.userId,
            resetPasswordToken: decoded.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: "Token inválido o expirado" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export default router;
