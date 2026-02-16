const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();

const serverConfig = {
  "vcApiKey": "DEZCY7LHJU97WM87WHLNCMV8L", 
  "units": "us", 
  "webPort": 9001,
  "locationIndex": {
    "locations": ["Manassas, VA"],
    "ldlLocations": ["Manassas, VA"]
  }
};

let allWeather = {};
let ldlWeather = {};

// CORE FETCH FUNCTION
async function getVCWeather(location) {
  // We add 'include' parameters to ensure 'currentConditions' isn't undefined
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${serverConfig.units}&key=${serverConfig.vcApiKey}&contentType=json&include=current,hours,days,alerts`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();

    // Safety check: if currentConditions is missing, create a placeholder
    if (!data.currentConditions) {
      console.warn(`Warning: No current conditions for ${location}`);
      data.currentConditions = { temp: "N/A", conditions: "Data Unavailable" };
    }
    return data;
  } catch (error) {
    console.error(`Fetch failed for ${location}:`, error.message);
    return null;
  }
}

async function updateData() {
  console.log(`[${new Date().toLocaleTimeString()}] Refreshing weather...`);
  
  for (const loc of serverConfig.locationIndex.locations) {
    const data = await getVCWeather(loc);
    if (data) {
      allWeather[loc] = {
        0: {
          current: data.currentConditions,
          weekly: data.days,
          alerts: data.alerts || [],
          coordinates: { lat: data.latitude, lon: data.longitude }
        }
      };
    }
  }

  for (const loc of serverConfig.locationIndex.ldlLocations) {
    const data = await getVCWeather(loc);
    if (data) {
      ldlWeather[loc] = {
        0: {
          current: data.currentConditions,
          forecast: data.days,
          hourly: data.days[0].hours,
          alerts: data.alerts || []
        }
      };
    }
  }

  // Save to JSON files in /public
  try {
    const publicPath = path.join(__dirname, 'public');
    await fs.mkdir(publicPath, { recursive: true });
    await fs.writeFile(path.join(publicPath, 'wxData.json'), JSON.stringify(allWeather, null, 2));
    await fs.writeFile(path.join(publicPath, 'ldlData.json'), JSON.stringify(ldlWeather, null, 2));
    console.log("Success: wxData.json and ldlData.json updated.");
  } catch (err) {
    console.error("File Save Error:", err.message);
  }
}

// Start the loop
updateData();
setInterval(updateData, 480000); // 8 minutes

// EXPRESS SERVER SETUP
app.use(express.static(path.join(__dirname, 'public')));

app.get('/locations', (req, res) => {
  res.json({ locationIndex: serverConfig.locationIndex, units: serverConfig.units });
});

// Use dynamic port for Glitch/Render or 9001 for Termux
const PORT = process.env.PORT || serverConfig.webPort;
app.listen(PORT, () => {
  console.log(`\n--- SERVER LIVE ---`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Status: Fetching for Manassas, VA`);
});
