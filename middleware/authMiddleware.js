import jwt from 'jsonwebtoken';
import { getDefaultProfileImage } from '../firebase/firebase.js';


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 🆕 Añade este nuevo middleware
export const isAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    
    if (user.rol !== 'admin') { // ✅ Verificar rol
      return res.status(403).json({ message: 'Solo para administradores' });
    }
    
    req.user = user;
    next();
  });
};


const setProfileImageUrls = async (req, res, next) => {

  try {
    if (res.locals.userData) {
      const user = res.locals.userData;
      
      if (user.profileImage === "default") {
        user.profileImage = await getDefaultProfileImage();
      }
    }
    next();
  } catch (error) {
    console.error("Error procesando imágenes:", error);
    next();
  }
};

export default authenticateToken;