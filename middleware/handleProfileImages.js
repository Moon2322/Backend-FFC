import { getDefaultProfileImage } from '../firebase/firebase.js';

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

export default setProfileImageUrls;
