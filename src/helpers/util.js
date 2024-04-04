/**
 * Function for getting possible course-years, e.g. ON21, ON22, ON23
 * @author daniel.vollmer, valentin.müller, luca.breisch, lorenz.lederer, marius.möldner
 */

import Cookies from "js-cookie";

/**
 * Function for getting possible course-years, e.g. ON21, ON22, ON23
 * @returns {Array} possibleYears - Array of possible course-years
 * @author luca.breisch
 */
function getYears() {
  let possibleYears = new Array();
  const currentYear = new Date().getFullYear() - 2000;
  for (let i = currentYear - 3; i < currentYear; i++) {
    possibleYears.push(i);
  }
  return possibleYears;
}

/**
 * Function for reading a file from a file handle
 * @param {file handle} handle
 * @returns {string} text - The content of the file as a string
 * @author marius.möldner
 */
async function readFile(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  return text;
}

/**
 * Function for writing a file to a file handle
 * @param {file handle} handle
 * @param {string} text
 * @author lorenz.lederer
 */
async function writeFile(handle, text) {
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

/**
 * Function for reading a cookie from the browser
 * @returns {object} user - The user object from the cookie
 * @author valentin.müller
 */
function readCookie() {
  const userCookie = Cookies.get("user");
  if (userCookie) {
    console.log("Cookie gefunden");
    const user = parseCookie(userCookie);
    return user;
  } else {
    console.log("Kein Cookie gefunden");
    return null;
  }
}

/**
 * Function for parsing a cookie because the cookie is stored as a string and needs to be parsed to an object
 * @param {cookie-object} cookie
 * @returns {json} parsedCookie - The parsed cookie as an object
 * @author daniel.vollmer
 */
function parseCookie(cookie) {
  const decodedCookie = decodeURIComponent(cookie);
  const parsedCookie = JSON.parse(decodedCookie);
  return parsedCookie;
}

export { getYears, readFile, writeFile, readCookie };
