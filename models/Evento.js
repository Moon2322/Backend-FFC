import mongoose from 'mongoose';

const EventoSchema = new mongoose.Schema({
  fecha: { 
    type: Date, 
    required: true,
    index: true 
  },
  pesoCategoria: {
    type: String,
    required: true
  },
  peleador1: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Peleador',
    required: true 
  },
  peleador2: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Peleador',
    required: true 
  },
  resultado: {
    type: String,
    enum: ['pendiente', 'peleador1', 'peleador2', 'empate', 'cancelada'],
    default: 'pendiente'
  },
  rondas: {
    type: Number,
    default: 3
  },
  creadoEn: {
    type: Date,
    default: Date.now
  }
}, { 
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Populate automático para las relaciones
EventoSchema.pre('find', function() {
  this.populate('peleador1 peleador2');
});

EventoSchema.virtual('detalles').get(function() {
  return `Combate de ${this.pesoCategoria} - ${this.fecha.toLocaleDateString()}`;
});

export default mongoose.models.Evento || mongoose.model('Evento', EventoSchema);