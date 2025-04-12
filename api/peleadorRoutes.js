import express from 'express';
import mongoose from 'mongoose';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Modelo Peleador (deberías moverlo a un archivo aparte /models/Peleador.js)
const PeleadorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  nombre: { type: String, required: true },
  estatura: { type: Number, required: true },
  peso: { type: Number, required: true },
  habilidades: [String],
  record: { type: String, default: '0-0-0' },
  estiloCombate: { type: String, required: true }
}, { timestamps: true });

const Peleador = mongoose.model('Peleador', PeleadorSchema);

// Endpoint para verificar perfil (checkFighterProfile)
router.get('/peleador/:userId', authenticateToken, async (req, res) => {
    try {
    // Verificar que el usuario solicita su propio perfil
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const peleador = await Peleador.findOne({ userId: req.params.userId });
    
    if (!peleador) {
      return res.status(404).json({ 
        exists: false,
        message: "Perfil de peleador no encontrado" 
      });
    }
    
    res.json({
      exists: true,
      profile: peleador
    });
    
  } catch (error) {
    console.error("Error en checkFighterProfile:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Endpoint para crear perfil (handleCreateProfile)
router.post('/peleador', authenticateToken, async (req, res) => {
  try {
    const { nombre, estatura, peso, habilidades, estiloCombate } = req.body;
    
    // Validaciones básicas
    if (!nombre || !estatura || !peso || !estiloCombate) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Verificar si ya existe perfil
    const existePerfil = await Peleador.findOne({ userId: req.user.userId });
    if (existePerfil) {
      return res.status(400).json({ message: "Ya existe un perfil para este usuario" });
    }

    // Crear nuevo perfil
    const nuevoPeleador = new Peleador({
      userId: req.user.userId,
      nombre,
      estatura: Number(estatura),
      peso: Number(peso),
      habilidades: habilidades?.split(',').map(h => h.trim()) || [],
      estiloCombate
    });

    await nuevoPeleador.save();
    
    res.status(201).json({
      success: true,
      message: "Perfil creado exitosamente",
      profile: nuevoPeleador
    });

  } catch (error) {
    console.error("Error en handleCreateProfile:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ya existe un perfil para este usuario" });
    }
    
    res.status(500).json({ message: "Error al crear perfil" });
  }
});

// Obtener todos los peleadores
router.get('/peleadores', authenticateToken, async (req, res) => {
  try {
      const peleadores = await Peleador.find()
          .select('-__v -createdAt -updatedAt')
          .populate({
              path: 'userId', // <- el nombre del virtual que declaraste
              select: 'profileImage' // <- solo traes la imagen
          })
          .limit(50);

      res.json(peleadores);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


// Obtener los últimos 3 peleadores registrados
router.get('/latest', authenticateToken, async (req, res) => {
  try {
      const peleadores = await Peleador.find()
          .sort({ createdAt: -1 }) // Ordenar por los más recientes
          .limit(3) // Solo 3 resultados
          .select('nombre peso estatura estiloCombate userId') // `fotoPerfil` ya no se usa si vas por `usuario.profileImage`
          .populate({
              path: 'userId',
              select: 'profileImage' // Solo traemos la imagen
          });

      res.json(peleadores);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


export default router;