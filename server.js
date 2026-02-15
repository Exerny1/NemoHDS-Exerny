const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();

const serverConfig = {
  // Your Visual Crossing API Key
  "vcApiKey": "DEZCY7LHJU97WM87WHLNCMV8L", 
  "units": "us", // Visual Crossing uses 'us', 'metric', or 'uk'

  "webPort": 9001,

  "locationIndex": {
    "locations": [
      "Manassas, VA" // Main location set to Manassas
    ],
    "ldlLocations": [ 
      "Manassas, VA" // LDL locations set to Manassas
    ],
  }
}

let allWeather = {};
let ldlWeather = {};

/**
 * Fetches comprehensive weather data from Visual Crossing
 * One call retrieves current, hourly, and daily forecasts.
 */
async function getVCWeather(location) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${serverConfig.units}&key=${serverConfig.vcApiKey}&contentType=json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[Error] Failed to fetch data for ${location}:`, error.message);
    return null;
  }
}

async function loadAllCities() {
  for (const location of serverConfig.locationIndex.locations) {
    const data = await getVCWeather(location);
    if (data) {
      allWeather[location] = {
        0: {
          coordinates: { lat: data.latitude, lon: data.longitude },
          current: data.currentConditions,
          weekly: data.days,
          alerts: data.alerts || [],
          // Visual Crossing returns hourly inside the daily 'days' array
          hourly: data.days[0].hours 
        }
      };
      console.log(`Processed Main: ${location}`);
    }
  }
}

async function loadAllLDLCities() {
  for (const location of serverConfig.locationIndex.ldlLocations) {
    const data = await getVCWeather(location);
    if (data) {
      ldlWeather[location] = {
        0: {
          coordinates: { lat: data.latitude, lon: data.longitude },
          current: data.currentConditions,
          alerts: data.alerts || [],
          hourly: data.days[0].hours,
          forecast: data.days,
          aqi: null, // Basic VC API doesn't include AQI in the same call
          almanac: null 
        }
      };
      console.log(`Processed LDL: ${location}`);
    }
  }
}

async function saveDataToJson() {
  const publicDir = path.join(__dirname, 'public');
  const jsonFile = path.join(publicDir, 'wxData.json');
  const ldlFile = path.join(publicDir, 'ldlData.json');

  try {
    // Ensure the public directory exists
    await fs.mkdir(publicDir, { recursive: true });
    
    await fs.writeFile(jsonFile, JSON.stringify(allWeather, null, 2));
    await fs.writeFile(ldlFile, JSON.stringify(ldlWeather, null, 2));
    console.log("JSON files saved to /public");
  } catch (err) {
    console.error("Error saving JSON:", err);
  }
}

async function runDataInterval() {
  console.log(`--- Starting Update Cycle: ${new Date().toLocaleTimeString()} ---`);
  await loadAllCities();
  await loadAllLDLCities();
  await saveDataToJson();
  console.log(`NemoHDS is running on http://localhost:${serverConfig.webPort}`);
  console.log(`Ctrl + C to quit`);
}

// Initial Run
runDataInterval();

// Set interval (8 minutes)
setInterval(runDataInterval, 480000);

// Server Setup
app.use(express.static(path.join(__dirname, 'public')));

app.get('/locations', (req, res) => {
  res.json({
    locationIndex: serverConfig.locationIndex,
    units: serverConfig.units
  });
});

app.listen(serverConfig.webPort, () => {});

process.on('SIGINT', () => { console.log("Exiting..."); process.exit(); });
