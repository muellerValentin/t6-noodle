/**
 * Everything related to firebase is here
 * @author daniel
 */
import { initializeApp } from "firebase/app";
import file from "./test.json";
import {
  setDoc,
  getDocs,
  getDoc,
  getFirestore,
  collection,
  query,
  where,
  doc,
  Timestamp,
} from "firebase/firestore";
import {} from "firebase/firestore";

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

/**
 * Getting the "attendence list" from Firebase
 * @param {Date} startDate
 * @param {Date} endDate
 * @author daniel
 */
async function getCheckIns(startDate, endDate) {
  let mappingJson = file;
  let rows = new Array();

  const attendenceCollection = collection(
    getFirestore(firebaseInit()),
    "attendence"
  );
  const q = query(
    attendenceCollection,
    where("checkInTime", ">=", Timestamp.fromDate(startDate)),
    where("checkInTime", "<=", Timestamp.fromDate(endDate))
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    for (let student of mappingJson) {
      if (student.serialNo === doc.data().serialNo) {
        rows.push({
          forename: student.forename,
          lastname: student.lastname,
          course: student.course,
          checkIn: new Date(
            doc.data().checkInTime.seconds * 1000
          ).toLocaleString("DE"),
        });
      }
    }
  });
  return rows;
}

export { addUser, userLogin, getCheckIns };
