const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();

const serverConfig = {
  // Updated to use your Visual Crossing Key
  "vcApiKey": "DEZCY7LHJU97WM87WHLNCMV8L", 
  "units": "us", // Visual Crossing uses 'us', 'metric', or 'uk'

  "webPort": 9001,

  "locationIndex": {
    "locations": [
      "Cherry Hill",
      "Mount Laurel",
      "Voorhees",
      "Camden NJ",
      "Mount Holly"
    ],
    "ldlLocations": [
      "Cherry Hill, NJ",
      "Mount Laurel, NJ",
      "Voorhees, NJ",
      "Camden, NJ",
      "Mount Holly, NJ",
      "Woodbury, NJ"
    ],
  },
  "seasons": {
    "winter": true,
    "spring": true
  }
}

let allWeather = {};
let ldlWeather = {};

// REFACTORED FOR VISUAL CROSSING
async function getWeather(location) {
  try {
    // Visual Crossing provides almost everything in one Timeline call
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${serverConfig.units}&key=${serverConfig.vcApiKey}&contentType=json`);
    
    if (!response.ok) throw new Error(`Visual Crossing API error: ${response.statusText}`);
    
    const data = await response.json();

    // Mapping VC data to your existing structure to prevent frontend breakage
    return {
      current: data.currentConditions,
      weekly: data.days,
      alerts: data.alerts || [],
      radar: null, // Visual Crossing doesn't provide a direct PNG radar URL like TWC
      special: { pollen: null }, // Not provided by basic VC API
      fullData: data // Original response for LDL use
    };
  } catch (error) {
    console.error(`Error fetching from Visual Crossing: ${error.message}`);
    return null;
  }
}

async function loadAllCities() {
  for (const location of serverConfig.locationIndex.locations) {
    try {
      const weather = await getWeather(location);
      if (!weather) continue;

      allWeather[location] = {
        0: {
          current: weather.current,
          weekly: weather.weekly,
          alerts: weather.alerts,
          coordinates: { lat: weather.fullData.latitude, lon: weather.fullData.longitude }
        }
      };

      console.log(`Processed ${location}`);
    } catch (error) {
      console.error(`Error processing ${location}: ${error.message}`);
    }  
  }
}

// Simplified LDL loader for Visual Crossing
async function loadAllLDLCities() {
  for (const location of serverConfig.locationIndex.ldlLocations) {
    try {
      const weather = await getWeather(location);
      if (!weather) continue;

      ldlWeather[location] = {
        0: {
          current: weather.current,
          forecast: weather.weekly,
          alerts: weather.alerts,
          hourly: weather.fullData.days[0].hours, // First day's hours
          coordinates: { lat: weather.fullData.latitude, lon: weather.fullData.longitude }
        }
      };
      console.log(`Processed LDL ${location}`);
    } catch (error) {
      console.error(`Error processing LDL ${location}: ${error.message}`);
    }
  }
}

async function saveDataToJson() {
  const jsonFile = path.join(__dirname, 'public/wxData.json');
  const ldlFile = path.join(__dirname, 'public/ldlData.json');

  // Ensure public directory exists
  await fs.mkdir(path.join(__dirname, 'public'), { recursive: true });
  
  await fs.writeFile(jsonFile, JSON.stringify(allWeather, null, 2));
  await fs.writeFile(ldlFile, JSON.stringify(ldlWeather, null, 2));
}

async function runDataInterval() {
  await loadAllCities();
  await loadAllLDLCities();
  await saveDataToJson();
  console.log("Data Refresh Complete.");
}

runDataInterval();
setInterval(runDataInterval, 480000);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/locations', (req, res) => {
  res.json({ locationIndex: serverConfig.locationIndex, units: serverConfig.units });
});

app.listen(serverConfig.webPort, () => {
    console.log(`NemoHDS running on http://localhost:${serverConfig.webPort}`);
});
