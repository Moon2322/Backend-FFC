import express from 'express';
import mongoose from 'mongoose';
import authenticateToken from '../middleware/authMiddleware.js';
import isAdmin from '../middleware/authMiddleware.js';
import Evento from '../models/Evento.js';
import Peleador from '../models/Peleador.js';

const router = express.Router();

// Obtener eventos futuros
// En tu archivo de rutas de eventos (eventos.js)
router.get('/eventos', authenticateToken, async (req, res) => {
    try {
      const eventos = await Evento.find({
        fecha: { $gt: new Date() },
        resultado: 'pendiente'
      })
      .populate('peleador1 peleador2') // ¡Esto es crucial!
      .sort({ fecha: 1 });
  
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

router.get('/eventos/peleadores', authenticateToken, isAdmin, async (req, res) => {
    try {
      const peleadores = await Peleador.find().select('nombre peso estiloCombate');
      res.json(peleadores);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  router.post('/eventos', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { fecha, pesoCategoria, peleador1Id, peleador2Id, rondas } = req.body;
      
      // Validaciones básicas
      if (peleador1Id === peleador2Id) {
        return res.status(400).json({ message: "Los peleadores deben ser diferentes" });
      }
  
      const nuevoEvento = new Evento({
        fecha: new Date(fecha),
        pesoCategoria,
        peleador1: peleador1Id,
        peleador2: peleador2Id,
        rondas: rondas || 3
      });
  
      const eventoGuardado = await nuevoEvento.save();
      res.status(201).json(eventoGuardado);
  
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export default router;