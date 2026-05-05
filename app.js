const API_KEY = "ca5e7e7c1461c0ce8c0662e227daf8cf";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherDisplay = document.getElementById("weather-display");
const searchHistoryElement = document.getElementById("search-history");

const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");

function showLoading() {
    loading.classList.remove("hidden");
    weatherDisplay.classList.add("hidden");
    hideError();
}

function hideLoading() {
    loading.classList.add("hidden");
}

function showError(message) {
    error.textContent = message;
    error.classList.remove("hidden");
    weatherDisplay.classList.add("hidden");
}

function hideError() {
    error.classList.add("hidden");
    error.textContent = "";
}

function getWeatherUrl(city) {
    const encodedCity = encodeURIComponent(city);
    return `${BASE_URL}?q=${encodedCity}&appid=${API_KEY}&units=metric`;
}

async function getWeather(city) {
    if (!API_KEY || API_KEY === "your_api_key_here") {
        showError("Please add your OpenWeatherMap API key in app.js.");
        return;
    }

    const url = getWeatherUrl(city);

    try {
        showLoading();
        hideError();

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Please check the city name.");
            }

            if (response.status === 401) {
                throw new Error("Invalid API key. Please check your OpenWeatherMap API key.");
            }

            throw new Error("Failed to fetch weather data.");
        }

        const data = await response.json();
        displayWeather(data);
        saveToHistory(data.name);
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

function displayWeather(data) {
    const iconCode = data.weather[0]?.icon || "01d";
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = data.weather[0]?.description || "Weather icon";
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0]?.description || "Clear sky";
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${Math.round(data.wind.speed)} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    weatherDisplay.classList.remove("hidden");
}

function loadHistory() {
    const saved = localStorage.getItem("weatherSearchHistory");
    const history = saved ? JSON.parse(saved) : [];
    renderHistory(history);
}

function saveToHistory(city) {
    const saved = localStorage.getItem("weatherSearchHistory");
    const history = saved ? JSON.parse(saved) : [];

    const normalizedCity = city.trim();
    const existingIndex = history.findIndex(item => item.toLowerCase() === normalizedCity.toLowerCase());
    if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
    }

    history.unshift(normalizedCity);
    const limitedHistory = history.slice(0, 5);

    localStorage.setItem("weatherSearchHistory", JSON.stringify(limitedHistory));
    renderHistory(limitedHistory);
}

function renderHistory(history) {
    searchHistoryElement.innerHTML = "";

    if (history.length === 0) {
        searchHistoryElement.innerHTML = "<li>No recent searches yet.</li>";
        return;
    }

    history.forEach(city => {
        const listItem = document.createElement("li");
        listItem.textContent = city;
        listItem.addEventListener("click", () => {
            cityInput.value = city;
            getWeather(city);
        });
        searchHistoryElement.appendChild(listItem);
    });
}

form.addEventListener("submit", event => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (!city) {
        showError("Please enter a city name.");
        return;
    }
    getWeather(city);
});

window.addEventListener("load", () => {
    loadHistory();
});
