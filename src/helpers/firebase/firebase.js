/**
 * Everything related to firebase is here
 * @author daniel
 */
import { initializeApp } from "firebase/app";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
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

async function userLogin(id, hashedPassword) {
  const docRef = doc(getFirestore(firebaseInit()), "users", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.verified === true && data.password === hashedPassword) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// Confirm Registration
async function confirmRegistration(id) {
  const docRef = doc(getFirestore(firebaseInit()), "users", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.verified === false) {
      await updateDoc(docRef, { verified: true });
    } else {
      throw new Error("User is already verified");
    }
  } else {
    throw new Error("User does not exist");
  }
}

export { addUser, userLogin, confirmRegistration };
