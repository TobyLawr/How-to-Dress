import { mensTops, womensTops } from "./clothing-data/tops.js";
import { mensBottoms, womensBottoms } from "./clothing-data/bottoms.js";
import {
  accessories,
  mensOuterwear,
  womensOuterwear,
} from "./clothing-data/others.js";

const weatherInput = document.getElementById("weather-input");
const weatherDisplay = document.getElementById("weather-display");
const outfitDisplay = document.getElementById("outfit-display");

const mood = document.getElementById("mood");
const gender = document.getElementById("gender");
const API_KEY = "12c5fef179da4b398ab192835241311";
const SearchButton = document.getElementById("search-button");

SearchButton.addEventListener("click", async () => {
  outfitDisplay.classList.remove("hidden");
  await onSearch();
});

async function onSearch() {
  const weather = await getWeather();
  getRefinedWeatherData(weather);
}

async function getWeather() {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${weatherInput.value}&days=3&aqi=no&alerts=no`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Error: Unable to fetch data for ${weatherInput.value} (status code: ${response.status})`
      );
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

  // Refine data for display
  const refinedData = forecastdays.map(({ day, date }) => ({
    avgtemp_c: day.avgtemp_c,
    maxtemp_c: day.maxtemp_c,
    mintemp_c: day.mintemp_c,
    date,
    icon: day.condition.icon,
    condition: day.condition.text,
  }));

  updateTabLabels(refinedData);

  displayWeather(refinedData);

  // Prepare form data and call getOutfitSuggestion
  const formData = {
    mood: mood.value,
    gender: gender.value,
  };

  const outfitSuggestion = getOutfitSuggestion(weather, formData);
  displayOutfitSuggestion(outfitSuggestion, refinedData);
}

function displayWeather(refinedData) {
  weatherDisplay.innerHTML = ""; // Clear previous content

  refinedData.forEach(
    ({ date, avgtemp_c, icon, condition, mintemp_c, maxtemp_c }) => {
      const weatherCard = document.createElement("div");
      weatherCard.innerHTML = `
            <div class="weather-card">
                <h3>${date}</h3>
                <img src="https:${icon}" alt="${condition}" style="width: 50px; height: 50px;" />
                <p>${condition}</p>
                <p>${Math.round(maxtemp_c)}°C / ${Math.round(mintemp_c)}°C</p>
            </div>
        `;
      weatherDisplay.appendChild(weatherCard);
    }
  );
}

function getOutfitSuggestion(weatherData, formData) {
  const { mood, gender } = formData;
  const tempCategory = getTemperatureCategory(weatherData.forecast.forecastday);
  const conditionCategory = getConditionCategory(
    weatherData.forecast.forecastday
  );
  let suggestedTops = [];
  let suggestedBottoms = [];
  let suggestedAccessories = [];
  let suggestedOuterwear = [];

  //for loop
  for (let i = 0; i < tempCategory.length; i++) {
    if (gender === "male") {
      suggestedTops.push(
        getClothingSuggestions(
          mensTops,
          mood,
          conditionCategory[i],
          tempCategory[i]
        )
      );
      suggestedBottoms.push(
        getClothingSuggestions(
          mensBottoms,
          mood,
          conditionCategory[i],
          tempCategory[i]
        )
      );
      if (tempCategory[i] != "hot") {
        suggestedOuterwear.push(
          getClothingSuggestions(
            mensOuterwear,
            mood,
            conditionCategory[i],
            tempCategory[i]
          )
        );
      }
    } else {
      suggestedTops.push(
        getClothingSuggestions(
          womensTops,
          mood,
          conditionCategory[i],
          tempCategory[i]
        )
      );
      suggestedBottoms.push(
        getClothingSuggestions(
          womensBottoms,
          mood,
          conditionCategory[i],
          tempCategory[i]
        )
      );
      if (tempCategory[i] != "hot") {
        suggestedOuterwear.push(
          getClothingSuggestions(
            womensOuterwear,
            mood,
            conditionCategory[i],
            tempCategory[i]
          )
        );
      }
    }

    suggestedAccessories.push(
      getClothingSuggestions(
        accessories,
        mood,
        conditionCategory[i],
        tempCategory[i]
      )
    );
  }

  return {
    tops: suggestedTops,
    bottoms: suggestedBottoms,
    accessories: suggestedAccessories,
    outerwear: suggestedOuterwear,
  };
}

function getConditionCategory(conditions) {
  const conditionArray = conditions.map((weatherInfo) => {
    const condition = weatherInfo.day.condition.text;

    return condition;
  });

  return conditionArray;
}

