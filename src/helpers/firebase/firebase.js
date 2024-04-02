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
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {} from "firebase/firestore";
import hashString from "../hashing/hashing";

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
async function getCheckIns(startDate, endDate, course) {
  console.log(course);
  let mappingJson = file; // Angenommen, dies enthält alle Studierenden
  let presentStudents = [];
  let notPresentStudents = [];
  let docIds = [];

  const attendenceCollection = collection(
    getFirestore(firebaseInit()),
    "attendance"
  );
  const q = query(
    attendenceCollection,
    where("checkInTime", ">=", Timestamp.fromDate(startDate)),
    where("checkInTime", "<=", Timestamp.fromDate(endDate)),
    where("course", "==", course)
  );
  const querySnapshot = await getDocs(q);
  let presentSerialNos = [];
  querySnapshot.forEach((doc) => {
    presentSerialNos.push(doc.data().serialNo);
    let student = mappingJson.find((s) => s.serialNo === doc.data().serialNo);
    if (student) {
      docIds.push(doc.id);
      presentStudents.push({
        forename: student.forename,
        lastname: student.lastname,
        checkIn: new Date(doc.data().checkInTime.seconds * 1000).toLocaleString(
          "DE"
        ),
      });
    }
  });
  mappingJson.forEach((student) => {
    if (
      student.course === course &&
      !presentSerialNos.includes(student.serialNo)
    ) {
      notPresentStudents.push({
        forename: student.forename,
        lastname: student.lastname,
      });
    }
  });

  return { presentStudents, notPresentStudents, docIds };
}
async function deleteDocs(docIds) {
  for (let docId of docIds) {
    console.log(docId);
    await deleteDoc(doc(getFirestore(firebaseInit()), "attendance", docId));
  }
}

async function getDatesWithAttendenceData() {
  let datesWithAttendence = [];
  const querySnapshot = await getDocs(
    collection(getFirestore(firebaseInit()), "attendance")
  );
  querySnapshot.forEach((doc) => {
    datesWithAttendence.push(
      new Date(doc.data().checkInTime.toDate())
        .toISOString()
        .split("T")[0]
        .replaceAll("-", "/")
    );
  });
  return datesWithAttendence;
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

// Attendence recording

async function recordAttendance(serialNumber, course) {
  const db = getFirestore(firebaseInit());
  const timestamp = Timestamp.now();
  const docRef = doc(db, "attendance", timestamp.toString());

  alert(course);

  await setDoc(docRef, {
    serialNo: serialNumber,
    course: hashString(course),
    checkInTime: Timestamp.now(),
  });
}

export {
  firebaseInit,
  addUser,
  userLogin,
  getCheckIns,
  deleteDocs,
  getDatesWithAttendenceData,
  confirmRegistration,
  recordAttendance,
};
