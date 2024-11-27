
 import { mensTops, womensTops } from './clothing-data/tops.js';
 import { mensBottoms, womensBottoms } from './clothing-data/bottoms.js';
 import { accessories, outerwear } from './clothing-data/others.js';
const weatherInput = document.getElementById("weather-input");
const weatherDisplay = document.getElementById("weather-display")
const mood = document.getElementById("mood");
const gender = document.getElementById("gender")
const API_KEY = "12c5fef179da4b398ab192835241311"
const SearchButton = document.getElementById("search-button")

SearchButton.addEventListener("click", () => {
    console.log('CLICKED!')
    onSearch()
})


 async function onSearch() {
    console.log(weatherInput.value)
    console.log(mood.value)
    console.log(gender.value)
   const weather = await getWeather()
   getRefinedWeatherData(weather)
}

async function getWeather() {
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${weatherInput.value}&days=3&aqi=no&alerts=no`;

    try {
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Error: Unable to fetch data for ${weatherInput.value} (status code: ${response.status})`)
        }
        const data = await response.json();
        return data;


    } catch (error) {
        console.error(error.message);
        return null;
    }
}

function getRefinedWeatherData(weather) {
    const forecastdays = weather.forecast.forecastday;

    console.log(forecastdays);
    // Refine data for display
    const refinedData = forecastdays.map(({ day, date }) => ({
        avgtemp_c: day.avgtemp_c,
        maxtemp_c: day.maxtemp_c,
        mintemp_c: day.mintemp_c,
        date,
        icon: day.condition.icon,
        condition: day.condition.text,
    }));

    console.log(refinedData);
    displayWeather(refinedData);

    // Prepare form data and call getOutfitSuggestion
    const formData = {
        mood: mood.value,
        gender: gender.value,
    };

    const outfitSuggestion = getOutfitSuggestion(weather, formData);
    displayOutfitSuggestion(outfitSuggestion, refinedData)
    console.log(outfitSuggestion)
}


function displayWeather(refinedData) {

    weatherDisplay.innerHTML = ""; // Clear previous content

    refinedData.forEach(({ date, avgtemp_c, icon, condition, mintemp_c, maxtemp_c}) => {
        const weatherCard = document.createElement("div");
        weatherCard.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">
                <h3>${date}</h3>
                <img src="https:${icon}" alt="${condition}" style="width: 50px; height: 50px;" />
                <p>Condition: ${condition}</p>
                <p>High Temperature: ${Math.round(maxtemp_c)}°C</p>
                <p>Low Temperature: ${Math.round(mintemp_c)}°C</p>
                
            </div>
        `;
        weatherDisplay.appendChild(weatherCard);
    });
}

function getOutfitSuggestion(weatherData, formData) {
    const { mood, gender } = formData;
    console.log(mood, gender)
    const tempCategory = getTemperatureCategory(weatherData.forecast.forecastday);
    const conditionCategory = getConditionCategory(weatherData.forecast.forecastday);
    let suggestedTops =[]
    let suggestedBottoms = []
    let suggestedAccessories = []
    let suggestedOuterwear = []
    console.log(tempCategory)

    //for loop
    for (let i = 0; i < tempCategory.length; i++) {
        if (gender === "male"){

            suggestedTops.push(getClothingSuggestions(mensTops, mood, conditionCategory[i], tempCategory[i]))
            suggestedBottoms.push(getClothingSuggestions(mensBottoms, mood, conditionCategory[i], tempCategory[i]))
        }
        else {
            suggestedTops.push(getClothingSuggestions(womensTops, mood, conditionCategory[i], tempCategory[i]))
            suggestedBottoms.push(getClothingSuggestions(womensBottoms, mood, conditionCategory[i], tempCategory[i]))
        }
        suggestedAccessories.push(getClothingSuggestions(accessories, mood, conditionCategory[i], tempCategory[i]))
        if (tempCategory[i] != "hot") {
            suggestedOuterwear.push(getClothingSuggestions(outerwear, mood, conditionCategory[i], tempCategory[i]))
        }
        else {
            suggestedOuterwear.push(null)
        }
    }
    // console.log(suggestedTops)
    // console.log(suggestedBottoms)
    // console.log(suggestedAccessories)
    // console.log(suggestedOuterwear)

    return {
        tops: suggestedTops, 
        bottoms: suggestedBottoms,
        accessories: suggestedAccessories,
        outerwear: suggestedOuterwear
    }
}

function getConditionCategory(conditions) {
    const conditionArray = conditions.map(weatherInfo => {
        const condition = weatherInfo.day.condition.text;

        return condition;
    })

    return conditionArray;
}

function getTemperatureCategory(temperatures) {
    
    const tempArray = temperatures.map(weatherInfo => {
        const avgTemp = weatherInfo.day.avgtemp_c;
        console.log(avgTemp)
        // return 'warm' or 'mild', etc
        if (avgTemp > 20) {
            return "hot";
        } else if (avgTemp > 10 && avgTemp <= 20) {
            return "mild";
        } else if (avgTemp > 0 && avgTemp <= 10) {
            return "cool";
        } else {
            return "cold";
        }
    })
    return tempArray;
    
    
}

function getClothingSuggestions(clothing, mood, condition, temperature) {
    let bestMatchArray = []
    
    clothing.forEach(item => {
        let score = 0;
        console.log(mood)
        // Check matches and increment score for each match
        if (item.moods.includes(mood.toLowerCase())) score++;
        if (item.temperatures.includes(temperature.toLowerCase())) score++;
        if (item.conditions.flat().includes(condition.toLowerCase())) score++;
        if (score > 0) {

        
        bestMatchArray.push({
            name: item.name,
            score
,        })
        }
    });
    
    
    return bestMatchArray.sort((a, b) => b.score - a.score);
};

function displayOutfitSuggestion(outfitSuggestion, refinedData) {
    const outfitDisplay = document.getElementById("outfit-display"); // Add an element with this ID in your HTML
    outfitDisplay.innerHTML = ""; // Clear previous suggestions

    // Loop through the outfit suggestions for each day
    outfitSuggestion.tops.forEach((_, index) => {
        const outfitCard = document.createElement("div");
        outfitCard.style.border = "1px solid #ccc";
        outfitCard.style.padding = "10px";
        outfitCard.style.margin = "10px";

        // Get the date for the current day from refinedData
        const date = refinedData[index].date;

        outfitCard.innerHTML = `
            <h3>${date}</h3>
            <p><strong>Top:</strong> ${outfitSuggestion.tops[index]?.[0]?.name || "No suggestion"}</p>
            <p><strong>Bottom:</strong> ${outfitSuggestion.bottoms[index]?.[0]?.name || "No suggestion"}</p>
            <p><strong>Accessory:</strong> ${outfitSuggestion.accessories[index]?.[0]?.name || "No suggestion"}</p>
            <p><strong>Outerwear:</strong> ${outfitSuggestion.outerwear[index]?.[0]?.name || "No suggestion"}</p>
        `;
        outfitDisplay.appendChild(outfitCard);
    });
}

