export let data;
export let ldlData;
export let imageIndex;
export let locationsList;

import { getInitialData } from "./weather.js";
import { runInitialLDL } from "./ldl.js";
import { everythingConfigLmao } from "./main.js";
import { config } from "./config.js";

// --- LOCATION ROTATION SETUP ---
const cities = [
  "Manassas, VA",
];
let cityIndex = 0;

function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

async function fetchData() {
  data = null;
  ldlData = null;

  try {
    const [response, ldlResponse] = await Promise.all([
      fetch('./wxData.json'),
      fetch('./ldlData.json'),
    ]);

    if (!response.ok || !ldlResponse.ok) {
      throw new Error("One or more JSON files failed to load.");
    }

    const rawData = await response.json();
    const rawLdlData = await ldlResponse.json();
    
    // Pick the current city from our list
    const cityName = cities[cityIndex]; 

    if (rawData[cityName]) {
      // Use index 0 of the array for that specific city
      data = rawData[cityName][0]; 
      
      if (!data.current && data.currentConditions) {
        data.current = data.currentConditions;
      }

      if (data.current) {
        // 1. Numbers (Rounding)
        const speed = Math.round(data.current.windspeed || 0);
        const gust = Math.round(data.current.windgust || 0);
        const temp = Math.round(data.current.temp || 0);
        const feels = Math.round(data.current.feelslike || temp);

        // 2. Mapping
        data.current.windSpeed = speed;
        data.current.wind_speed = speed;
        data.current.windspeed = speed;
        data.current.windGust = gust;
        data.current.wind_gust = gust;
        data.current.feelsLike = feels;
        data.current.feels_like = feels;
        data.current.apparentTemp = feels;

        // 3. Direction
        const dirText = getWindDirection(data.current.winddir || 0);
        data.current.windDir = dirText;
        data.current.wind_dir = dirText;
        data.current.windDirection = dirText;

        // 4. Units
        data.current.windUnits = "MPH";
        data.current.tempUnits = "F";
        data.current.unit = "MPH"; 
      }
    }

    if (rawLdlData[cityName]) {
      ldlData = rawLdlData[cityName][0];
    }

    console.log(`[dataLoader.js] Switched to ${cityName}:`, data);

    // MOVE TO NEXT CITY FOR THE NEXT REFRESH
    cityIndex = (cityIndex + 1) % cities.length;

  } catch (error) {
    console.error(`[dataLoader.js] Error:`, error.message);
  }
}

// ... (Rest of the helper functions: fetchLocationsList, fetchBackgroundsIndex)

async function fetchLocationsList() {
  locationsList = null;
  try {
    const response = await fetch('/locations');
    locationsList = await response.json();
  } catch (e) { console.warn("No locations list."); }
}

async function fetchBackgroundsIndex() {
  imageIndex = null;
  try {
    const response = await fetch('./imageIndex.json');
    imageIndex = await response.json();
  } catch (e) { console.warn("No image index."); }
}

async function runInitialProcesses() {
  await Promise.all([fetchData(), fetchLocationsList(), fetchBackgroundsIndex()]);
  if (data && ldlData) {
    if (config.presentationType != 1) getInitialData();
    if (config.presentationType != 2) runInitialLDL();
    everythingConfigLmao();
  }
}

// Set this interval shorter (e.g., 10000 for 10 seconds) if you want 
// the cities to rotate faster on your screen!
setInterval(fetchData, 1500000); 
runInitialProcesses();
