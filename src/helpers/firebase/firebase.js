/**
 * Everything related to firebase is here
 * @author daniel
 */
import { initializeApp } from "firebase/app";
import { get } from "https://unpkg.com/idb-keyval@5.0.2/dist/esm/index.js";
import file from "./test.json";
import { readFile, writeFile } from "src/helpers/util.js";
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

async function addUser(id, passwordHash, role, verified) {
  await setDoc(doc(getFirestore(firebaseInit()), "users", id), {
    id: id,
    password: passwordHash,
    role: role,
    verified: verified || false,
  });
}

async function userLogin(id, hashedPassword) {
  const docRef = doc(getFirestore(firebaseInit()), "users", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.verified === true && data.password === hashedPassword) {
      return data.role;
      console.log("User is verified and password is correct");
    } else {
      return false;
      console.log("User is not verified or password is incorrect");
    }
  } else {
    return false;
    console.log("User does not exist");
  }
}

/**
 * Getting the "attendence list" from Firebase
 * @param {Date} startDate
 * @param {Date} endDate
 * @author daniel
 */
async function getCheckIns(startDate, endDate, course) {
  const mappingFileHandle = await get("file");
  const text = await readFile(mappingFileHandle);
  let mappingJson = JSON.parse(text);
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
    where("course", "==", hashString(course))
  );
  const querySnapshot = await getDocs(q);
  let presentSerialNos = [];
  querySnapshot.forEach((doc) => {
    presentSerialNos.push(doc.data().serialNo);
    let student = mappingJson.find(
      (s) => s.serialNumber === doc.data().serialNo
    );
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
      !presentSerialNos.includes(student.serialNumber)
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
  console.log(docIds);
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
      console.log("User is already verified");
    }
  } else {
    console.error("User does not exist");
  }
}

// Attendence recording

async function recordAttendance(serialNumber, course) {
  const db = getFirestore(firebaseInit());
  const timestamp = Timestamp.now();
  const docRef = doc(db, "attendance", timestamp.toString());

  await setDoc(docRef, {
    serialNo: serialNumber,
    course: hashString(course),
    checkInTime: Timestamp.now(),
  });
}

async function checkMasterPassword(promptedMasterPw) {
  const docRef = doc(
    getFirestore(firebaseInit()),
    "masterpasswords",
    "masterpassword_on"
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (hashString(promptedMasterPw) == data.masterpassword) {
      console.log("Same");
      return true;
    } else {
      return false;
    }
  }
  return false;
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
  checkMasterPassword,
};
