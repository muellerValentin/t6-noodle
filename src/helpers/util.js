/**
 * Function for getting possible course-years, e.g. ON21, ON22, ON23
 * @author daniel
 */
function getYears() {
  let possibleYears = new Array();
  const currentYear = new Date().getFullYear() - 2000;
  for (let i = currentYear - 3; i < currentYear; i++) {
    possibleYears.push(i);
  }
  return possibleYears;
}

async function readFile(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  return text;
}

async function writeFile(handle, text) {
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

export { getYears, readFile, writeFile };
