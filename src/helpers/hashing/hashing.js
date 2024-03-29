/**
 * This file contains all utilities for all hashing needed in Noodle.
 * @author daniel
 */
import { sha512 } from "js-sha512";

/**
 * This functions hash a given string with sha512
 * @argument string to be hashed
 * @returns hashed string
 * @author daniel
 */
function hashString(stringToBeHashed) {
  if (stringToBeHashed) {
    return sha512(stringToBeHashed);
  } else {
    console.log("Empty string passed");
  }
}

export default hashString;
