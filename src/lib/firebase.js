import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDAhUIMBlwBN37YbtzVSsU2vxIluQy-ywI",
  authDomain: "shura-pro-support.firebaseapp.com",
  projectId: "shura-pro-support",
  storageBucket: "shura-pro-support.firebasestorage.app",
  messagingSenderId: "900438081634",
  appId: "1:900438081634:web:16c025626fa86b1b3d913b",
  measurementId: "G-GJWC5M414D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Customize Google Auth Provider
provider.setCustomParameters({
  prompt: 'select_account'
});
