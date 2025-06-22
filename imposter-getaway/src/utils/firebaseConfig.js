import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiB-RVURQX__Wbeo633GaoJcjMeMzHw14",
  authDomain: "imposter-getaway.firebaseapp.com",
  projectId: "imposter-getaway",
  // etc
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
