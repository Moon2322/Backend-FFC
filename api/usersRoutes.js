import express from 'express';
import authenticateToken from '../middleware/authMiddleware.js';
import User from '../models/User.js'; // Asegúrate de que la ruta sea correcta



const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
      const user = await User.findById(req.user.userId).select('-password');
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
      const updatedUser = await User.findByIdAndUpdate(
          req.user.userId,
          { profileImage: req.body.profileImage },
          { new: true }
      );
      res.json(updatedUser);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});
export default router;
