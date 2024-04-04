/**
 * Everything related to firebase is here
 * @author daniel.vollmer, valentin.müller, lorenz.lederer
 */
import { initializeApp } from "firebase/app";
import { get } from "https://unpkg.com/idb-keyval@5.0.2/dist/esm/index.js";
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

/**
 * Function for initializing the connection to Firebase
 * @returns {Object} app - The firebase app object
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

/**
 * Function for adding a user to the Firebase database.
 * @param {sha512} id
 * @param {sha512} passwordHash
 * @param {int} role
 * @param {boolean} verified (only for secratary after typing in master password)
 * @author daniel.vollmer
 */
async function addUser(id, passwordHash, role, verified) {
  await setDoc(doc(getFirestore(firebaseInit()), "users", id), {
    id: id,
    password: passwordHash,
    role: role,
    verified: verified || false,
  });
}

/**
 * Fucntion for logging in a user and authenticating the password against the firestore.
 * @param {sha512} id
 * @param {sha512} hashedPassword
 * @returns boolean
 * @author valentin.müller
 */
async function userLogin(id, hashedPassword) {
  const docRef = doc(getFirestore(firebaseInit()), "users", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.verified === true && data.password === hashedPassword) {
      return data.role;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

/**
 * Getting the "attendence list" from Firebase.
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
  //Getting present students
  querySnapshot.forEach((doc) => {
    presentSerialNos.push(doc.data().serialNo);
    //Fetching the data from firestore with the mapping file
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
  //Getting list of not present students
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

/**
 * Deleting the documents from the already checked from attendance from the Firestore
 * @param {Array} docIds - Array of document ids to delete
 * @author lorenz.lederer
 */
async function deleteDocs(docIds) {
  console.log(docIds);
  for (let docId of docIds) {
    console.log(docId);
    await deleteDoc(doc(getFirestore(firebaseInit()), "attendance", docId));
  }
}

/**
 * Getting the dates with attendence data from the Firestore, so the calendar can be marked with the attendence data.
 * @returns {Array} datesWithAttendence - Array of dates with attendence data
 * @author daniel.vollmer
 */
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

/**
 * Confirming the registration of a user in the database.
 * @param {sha512} id - The id of the user to confirm the registration for
 * @returns {boolean} - True if the registration was successful, false if the user is already verified or does not exist
 * @author valentin.müller
 */
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

/**
 * Function for recording the attendance of a student in the database.
 * @param {string} serialNumber - The serial number of the student
 * @param {string} course - The course the student is attending
 * @returns {boolean} - True if the attendance was recorded successfully, false if not
 * @author valentin.müller
 */
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

/**
 * Function for checking the master password
 * @param {string} promptedMasterPw - The master password the user entered
 * @returns {boolean} - True if the master password is correct, false if not
 * @author daniel.vollmer
 */
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
