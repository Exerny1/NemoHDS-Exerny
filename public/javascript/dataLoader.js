export let data;
export let ldlData;
export let imageIndex;
export let locationsList;

import { getInitialData } from "./weather.js";
import { runInitialLDL } from "./ldl.js";
import { everythingConfigLmao } from "./main.js";
import { config } from "./config.js";

async function fetchData() {
  data = null;
  ldlData = null;

  try {
    const [response, ldlResponse] = await Promise.all([
      fetch('./wxData.json'),
      fetch('./ldlData.json'),
    ]);

    if (!response.ok || !ldlResponse.ok) {
      throw new Error("One or more JSON files failed to load from the server.");
    }

    const rawData = await response.json();
    const rawLdlData = await ldlResponse.json();

    // Set your specific city name here
    const cityName = "Manassas, VA"; 

    if (rawData[cityName]) {
      data = rawData[cityName][0]; 
      
      // Map currentConditions to 'current' for the emulator's logic
      if (!data.current && data.currentConditions) {
        data.current = data.currentConditions;
      }

      // --- FIX FOR "UNDEFINED" AND DECIMAL NUMBERS ---
      if (data.current) {
        // 1. Map lowercase Visual Crossing keys to emulator's CamelCase keys
        // 2. Use Math.round() to change "40.4" to "40" for a cleaner look
        data.current.windSpeed = Math.round(data.current.windspeed || 0);
        data.current.windGust = Math.round(data.current.windgust || 0);
        data.current.feelsLike = Math.round(data.current.feelslike || data.current.temp);
        
        // 3. Fix the "undefined" unit strings
        // This attaches the text the display script is looking for
        data.current.windUnits = "MPH"; 
        data.current.gustUnits = "MPH";
        data.current.temperatureUnits = "F"; 
        
        // 4. Map Wind Direction (Optional but recommended)
        data.current.windDir = data.current.winddir;
      }

    } else {
      data = rawData; 
    }

    if (rawLdlData[cityName]) {
      ldlData = rawLdlData[cityName][0];
    } else {
      ldlData = rawLdlData;
    }

    console.log(`[dataLoader.js] Mapped & Cleaned Data:`, data);
  } catch (error) {
    console.error(`[dataLoader.js] Critical Error:`, error.message);
  }
}

async function fetchLocationsList() {
  locationsList = null;
  try {
    const response = await fetch('/locations');
    locationsList = await response.json();
  } catch (e) {
    console.warn("Could not fetch locations list.");
  }
}

async function fetchBackgroundsIndex() {
  imageIndex = null;
  try {
    const response = await fetch('./imageIndex.json');
    imageIndex = await response.json();
  } catch (e) {
    console.warn("Could not fetch image index.");
  }
}

async function runInitialProcesses() {
  await Promise.all([
    fetchData(),
    fetchLocationsList(),
    fetchBackgroundsIndex()
  ]);
  
  if (data && ldlData) {
    if (config.presentationType != 1) {
      getInitialData();
    }
    if (config.presentationType != 2) {
      runInitialLDL();
    }
    everythingConfigLmao();
  } else {
    console.error("Scripts did not run because 'data' is still null.");
  }
}

setInterval(fetchData, 1500000); // 25 min refresh
runInitialProcesses();
