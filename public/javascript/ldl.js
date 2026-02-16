import { ldlData } from './dataLoader.js'
import { config, weatherIcons } from "./config.js";
import { locationsList } from './dataLoader.js';

const ldlPresentationSlides = {
    "0": { htmlID: "ldl-current", durationMS: "10000" },
    "1": { htmlID: "ldl-hourly", durationMS: "30000" }, //30000
    "2": { htmlID: "ldl-forecast", durationMS: "15000" }, //15000
    "3": { htmlID: "ldl-extended", durationMS: "10000" }, //10000
}

let totalDuration = 0;
let totalDurationSec = 0;

for (let key in ldlPresentationSlides) {
    totalDuration += Number(ldlPresentationSlides[key].durationMS);
    totalDurationSec += Number(ldlPresentationSlides[key].durationMS) / 1000;
}

const locationLabel = document.getElementById('ldl-location-label')

let ldlLocationIndex = 0;
let ldlSlideIndex = 0;
let iconDir
let endingTemp, endingWind, endingDistance, endingMeasurement, endingCeiling, endingPressure, endingSnow, endingRain;

async function LDLData() {
    try {
  
      function processnextLDLLocation() {

       iconDir = "twc"
  
        if (locationsList.units == "e") {
          endingTemp = "°F"
          endingWind = "mph"
          endingDistance = "mi"
          endingMeasurement = "in"
          endingCeiling= "ft"
          endingPressure = "hg"
          endingSnow = "in"
          endingRain = "in"
        } else if(locationsList.units == "m") {
            endingTemp = "°C"
            endingWind = "km/h"
            endingDistance = "km"
            endingMeasurement = "mm"
            endingCeiling = "m"
            endingPressure = "mb"
            endingSnow = "cm"
            endingRain = "mm"
        if (ldlLocationIndex < locationsList.locationIndex.ldlLocations.length) {
          
          const locationName = locationsList.locationIndex.ldlLocations[ldlLocationIndex];
          const locationData = ldlData[locationName];

          locationLabel.innerHTML = `${locationName.substring(0,(locationName.length) - 4)}`
  
          if (locationData) {
            const latestKey = Object.keys(locationData)
              .map(Number)
              .sort((a, b) => b - a)[0];
  
            const latestData = locationData[latestKey];
  
          if (latestData && latestData.current) {

              function appendCurrent() {
                console.log(`Current LDL location: ${locationName}`)
    
                // Temp and Condition
                const currentTemp = document.getElementById('ldl-current-temp');
                const currentIcon = document.getElementById('ldl-current-icon');
                const currentCondition = document.getElementById('ldl-current-condition');
                // Wind
                const currentWind = document.getElementById('ldl-current-wind-value');
                const currentGusts = document.getElementById('ldl-current-gusts-value');
                // Extra Products
                const currentHumidity = document.getElementById('ldl-current-humidity-value');
                const currentDewpoint = document.getElementById('ldl-current-dewpoint-value');
                const currentPressure = document.getElementById('ldl-current-pressure-value');
                //const currentVisib = document.getElementById('ldl-current-visibility-value');
                //const currentCeiling = document.getElementById('ldl-current-ceiling-value');
                const currentFeelsLike = document.getElementById('ldl-current-feelslike-value');

        
                currentTemp.innerHTML = `${latestData.current.temperature}°`
                currentCondition.innerHTML = latestData.current.wxPhraseLong
                currentWind.innerHTML = `Wind ${latestData.current.windDirectionCardinal} ${latestData.current.windSpeed}${endingWind}`
                currentGusts.innerHTML = `Gusts ${latestData.current.windGust}${endingWind}`
                currentHumidity.innerHTML = `Humidity ${latestData.current.relativeHumidity}%`
                /* currentDewpoint.innerHTML = ` Dew Point ${latestData.current.temperatureDewPoint}${endingTemp}`
                currentPressure.innerHTML = `Pressure ${latestData.current.pressureAltimeter}${endingPressure}` */
                //currentVisib.innerHTML = `Visibility ${Math.round(latestData.current.visibility)}${endingDistance}`
                currentFeelsLike.innerHTML = `Feels Like ${latestData.current.temperatureFeelsLike}${endingTemp}`

                const iconCode = latestData.current.iconCode;
                const dayOrNight = latestData.current.dayOrNight;
                const iconPath = weatherIcons[iconCode] ? weatherIcons[iconCode][dayOrNight === "D" ? 0 : 1] : 'not-available.svg'
                currentIcon.src = `/graphics/${iconDir}/${iconPath}`
                
                /*let ceilingFormatted;
    
                if (latestData.current.cloudCeiling === null) {
                    ceilingFormatted = 'Ceiling Unlimited'
                } else {
                    ceilingFormatted = `Ceiling ${latestData.current.cloudCeiling}${endingCeiling}`
                }
    
                currentCeiling.innerHTML = ceilingFormatted*/
              }
    
              function appendForecast() {
                const forecast0Name = document.getElementById('ldl-forecast-day0-name');
                const forecast0Cond = document.getElementById('ldl-forecast-day0-condition');
                const forecast0Icon = document.getElementById('ldl-day0-icon');
                const forecast0Temp = document.getElementById('ldl-forecast-day0-temp');
                const forecast0Precip = document.getElementById('ldl-forecast-day0-pop-value');
                const forecast1Name = document.getElementById('ldl-forecast-day1-name');
                const forecast1Cond = document.getElementById('ldl-forecast-day1-condition');
                const forecast1Icon = document.getElementById('ldl-day1-icon');
                const forecast1Temp = document.getElementById('ldl-forecast-day1-temp');
                const forecast1Precip = document.getElementById('ldl-forecast-day1-pop-value');
    
                forecast0Name.innerHTML = latestData.forecast.daypart[0].daypartName[0] ?? latestData.forecast.daypart[0].daypartName[1]
                forecast0Cond.innerHTML = latestData.forecast.daypart[0].wxPhraseLong[0] ?? latestData.forecast.daypart[0].wxPhraseLong[1]
                forecast0Temp.innerHTML = `${latestData.forecast.daypart[0].temperature[0] ?? latestData.forecast.daypart[0].temperature[1]}°`
                forecast0Precip.innerHTML = `${latestData.forecast.daypart[0].precipChance[0] ?? latestData.forecast.daypart[0].precipChance[1]}%`
    
                const dayOneIconCode = latestData.forecast.daypart[0].iconCode[0] ?? latestData.forecast.daypart[0].iconCode[1];
                const dayOrNight = latestData.forecast.daypart[0].dayOrNight[0] ?? latestData.forecast.daypart[0]?.dayOrNight[1];
                const iconPath = weatherIcons[dayOneIconCode] ? weatherIcons[dayOneIconCode][dayOrNight === "D" ? 0 : 1] : 'not-available.svg'
                forecast0Icon.src = `/graphics/${iconDir}/${iconPath}`

                if (latestData.forecast.daypart[0].daypartName[0] === null) {
                    forecast1Name.innerHTML = latestData.forecast.daypart[0].daypartName[2]
                    forecast1Cond.innerHTML = latestData.forecast.daypart[0].wxPhraseLong[2]
                    forecast1Temp.innerHTML = `${latestData.forecast.daypart[0].temperature[2]}°`
                    forecast1Precip.innerHTML = `${latestData.forecast.daypart[0].precipChance[2]}%`    
    
                    const dayTwoIconCode = latestData.forecast.daypart[0].iconCode[2]
                    const dayOrNight = latestData.forecast.daypart[0].dayOrNight[2]
                    const iconPath = weatherIcons[dayTwoIconCode] ? weatherIcons[dayTwoIconCode][dayOrNight === "D" ? 0 : 1] : 'not-available.svg'
                    forecast1Icon.src = `/graphics/${iconDir}/${iconPath}`
                } else {
                    forecast1Name.innerHTML = latestData.forecast.daypart[0].daypartName[1]
                    forecast1Cond.innerHTML = latestData.forecast.daypart[0].wxPhraseLong[1]
                    forecast1Temp.innerHTML = `${latestData.forecast.daypart[0].temperature[1]}°`
                    forecast1Precip.innerHTML = `${latestData.forecast.daypart[0].precipChance[1]}%`    
    
                    const dayTwoIconCode = latestData.forecast.daypart[0].iconCode[1]
                    const dayOrNight = latestData.forecast.daypart[0].dayOrNight[1]
                    const iconPath = weatherIcons[dayTwoIconCode] ? weatherIcons[dayTwoIconCode][dayOrNight === "D" ? 0 : 1] : 'not-available.svg'
                    forecast1Icon.src = `/graphics/${iconDir}/${iconPath}`
                }
    
    
              }

              function appendHourly() {
                const hourly0Name = document.getElementById('ldl-hourly-day0-name');
                const hourly0Icon = document.getElementById('ldl-hourly-day0-icon');
                const hourly0Temp = document.getElementById('ldl-hourly-day0-temp');
                const hourly1Name = document.getElementById('ldl-hourly-day1-name');
                const hourly1Icon = document.getElementById('ldl-hourly-day1-icon');
                const hourly1Temp = document.getElementById('ldl-hourly-day1-temp');
                const hourly2Name = document.getElementById('ldl-hourly-day2-name');
                const hourly2Icon = document.getElementById('ldl-hourly-day2-icon');
                const hourly2Temp = document.getElementById('ldl-hourly-day2-temp');
                const hourly3Name = document.getElementById('ldl-hourly-day3-name');
                const hourly3Icon = document.getElementById('ldl-hourly-day3-icon');
                const hourly3Temp = document.getElementById('ldl-hourly-day3-temp');

                const hourly4Name = document.getElementById('ldl-hourly-day4-name');
                const hourly4Icon = document.getElementById('ldl-hourly-day4-icon');
                const hourly4Temp = document.getElementById('ldl-hourly-day4-temp');
                const hourly5Name = document.getElementById('ldl-hourly-day5-name');
                const hourly5Icon = document.getElementById('ldl-hourly-day5-icon');
                const hourly5Temp = document.getElementById('ldl-hourly-day5-temp');
                const hourly6Name = document.getElementById('ldl-hourly-day6-name');
                const hourly6Icon = document.getElementById('ldl-hourly-day6-icon');
                const hourly6Temp = document.getElementById('ldl-hourly-day6-temp');
                const hourly7Name = document.getElementById('ldl-hourly-day7-name');
                const hourly7Icon = document.getElementById('ldl-hourly-day7-icon');
                const hourly7Temp = document.getElementById('ldl-hourly-day7-temp');
                
                const hourly8Name = document.getElementById('ldl-hourly-day8-name');
                const hourly8Icon = document.getElementById('ldl-hourly-day8-icon');
                const hourly8Temp = document.getElementById('ldl-hourly-day8-temp');
                const hourly9Name = document.getElementById('ldl-hourly-day9-name');
                const hourly9Icon = document.getElementById('ldl-hourly-day9-icon');
                const hourly9Temp = document.getElementById('ldl-hourly-day9-temp');
                const hourlyAName = document.getElementById('ldl-hourly-dayA-name');
                const hourlyAIcon = document.getElementById('ldl-hourly-dayA-icon');
                const hourlyATemp = document.getElementById('ldl-hourly-dayA-temp');
                const hourlyBName = document.getElementById('ldl-hourly-dayB-name');
                const hourlyBIcon = document.getElementById('ldl-hourly-dayB-icon');
                const hourlyBTemp = document.getElementById('ldl-hourly-dayB-temp');
    
                const now = new Date();
                const days = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
                hourly0Name.innerHTML = days[(now.getHours() + 1) % 24];
                hourly1Name.innerHTML = days[(now.getHours() + 2) % 24];
                hourly2Name.innerHTML = days[(now.getHours() + 3) % 24];
                hourly3Name.innerHTML = days[(now.getHours() + 4) % 24];
                hourly4Name.innerHTML = days[(now.getHours() + 5) % 24];
                hourly5Name.innerHTML = days[(now.getHours() + 6) % 24];
                hourly6Name.innerHTML = days[(now.getHours() + 7) % 24];
                hourly7Name.innerHTML = days[(now.getHours() + 8) % 24];
                hourly8Name.innerHTML = days[(now.getHours() + 9) % 24];
                hourly9Name.innerHTML = days[(now.getHours() + 10) % 24];
                hourlyAName.innerHTML = days[(now.getHours() + 11) % 24];
                hourlyBName.innerHTML = days[(now.getHours() + 12) % 24];
    
                hourly0Temp.innerHTML = ` ${latestData.hourly.temperature[0]}° ​ <sb>${latestData.hourly.precipChance[0]}%</sb>`
                hourly1Temp.innerHTML = ` ${latestData.hourly.temperature[1]}° ​ <sb>${latestData.hourly.precipChance[1]}%</sb>`
                hourly2Temp.innerHTML = ` ${latestData.hourly.temperature[2]}° ​ <sb>${latestData.hourly.precipChance[2]}%</sb>`
                hourly3Temp.innerHTML = ` ${latestData.hourly.temperature[3]}° ​ <sb>${latestData.hourly.precipChance[3]}%</sb>`
                hourly4Temp.innerHTML = ` ${latestData.hourly.temperature[4]}° ​ <sb>${latestData.hourly.precipChance[4]}%</sb>`
                hourly5Temp.innerHTML = ` ${latestData.hourly.temperature[5]}° ​ <sb>${latestData.hourly.precipChance[5]}%</sb>`
                hourly6Temp.innerHTML = ` ${latestData.hourly.temperature[6]}° ​ <sb>${latestData.hourly.precipChance[6]}%</sb>`
                hourly7Temp.innerHTML = ` ${latestData.hourly.temperature[7]}° ​ <sb>${latestData.hourly.precipChance[7]}%</sb>`
                hourly8Temp.innerHTML = ` ${latestData.hourly.temperature[8]}° ​ <sb>${latestData.hourly.precipChance[8]}%</sb>`
                hourly9Temp.innerHTML = ` ${latestData.hourly.temperature[9]}° ​ <sb>${latestData.hourly.precipChance[9]}%</sb>`
                hourlyATemp.innerHTML = ` ${latestData.hourly.temperature[10]}° ​ <sb>${latestData.hourly.precipChance[10]}%</sb>`
                hourlyBTemp.innerHTML = ` ${latestData.hourly.temperature[11]}° ​ <sb>${latestData.hourly.precipChance[11]}%</sb>`

                function setHourIcon(day, daypartIndex) {
                    const iconCode = latestData.hourly.iconCode[daypartIndex];
                    const dayOrNight = latestData.hourly.dayOrNight[daypartIndex];
                    const iconPath = weatherIcons[iconCode] ? weatherIcons[iconCode][dayOrNight === "D" ? 0 : 1] : 'not-available.svg';
                    day.src = `/graphics/${iconDir}/${iconPath}`;
                }
                setHourIcon(hourly0Icon, 0);
                setHourIcon(hourly1Icon, 1);
                setHourIcon(hourly2Icon, 2);
                setHourIcon(hourly3Icon, 3);
                setHourIcon(hourly4Icon, 4);
                setHourIcon(hourly5Icon, 5);
                setHourIcon(hourly6Icon, 6);
                setHourIcon(hourly7Icon, 7);
                setHourIcon(hourly8Icon, 8);
                setHourIcon(hourly9Icon, 9);
                setHourIcon(hourlyAIcon, 10);
                setHourIcon(hourlyBIcon, 11);
              }
              
              const forecastData = latestData.weekly;

              function appendExtended() {
                const extended0Name = document.getElementById('ldl-extended-day0-name');
                const extended0Icon = document.getElementById('ldl-extended-day0-icon');
                const extended0Temp = document.getElementById('ldl-extended-day0-temp');
                const extended1Name = document.getElementById('ldl-extended-day1-name');
                const extended1Icon = document.getElementById('ldl-extended-day1-icon');
                const extended1Temp = document.getElementById('ldl-extended-day1-temp');
                const extended2Name = document.getElementById('ldl-extended-day2-name');
                const extended2Icon = document.getElementById('ldl-extended-day2-icon');
                const extended2Temp = document.getElementById('ldl-extended-day2-temp');
                const extended3Name = document.getElementById('ldl-extended-day3-name');
                const extended3Icon = document.getElementById('ldl-extended-day3-icon');
                const extended3Temp = document.getElementById('ldl-extended-day3-temp');

                const now = new Date();
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                extended0Name.innerHTML = days[(now.getDay() + 1) % 7];
                extended1Name.innerHTML = days[(now.getDay() + 2) % 7];
                extended2Name.innerHTML = days[(now.getDay() + 3) % 7];
                extended3Name.innerHTML = days[(now.getDay() + 4) % 7];
    
                extended0Temp.innerHTML = ` ${latestData.forecast.daypart[0].temperature[2]}° / <sb>${latestData.forecast.daypart[0].temperature[3]}°</sb>`
                extended1Temp.innerHTML = ` ${latestData.forecast.daypart[0].temperature[4]}° / <sb>${latestData.forecast.daypart[0].temperature[5]}°</sb>`
                extended2Temp.innerHTML = ` ${latestData.forecast.daypart[0].temperature[6]}° / <sb>${latestData.forecast.daypart[0].temperature[7]}°</sb>`
                extended3Temp.innerHTML = ` ${latestData.forecast.daypart[0].temperature[8]}° / <sb>${latestData.forecast.daypart[0].temperature[9]}°</sb>`
    
                const dayOneIconCode = latestData.forecast.daypart[0].iconCode[0] ?? latestData.forecast.daypart[0].iconCode[1];
                const dayOrNight = latestData.forecast.daypart[0].dayOrNight[0] ?? latestData.forecast.daypart[0]?.dayOrNight[1];
                const iconPath = weatherIcons[dayOneIconCode] ? weatherIcons[dayOneIconCode][dayOrNight === "D" ? 0 : 1] : 'not-available.svg'
                extended0Icon.src = `/graphics/${iconDir}/${iconPath}`

                function setDayIcon(day, daypartIndex) {
                    const iconCode = latestData.forecast.daypart[0].iconCode[daypartIndex];
                    const dayOrNight = latestData.forecast.daypart[0].dayOrNight[daypartIndex];
                    const iconPath = weatherIcons[iconCode] ? weatherIcons[iconCode][dayOrNight === "D" ? 0 : 1] : 'not-available.svg';
                    day.src = `/graphics/${iconDir}/${iconPath}`;
                }
                setDayIcon(extended0Icon, 2);
                setDayIcon(extended1Icon, 4);
                setDayIcon(extended2Icon, 6);
                setDayIcon(extended3Icon, 8);
              }
    
              function appendAirQuality() {
                const aqiStatus = document.getElementById('ldl-aqi-status');
                const aqiIndex = document.getElementById('ldl-aqi-index');
                const aqiPrimaryPollutant = document.getElementById('ldl-aqi-primarypollutant');
    
                aqiStatus.style.color = `#${latestData.aqi.globalairquality.airQualityCategoryIndexColor}`
                aqiStatus.innerHTML = latestData.aqi.globalairquality.airQualityCategory
                aqiIndex.innerHTML = latestData.aqi.globalairquality.airQualityCategoryIndex
                aqiPrimaryPollutant.innerHTML = latestData.aqi.globalairquality.primaryPollutant
              }
        
            appendCurrent()
            appendForecast()
            appendHourly()
            appendExtended()
            appendAirQuality()
            
            } else {
              console.warn(`No valid current data found for ${locationName}`);
              ldlLocationIndex++;
              processnextLDLLocation();
            }
          } else {
            console.warn(`No data found for ${locationName}`);
            ldlLocationIndex++;
            processnextLDLLocation();
          }
        } else {
          setTimeout(() => {
            ldlLocationIndex = 0;
            processnextLDLLocation();
          }, 1);
        }
      }
  
      setTimeout(processnextLDLLocation, 500)
      
    } catch (error) {
      console.error('erm what the', error);
    }
  }
  
function showLocationLabel() {
    locationLabel.style.display = 'block';
    locationLabel.style.animation = 'slideIn .5s cubic-bezier(0.37, 0, 0.63, 1)';
}

function hideLocationLabel() {
    locationLabel.style.animation = 'slideOut .5s cubic-bezier(0.37, 0, 0.63, 1)';

    setTimeout(() => {
        locationLabel.style.display = 'none';
        document.getElementsByClassName('loading-screen')
    }, 300);
}

function runCurrentSlide() {
    const module1 = document.getElementById('ldl-current-module1');
    const module2 = document.getElementById('ldl-current-module2');

    module1.style.display = 'flex';
    module2.style.display = 'none';

    const currentSlide = ldlPresentationSlides[0];
    const halfDuration = currentSlide.durationMS / 2;

    setTimeout(() => {
        module1.style.animation = 'slideOutUp 0.5s cubic-bezier(0.37, 0, 0.63, 1)';

        setTimeout(() => {
            module1.style.display = 'none';
            module1.style.animation = '';
            module2.style.display = 'flex';
            module2.style.animation = 'slideInUp .5s cubic-bezier(0.37, 0, 0.63, 1)';
        }, 200);

    }, halfDuration - 300);
}

function runHourlySlide() {
  const day0 = document.getElementById('ldl-hourly-0-container');
  const day1 = document.getElementById('ldl-hourly-1-container');
  const day2 = document.getElementById('ldl-hourly-2-container');

  day0.style.display = 'flex';
  day1.style.display = 'none';
  day2.style.display = 'none';

  const forecastSlide = ldlPresentationSlides[1];
  const halfDuration = forecastSlide.durationMS / 3;

  setTimeout(() => {
      day0.style.display = 'none';
      day1.style.display = 'flex';
      day2.style.display = 'none';
  }, halfDuration);

  setTimeout(() => {
      day0.style.animation = 'slideOutUp 0.5s cubic-bezier(0.37, 0, 0.63, 1)';

      setTimeout(() => {
          day0.style.display = 'none';
          day0.style.animation = '';
          day1.style.display = 'flex';
          day1.style.animation = 'slideInUp .5s cubic-bezier(0.37, 0, 0.63, 1)';
      }, 200);

      setTimeout(() => {
        day0.style.display = 'none';
        day1.style.display = 'none';
        day2.style.display = 'flex';
      }, halfDuration);
    
      setTimeout(() => {
        day1.style.animation = 'slideOutUp 0.5s cubic-bezier(0.37, 0, 0.63, 1)';
    
        setTimeout(() => {
            day1.style.display = 'none';
            day1.style.animation = '';
            day2.style.display = 'flex';
            day2.style.animation = 'slideInUp .5s cubic-bezier(0.37, 0, 0.63, 1)';
        }, 200);
    
      }, halfDuration - 300);

  }, halfDuration - 300);
}

function runForecastSlide() {
    const day0 = document.getElementById('ldl-forecast-day0-container');
    const day1 = document.getElementById('ldl-forecast-day1-container');

    day0.style.display = 'flex';
    day1.style.display = 'none';

    const forecastSlide = ldlPresentationSlides[2];
    const halfDuration = forecastSlide.durationMS / 2;

    setTimeout(() => {
        day0.style.display = 'none';
        day1.style.display = 'flex';
    }, halfDuration);

    setTimeout(() => {
        day0.style.animation = 'slideOutUp 0.5s cubic-bezier(0.37, 0, 0.63, 1)';

        setTimeout(() => {
            day0.style.display = 'none';
            day0.style.animation = '';
            day1.style.display = 'flex';
            day1.style.animation = 'slideInUp .5s cubic-bezier(0.37, 0, 0.63, 1)';
        }, 200);

    }, halfDuration - 300);
}

function runExtendedSlide() {
  document.getElementById('ldl-extended').style.display = 'flex';
}

function triggerExitAnimation(slideID) {
    const slideElement = document.getElementById(slideID);

    slideElement.style.animation = 'slideOut .3s cubic-bezier(0.37, 0, 0.63, 1)';

    setTimeout(() => {
        slideElement.style.display = 'none';

    }, 200);

}

function showLDLSlide() {
    
    const slide = ldlPresentationSlides[ldlSlideIndex]
    const duration = slide.durationMS;
    
    console.log(`Showing LDL slides: ${slide.htmlID} for a duration of ${duration}`)

    const slideElement = document.getElementById(slide.htmlID)
    slideElement.style.display = 'block';
    slideElement.style.animation = 'slideIn .3s cubic-bezier(0.37, 0, 0.63, 1)';

    if (slide.htmlID === 'ldl-current') {
        runCurrentSlide();
    }

    if (slide.htmlID === 'ldl-hourly') {
      runHourlySlide();
  }

    if (slide.htmlID === 'ldl-forecast') {
        runForecastSlide();
    }

    if (slide.htmlID === 'ldl-extended') {
      runExtendedSlide();
    }

    if (ldlSlideIndex === Object.keys(ldlPresentationSlides).length - 1) {
        setTimeout(() => hideLocationLabel(), duration - 1000);
    }

    setTimeout(() => triggerExitAnimation(slide.htmlID), duration - 1000);

    setTimeout(() => {
        nextLDLSlide();
    }, duration)
}

function nextLDLSlide() {
    ldlSlideIndex = (ldlSlideIndex + 1) % Object.keys(ldlPresentationSlides).length;
    
    if (ldlSlideIndex === 0) {
        nextLDLLocation();
    } else {
        showLDLSlide();

    }
}

function nextLDLLocation() {
    ldlLocationIndex = (ldlLocationIndex + 1) % locationsList.locationIndex.locations.length;

    showLocationLabel();

    runProgressBar()

    ldlSlideIndex = 0;

    LDLData();

    showLDLSlide();
}

function runProgressBar() {
  const progressBar = document.getElementById('ldl-location-progressbar')

  progressBar.style.animation = `ldlProgressBar ${totalDurationSec}s linear`
  progressBar.offsetHeight
  progressBar.style.display = `block`

  setTimeout(() => {
    progressBar.style.display = `none`
    progressBar.style.animation = ``
  }, totalDuration);
}

export function runInitialLDL() {
  runProgressBar()
  LDLData()
  showLDLSlide()
  
  console.log("Total Duration (ms):", totalDuration);
  console.log("Total Duration (sec):", totalDurationSec);
}