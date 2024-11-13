const weatherInput = document.getElementById("weather-input");
const mood = document.getElementById("mood");
const gender = document.getElementById("gender")
const API_KEY = "12c5fef179da4b398ab192835241311"


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
     let forecastday = weather.forecast.forecastday;

    console.log(forecastday)
    // Gets date, icon, condition, avg temp
    let refinedData = forecastday.map(({day, date}) => ({avgtemp_c: day.avgtemp_c, date, icon: day.condition.icon, condition: day.condition.text }));
    console.log(refinedData)
}

// let weatherInfo = [{
//     date: '',
//     icon: '',
//     conition: '',
//     avgTemp: ''
// }, {
//     date: '',
//     icon: '',
//     conition: '',
//     avgTemp: ''
// }, {
//     date: '',
//     icon: '',
//     conition: '',
//     avgTemp: ''
// }]

