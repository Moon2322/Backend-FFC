import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "El nombre es obligatorio"]
    },
    lastName: {
        type: String,
        required: [true, "Los apellidos son obligatorios"]
    },
    email: { 
        type: String, 
        unique: true,
        required: [true, "El email es obligatorio"],
        match: [/^\S+@\S+\.\S+$/, "Por favor ingresa un email válido"]
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"]
    },
    rol: { 
        type: String,
        enum: ['usuario', 'peleador', 'admin'],
        default: 'usuario'
    },
    twoFactorSecret: {
        type: String,
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordCode: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    profileImage: {
        type: String,
        default: "default" 
      }
});

// Middleware para actualizar la fecha de modificación
UserSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Método para limpiar los campos de reset
UserSchema.methods.clearResetTokens = function() {
    this.resetPasswordToken = undefined;
    this.resetPasswordCode = undefined;
    this.resetPasswordExpires = undefined;
    return this.save();
};

export default mongoose.models.User || mongoose.model("User", UserSchema);