function getTemperatureCategory(temperatures) {
  const tempArray = temperatures.map((weatherInfo) => {
    const avgTemp = weatherInfo.day.avgtemp_c;

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
  });
  return tempArray;
}

function getClothingSuggestions(clothing, mood, condition, temperature) {
  let bestMatchArray = [];

  clothing.forEach((item) => {
    let score = 0;
    // Check matches and increment score for each match
    if (item.moods.includes(mood.toLowerCase())) score++;
    if (item.temperatures.includes(temperature.toLowerCase())) score++;
    if (item.conditions.flat().includes(condition.toLowerCase())) score++;
    if (score > 0) {
      bestMatchArray.push({
        name: item.name,
        imageSrc: item.imageSrc,
        linkSrc: item.linkSrc,
        score,
      });
    }
  });

  return bestMatchArray.sort((a, b) => b.score - a.score);
}

function getAmazonLink(suggestion) {
  const genderValue = gender.value ?? "";
  if (!suggestion) {
    return "No suggestion";
  } else {
    return (
      '<a target="_blank" class="card-link" href="https://www.amazon.ca/s?k=' +
      [genderValue, ...suggestion.split(" ")].join("+") +
      '">See other suggestions</a>'
    );
  }
}

function displayOutfitSuggestion(outfitSuggestion, refinedData) {
  outfitDisplay.classList.remove("hidden");
  const outfitPanes = [
    document.getElementById("today-tab-pane"),
    document.getElementById("tomorrow-tab-pane"),
    document.getElementById("next-day-tab-pane"),
  ];

  // Loop through the outfit suggestions for each day
  outfitSuggestion.tops.forEach((_, index) => {
    outfitPanes[index].innerHTML = "";
    const clothes = [
      outfitSuggestion.tops[index]?.[0],
      outfitSuggestion.bottoms[index]?.[0],
      outfitSuggestion.accessories[index]?.[0],
      outfitSuggestion.outerwear[index]?.[0],
    ];

    const titles = ["Top", "Bottom", "Accessory", "Outerwear"];

    clothes.forEach((item, i) => {
      if (!item) {
        return;
      }

      const outfitCard = document.createElement("div");
      outfitCard.classList.add("card-wrapper");

      outfitCard.innerHTML = `
        ${getClothingCard(
          item.imageSrc,
          titles[i],
          item.name,
          item.linkSrc,
          getAmazonLink(item.name)
        )}
      `;
      outfitPanes[index].appendChild(outfitCard);
    });
  });
}

function getClothingCard(
  imageSrc,
  title,
  text,
  topSuggestionLink,
  additionalSuggestionsLink
) {
  return `
    <div class="card" style="width: 18rem;">
        <img src="${imageSrc}" class="card-img-top object-fit-scale" style="height:18rem;" alt="...">
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${text}</p>
        </div>
        <div class="card-body">
            <a href="${topSuggestionLink}" class="card-link">Buy Now!</a>
            ${additionalSuggestionsLink}
        </div>
    </div>
`;
}

function updateTabLabels(forecastData) {
  const todayTabDate = document.querySelector("#today-tab .date");
  const tomorrowTabDate = document.querySelector("#tomorrow-tab .date");
  const nextDayTabLabel = document.querySelector("#next-day-tab .label");
  const nextDayTabDate = document.querySelector("#next-day-tab .date");

  // Format dates considering timezone
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // Create the date explicitly in local time
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatWeekday = (dateString) => {
    const dateParts = dateString.split("-");
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); // Month is 0-indexed

    // const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Adjust tab labels

  todayTabDate.textContent = `(${formatDate(forecastData[0].date)})`;
  tomorrowTabDate.textContent = `(${formatDate(forecastData[1].date)})`;
  nextDayTabLabel.textContent = `${formatWeekday(forecastData[2].date)}`;
  nextDayTabDate.textContent = `(${formatDate(forecastData[2].date)})`;

  const dateSpans = document.querySelectorAll(".date");

  // Function to handle parentheses based on screen size
  const handleScreenSize = (e) => {
    dateSpans.forEach((span) => {
      if (e.matches) {
        // Screen width is below 768px - remove parentheses
        span.textContent = span.textContent.replace(/^\(|\)$/g, "");
      } else {
        // Screen width is above 768px - add parentheses
        if (!span.textContent.startsWith("(")) {
          span.textContent = `(${span.textContent})`;
        }
      }
    });
  };

  // Create a media query
  const mediaQuery = window.matchMedia("(max-width: 768px)");

  // Initial check
  handleScreenSize(mediaQuery);

  // Add listener for screen size changes
  mediaQuery.addListener(handleScreenSize);
}
