import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './api/authRoutes.js';
import registerRoutes from './api/registerRoutes.js';
import verifyRoutes from './api/verifyRoutes.js';
import forgotPassword from './api/forgotPassword.js';
import peleadorRoutes from './api/peleadorRoutes.js'; // Nueva importación
import eventosRoutes from './api/eventosRoutes.js';


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch(err => console.error("❌ Error de conexión:", err));

// Rutas
app.use('/api', authRoutes);
app.use('/api', registerRoutes);
app.use('/api', verifyRoutes);
app.use('/api', forgotPassword);
app.use('/api', peleadorRoutes); // Nueva ruta
app.use('/api', eventosRoutes);


// Puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));