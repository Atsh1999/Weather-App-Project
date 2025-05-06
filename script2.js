const API_KEY = "b48d5cbfbed446e3f8c203b10470abb1"; // API key for OpenWeatherMap API
const cityInput = document.querySelector("#cityInput");
const searchButton = document.querySelector("button[onclick='searchWeather()']");
const locationButton = document.querySelector("button[onclick='getCurrentLocationWeather()']");
const currentWeatherDiv = document.querySelector("#currentWeather");
const weatherCardsDiv = document.querySelector("#forecast");
const recentCitiesDropdown = document.querySelector("#recentCitiesDropdown");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    return `<div class="details">
              <h2>${cityName}</h2>
              <h3>Date: ${weatherItem.dt_txt.split(" ")[0]}</h3>
              <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
              <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
              <h6>Humidity: ${weatherItem.main.humidity}%</h6>
            </div>
            <div class="icon">
              <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
              <h6>${weatherItem.weather[0].description}</h6>
            </div>`;  
  } 
  
  else { // Forecast card for each day
    return `<li class="card">
              <h1>${cityName }</h1>
              <h2>(${weatherItem.dt_txt.split(" ")[0]})</h2>
              <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
              <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
              <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
              <h6>Humidity: ${weatherItem.main.humidity}%</h6>
            </li>`;
  }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then(response => response.json())
    .then(data => {
      // Filter the forecasts to get only one forecast per day
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // Clear previous weather data
      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      // Create weather cards and add them to the DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.innerHTML = html;
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });

      // Update recent cities dropdown
      updateRecentCities(cityName);
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const updateRecentCities = (cityName) => {
  if (!recentCities.includes(cityName)) {
    recentCities.push(cityName);
    localStorage.setItem("recentCities", JSON.stringify(recentCities));
    populateRecentCitiesDropdown();
  }
};

const populateRecentCitiesDropdown = () => {
  recentCitiesDropdown.innerHTML = "<option value=''>Recently Searched</option>";
  recentCities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
  recentCitiesDropdown.classList.remove("hidden");
};

const searchWeather = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getCurrentLocationWeather = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL)
        .then(response => response.json())
        .then(data => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name!");
        });
    },
    error => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permission to grant access again.");
      } else {
        alert("Geolocation request error. Please reset location permission.");
      }
    }
  );
};

const selectRecentCity = (e) => {
  const cityName = e.value;
  if (cityName) {
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
      })
      .catch(() => {
        alert("An error occurred while fetching the coordinates!");
      });
  }
};

// For weather effect
function applyWeatherEffect(condition) {
  const effectDiv = document.querySelector(".weather-effect");
  effectDiv.className = "weather-effect"; // Reset

  if (condition.includes("rain")) {
    effectDiv.classList.add("rain");
  } else if (condition.includes("snow")) {
    effectDiv.classList.add("snow");
  } else if (condition.includes("thunderstorm")) {
    effectDiv.classList.add("thunderstorm");
  } else {
    effectDiv.className = "weather-effect"; // Clear all effects
  }
}


// Initialize dropdown
populateRecentCitiesDropdown();
