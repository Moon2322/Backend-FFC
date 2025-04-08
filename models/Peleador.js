import mongoose from "mongoose";

const PeleadorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'El ID de usuario es requerido'],
    unique: true 
  },
  nombre: { 
    type: String, 
    required: [true, 'El nombre del peleador es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
  },
  estatura: { 
    type: Number, 
    required: [true, 'La estatura es requerida'],
    min: [100, 'La estatura mínima es 100 cm'],
    max: [200, 'La estatura máxima es 200 cm']
  },
  peso: { 
    type: Number, 
    required: [true, 'El peso es requerido'],
    min: [40, 'El peso mínimo es 40 kg'],
    max: [120, 'El peso máximo es 120 kg']
  },
  habilidades: {
    type: [String],
    default: [],
    validate: {
      validator: function(habs) {
        return habs.every(h => h.length <= 30);
      },
      message: 'Cada habilidad debe tener máximo 30 caracteres'
    }
  },
  record: {
    type: String,
    default: '0-0-0',
    match: [/^\d+-\d+-\d+$/, 'El formato del récord debe ser X-X-X (ej: 5-2-0)']
  },
  estiloCombate: {
    type: String,
    required: [true, 'El estilo de combate es requerido'],
    enum: {
      values: ['Boxeo', 'Jiu-Jitsu', 'Muay Thai', 'Wrestling', 'MMA', 'Otro'],
      message: 'Estilo de combate no válido'
    }
  },
  fotoPerfil: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware para actualizar antes de guardar
PeleadorSchema.pre('save', function(next) {
  // Capitalizar nombre
  if (this.nombre) {
    this.nombre = this.nombre.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Limpiar habilidades
  if (this.habilidades) {
    this.habilidades = this.habilidades.map(h => h.trim());
  }
  
  next();
});

// Relación virtual con el usuario
PeleadorSchema.virtual('usuario', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});


export default mongoose.models.Peleador || mongoose.model('Evento', EventoSchema);