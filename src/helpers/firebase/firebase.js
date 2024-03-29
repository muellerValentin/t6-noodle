/**
 * Everything related to firebase is here
 * @author daniel
 */
import { initializeApp } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const db = getFirestore(firebaseInit());

/**
 * Function for initializing the connection to Firebase
 * @author daniel
 */
function firebaseInit() {
  const firebaseConfig = {
    apiKey: "AIzaSyCupHhjqvoXWDZwTv1Aa_xZY9MVrWmiH_U",
    authDomain: "noodle-t6.firebaseapp.com",
    projectId: "noodle-t6",
    storageBucket: "noodle-t6.appspot.com",
    messagingSenderId: "427139124965",
    appId: "1:427139124965:web:0f3ca972889e350ebf8e0c",
  };

  const app = initializeApp(firebaseConfig);
  return app;
}

async function addUser(id, passwordHash, role) {
  await setDoc(doc(getFirestore(firebaseInit()), "users", id), {
    id: id,
    password: passwordHash,
    role: role,
    verified: false,
  });
}

export default addUser;
