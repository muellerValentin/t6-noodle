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

export { getYears };
