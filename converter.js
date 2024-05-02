const IDENTIFIER = {
  DISTANCE: "Distance",
  ELEV_GAIN: "Elev Gain",
  PACE: "Pace",
};

const UNIT = {
  FT: "ft",
  KM: "km",
  M: "m",
  MI: "mi",
  PER_KM: "/km",
  PER_MI: "/mi",
};

const FULL_UNIT = {
  FT: "feet",
  KM: "kilometers",
  M: "meters",
  MI: "miles",
  PER_KM: "minutes per kilometer",
  PER_MI: "minutes per mile",
};

function kmToMi(km) {
  const milesPerKm = 0.621371; // 1 kilometer is approximately equal to 0.621371 miles
  const miles = parseFloat(km) * milesPerKm;
  return miles.toFixed(2); // Return the converted value with 2 decimal places
}

function miToKm(mi) {
  const kmPerMile = 1.60934; // 1 mile is approximately equal to 1.60934 kilometers
  const kilometers = parseFloat(mi) * kmPerMile;
  return kilometers.toFixed(2); // Return the converted value with 2 decimal places
}

function mToFeet(meters) {
  // Remove commas from the input and convert to a floating-point number
  const cleanedMeters = parseFloat(meters.replace(/,/g, ""));
  const feetPerMeter = 3.28084; // 1 meter is approximately equal to 3.28084 feet
  const feet = cleanedMeters * feetPerMeter;
  const feetRounded = Math.floor(feet);
  return feetRounded.toLocaleString(); // Return the converted value rounded down to the nearest whole number
}

function feetToM(feet) {
  // Remove commas from the input and convert to a floating-point number
  const cleanedFeet = parseFloat(feet.replace(/,/g, ""));
  const metersPerFoot = 0.3048; // 1 foot is approximately equal to 0.3048 meters
  const meters = cleanedFeet * metersPerFoot;
  const metersRounded = Math.floor(meters);
  return metersRounded.toLocaleString(); // Return the converted value with 2 decimal places
}

function timePerKmToTimePerMi(pace) {
  // Split the pace string into minutes and seconds
  const [minutes, seconds] = pace.split(":").map(parseFloat);

  // Calculate the total time in minutes per kilometer
  const totalTimeInMinutes = minutes + seconds / 60;

  // Convert minutes per kilometer to minutes per mile
  const totalTimeInMiles = totalTimeInMinutes * 1.60934; // Conversion factor: 1 mile = 1.60934 kilometers

  // Calculate minutes and seconds per mile
  const minutesPerMile = Math.floor(totalTimeInMiles);
  const secondsPerMile = Math.round((totalTimeInMiles - minutesPerMile) * 60);

  // Format the result as a time string
  return `${minutesPerMile}:${secondsPerMile < 10 ? "0" : ""}${secondsPerMile}`;
}

function timePerMiToTimePerKm(timePerMile) {
  // Split the time per mile string into minutes and seconds
  const [minutes, seconds] = timePerMile.split(":").map(parseFloat);

  // Calculate the total time in minutes per mile
  const totalTimeInMinutes = minutes + seconds / 60;

  // Convert minutes per mile to minutes per kilometer
  const totalTimeInKilometers = totalTimeInMinutes / 1.60934; // Conversion factor: 1 mile = 1.60934 kilometers

  // Calculate minutes and seconds per kilometer
  const minutesPerKm = Math.floor(totalTimeInKilometers);
  const secondsPerKm = Math.round((totalTimeInKilometers - minutesPerKm) * 60);

  // Format the result as a pace string
  return `${minutesPerKm}:${secondsPerKm < 10 ? "0" : ""}${secondsPerKm}`;
}

function replace(
  tag,
  content,
  baseUnit,
  convertedUnit,
  fullUnit,
  conversionFunction,
) {
  if (tag.title === fullUnit) {
    tag.setAttribute("data-converted", "");
    tag.textContent = "";
    const size = window.getComputedStyle(tag.parentElement).fontSize;
    if (parseFloat(size) > 20) {
      tag.parentElement.style.fontSize = "20px";
    }
    tag.parentElement.innerHTML += ` ${baseUnit}<br>${conversionFunction(tag.parentElement.textContent)} ${convertedUnit}`;
  }
}

function convert(element) {
  replace(element, IDENTIFIER.DISTANCE, UNIT.KM, UNIT.MI, FULL_UNIT.KM, kmToMi);
  replace(element, IDENTIFIER.ELEV_GAIN, UNIT.M, UNIT.FT, FULL_UNIT.M, mToFeet);
  replace(
    element,
    IDENTIFIER.PACE,
    UNIT.PER_KM,
    UNIT.PER_MI,
    FULL_UNIT.PER_KM,
    timePerKmToTimePerMi,
  );

  replace(element, IDENTIFIER.DISTANCE, UNIT.MI, UNIT.KM, FULL_UNIT.MI, miToKm);
  replace(
    element,
    IDENTIFIER.ELEV_GAIN,
    UNIT.FT,
    UNIT.M,
    FULL_UNIT.FT,
    feetToM,
  );
  replace(
    element,
    IDENTIFIER.PACE,
    UNIT.PER_MI,
    UNIT.PER_KM,
    FULL_UNIT.PER_MI,
    timePerMiToTimePerKm,
  );
}

const isConverted = (element) =>
  element.tagName === "ABBR" &&
  element.classList.contains("unit") &&
  element.hasAttribute("data-converted");

const checkForUnitElements = (element) => {
  if (element === undefined) {
    return;
  }
  if (!isConverted(element)) {
    convert(element);
  }
  for (const child of element?.children || []) {
    checkForUnitElements(child); // Recursive call to check child elements
  }
};

let observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      const addedNodes = mutation.addedNodes;
      addedNodes.forEach((node) => {
        checkForUnitElements(node); // Check all child elements of added nodes
      });
    }
  }
});
const config = { attributes: true, childList: true, subtree: true };
observer.observe(document, config);

window.addEventListener("load", () => {
  console.log("Page is fully loaded");
  const tags = document.getElementsByTagName("ABBR");
  for (const tag of tags) {
    if (!isConverted(tag)) {
      convert(tag);
    }
  }
});
