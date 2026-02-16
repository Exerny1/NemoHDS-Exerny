export let data;
export let ldlData;
export let imageIndex;
export let locationsList;

import { getInitialData } from "./weather.js";
import { runInitialLDL } from "./ldl.js";
import { everythingConfigLmao } from "./main.js";
import { config } from "./config.js";

async function fetchData() {
  // Reset data to prevent using old or "undefined" states
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

    // --- DATA MAPPING FIX ---
    // Visual Crossing via server.js nests data under the city name.
    // We "pull it out" here so weather.js sees a clean object.
    const cityName = "Manassas, VA"; 

    if (rawData[cityName]) {
      data = rawData[cityName][0]; 
      // This ensures 'data.current' exists if the app looks for it
      if (!data.current && data.currentConditions) {
        data.current = data.currentConditions;
      }
    } else {
      data = rawData; // Fallback if structure changes
    }

    if (rawLdlData[cityName]) {
      ldlData = rawLdlData[cityName][0];
    } else {
      ldlData = rawLdlData;
    }

    console.log(`[dataLoader.js] Mapped Data for ${cityName}:`, data);
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
  // 1. Fetch all data first
  await Promise.all([
    fetchData(),
    fetchLocationsList(),
    fetchBackgroundsIndex()
  ]);
  
  // 2. Trigger the dependent scripts once data is ready
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

// Refresh every 25 minutes (1500000ms)
setInterval(fetchData, 1500000);

// Kick off the load process
runInitialProcesses();
