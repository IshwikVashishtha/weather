
document.getElementById('search-button').addEventListener('click', fetchWeatherData);

const apiKey = '0ccbad4050faea16718e639373ac13ac';
const apiUrl = 'https://api.openweathermap.org/data/2.5/';

async function fetchWeatherData() {
    const query = document.getElementById('search-input').value;
    const currentWeatherUrl = `${apiUrl}weather?q=${query}&units=metric&appid=${apiKey}`;
    const forecastUrl = `${apiUrl}forecast?q=${query}&units=metric&appid=${apiKey}`;
    
    try {
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error('City not found');
        }

        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();

        updateCurrentWeather(currentWeatherData);
        updateHourlyForecast(forecastData);
        updateWeeklyForecast(forecastData);

    } catch (error) {
        alert(error.message);
    }
}
function updateCurrentWeather(data) {
    document.getElementById('location-name').innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById('current-temp').innerText = `${Math.round(data.main.temp)}°C`;
    document.getElementById('current-icon').innerText = getWeatherIcon(data.weather[0].main);
    document.getElementById('current-description').innerText = data.weather[0].description;
    document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').innerText = `Wind Speed: ${data.wind.speed} km/h`;
    document.getElementById('chance-rain').innerText = `Chance of Rain: ${data.clouds.all}%`;
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function updateDateTime() {
    document.getElementById('date-time').innerText = new Date().toLocaleString();
}


function updateHourlyForecast(data) {
    const hourlyForecastElement = document.getElementById('hourly-forecast');
    hourlyForecastElement.innerHTML = '';

    for (let i = 0; i < 12; i++) {
        const forecast = data.list[i];
        const hour = new Date(forecast.dt * 1000).getHours();
        const temp = Math.round(forecast.main.temp);
        const icon = getWeatherIcon(forecast.weather[0].main);
        
        const hourElement = document.createElement('div');
        hourElement.className = 'hour';
        hourElement.innerHTML = `${hour}:00<br>${temp}°C<br>${icon}`;
        hourlyForecastElement.appendChild(hourElement);
    }
}

function updateWeeklyForecast(data) {
    const weeklyForecastElement = document.getElementById('weekly-forecast');
    weeklyForecastElement.innerHTML = '';

    // Process daily data
    const dailyData = [];
    for (let i = 0; i < data.list.length; i++) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleString('default', { weekday: 'short' });

        if (!dailyData[day]) {
            dailyData[day] = {
                day,
                temp: Math.round(forecast.main.temp),
                icon: getWeatherIcon(forecast.weather[0].main)
            };
        } else {
            dailyData[day].temp = Math.max(dailyData[day].temp, Math.round(forecast.main.temp));
        }
    }

    for (const day in dailyData) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.innerHTML = `<span>${dailyData[day].day}</span><br>${dailyData[day].icon}<br>${dailyData[day].temp}°C`;
        weeklyForecastElement.appendChild(dayElement);
    }
}

function getWeatherIcon(condition) {
    switch (condition.toLowerCase()) {
        case 'clear':
            return '☀️';
        case 'clouds':
            return '☁️';
        case 'rain':
            return '🌧️';
        case 'snow':
            return '❄️';
        case 'thunderstorm':
            return '⛈️';
        default:
            return '🌥️';
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const themeSwitchCheckbox = document.querySelector('.theme-switch__checkbox');
    const body = document.body;
    const navItems = document.querySelectorAll('.nav-item');

    // Function to apply light theme styles
    function applyLightTheme() {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
        body.style.backdropFilter = 'blur(7px)';
        navItems.forEach(item => {
            item.style.color = ''; // Reset to default
        });
    }

    // Function to apply dark theme styles
    function applyDarkTheme() {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
        body.style.backdropFilter = 'brightness(20%)';
        navItems.forEach(item => {
            item.style.color = 'white';
        });
    }

    // Load saved theme from local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-theme') {
        applyDarkTheme();
        themeSwitchCheckbox.checked = true;
    } else {
        applyLightTheme();
        themeSwitchCheckbox.checked = false;
    }

    // Event listener for theme switch
    themeSwitchCheckbox.addEventListener('change', function() {
        if (themeSwitchCheckbox.checked) {
            applyDarkTheme();
            localStorage.setItem('theme', 'dark-theme');
        } else {
            applyLightTheme();
            localStorage.setItem('theme', 'light-theme');
        }
    });

    // Initialize the map
    const map = map('map').setView([28.4595, 77.0266], 10); // Coordinates for Gurgaon, India

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a marker for Gurgaon
    L.marker([28.4595, 77.0266]).addTo(map)
        .bindPopup('Gurgaon')
        .openPopup();
});