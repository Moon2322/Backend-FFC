// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
  appId: process.env.FIREBASE_APPID
};


const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Función para obtener URL de imagen predeterminada
export const getDefaultProfileImage = async () => {
  try {
    const imageRef = ref(storage, 'FFC/default-profile.png');
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Error obteniendo imagen predeterminada:", error);
    return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"; // Fallback
  }
};

export { storage };