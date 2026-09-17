const APIKey = '4caab872feb0dd17f3fb923806507eeb';
const STORAGE_KEY = 'weatherHistory';
const FAVORITES_KEY = 'weatherFavorites';
const SETTINGS_KEY = 'weatherSettings';
let latestCurrentWeather = null;
let latestForecastWeather = null;
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const historyList = document.getElementById('historyList');
const favoritesList = document.getElementById('favoritesList');
const historyPanel = document.getElementById('historyPanel');
const favoritesPanel = document.getElementById('favoritesPanel');
const historyTrigger = document.querySelector('.history-trigger');
const favoritesTrigger = document.querySelector('.favorites-trigger');
const dashboardTrigger = document.querySelector('.dashboard-trigger');
const forecastTrigger = document.querySelector('.forecast-trigger');
const settingsTrigger = document.querySelector('.settings-trigger');
const dashboardView = document.getElementById('dashboardView');
const forecastView = document.getElementById('forecastView');
const settingsView = document.getElementById('settingsView');
const closeHistory = document.getElementById('closeHistory');
const closeFavorites = document.getElementById('closeFavorites');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const favoriteToggle = document.getElementById('favoriteToggle');
const authModal = document.getElementById('authModal');
const closeAuthModalButton = document.getElementById('closeAuthModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileName = document.getElementById('profileName');
const profileStatus = document.getElementById('profileStatus');
const profileAvatar = document.getElementById('profileAvatar');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTitle = document.getElementById('authTitle');

const locationText = document.getElementById('locationText');
const currentTemp = document.getElementById('currentTemp');
const conditionText = document.getElementById('conditionText');
const statusIcon = document.getElementById('statusIcon');
const feelsLike = document.getElementById('feelsLike');
const humidityValue = document.getElementById('humidityValue');
const windValue = document.getElementById('windValue');
const visibilityValue = document.getElementById('visibilityValue');
const pressureValue = document.getElementById('pressureValue');
const uvValue = document.getElementById('uvValue');
const sunriseValue = document.getElementById('sunriseValue');
const sunsetValue = document.getElementById('sunsetValue');

const detailDate = document.getElementById('detailDate');
const detailIcon = document.getElementById('detailIcon');
const detailCondition = document.getElementById('detailCondition');
const dayRange = document.getElementById('dayRange');
const rainChance = document.getElementById('rainChance');
const detailHumidity = document.getElementById('detailHumidity');
const detailWind = document.getElementById('detailWind');
const detailSunrise = document.getElementById('detailSunrise');
const detailSunset = document.getElementById('detailSunset');

const hourlyRow = document.querySelector('.hourly-row');
const weeklyRow = document.querySelector('.weekly-row');

const setWeatherIcon = (main) => {
    const icons = {
        Clear: '☀️',
        Clouds: '☁️',
        Rain: '🌧️',
        Drizzle: '🌦️',
        Thunderstorm: '⛈️',
        Snow: '❄️',
        Mist: '🌫️',
        Fog: '🌫️',
        Haze: '🌫️'
    };

    return icons[main] || '☀️';
};

const formatTime = (timestamp, timezoneOffset = 0) => {
    const time = new Date((timestamp + timezoneOffset) * 1000);
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(time);
};

const formatDayName = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short'
    }).format(new Date(timestamp * 1000));
};

const formatDateLabel = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    }).format(new Date(timestamp * 1000));
};

const getSavedSettings = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
        return {
            unit: saved.unit || 'celsius',
            theme: saved.theme || 'dark',
            alerts: saved.alerts !== false,
            defaultCity: saved.defaultCity || ''
        };
    } catch (error) {
        return { unit: 'celsius', theme: 'dark', alerts: true, defaultCity: '' };
    }
};

const saveSettings = (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const getTemperatureUnit = () => getSavedSettings().unit || 'celsius';

const convertTemperature = (value, unit = getTemperatureUnit()) => {
    if (unit === 'fahrenheit') {
        return (value * 9) / 5 + 32;
    }
    return value;
};

const formatTemperature = (value, unit = getTemperatureUnit()) => {
    const temperature = Number.isFinite(value) ? value : 0;
    const converted = convertTemperature(temperature, unit);
    return `${Math.round(converted)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
};

const applyTheme = (themeName = getSavedSettings().theme || 'dark') => {
    const selectedTheme = themeName === 'light' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', selectedTheme);
    document.body.setAttribute('data-app-theme', selectedTheme);
};

const syncSettingsUI = () => {
    const settings = getSavedSettings();

    document.querySelectorAll('.segment[data-unit]').forEach((button) => {
        button.classList.toggle('active', button.dataset.unit === settings.unit);
    });

    document.querySelectorAll('.segment[data-theme]').forEach((button) => {
        button.classList.toggle('active', button.dataset.theme === settings.theme);
    });

    applyTheme(settings.theme);

    const defaultCityInput = document.querySelector('.default-city-input');
    if (defaultCityInput) {
        defaultCityInput.value = settings.defaultCity || '';
    }

    const alertsToggle = document.querySelector('.toggle-switch input[type="checkbox"]');
    if (alertsToggle) {
        alertsToggle.checked = settings.alerts !== false;
    }
};

const saveSettingsPreferences = () => {
    const settings = getSavedSettings();

    const selectedUnit = document.querySelector('.segment[data-unit].active');
    if (selectedUnit) {
        settings.unit = selectedUnit.dataset.unit;
    }

    const selectedTheme = document.querySelector('.segment[data-theme].active');
    if (selectedTheme) {
        settings.theme = selectedTheme.dataset.theme;
    }

    const alertsToggle = document.querySelector('.toggle-switch input[type="checkbox"]');
    if (alertsToggle) {
        settings.alerts = alertsToggle.checked;
    }

    const defaultCityInput = document.querySelector('.default-city-input');
    if (defaultCityInput) {
        settings.defaultCity = defaultCityInput.value.trim();
    }

    saveSettings(settings);
    syncSettingsUI();

    if (latestCurrentWeather && latestForecastWeather) {
        updateWeatherUI(latestCurrentWeather, latestForecastWeather);
    }
};

const updateDayDetail = (currentData, forecastData) => {
    const description = currentData.weather?.[0]?.description || 'Partly Cloudy';
    const main = currentData.weather?.[0]?.main || 'Clear';
    const dailySummary = forecastData.list?.[0] || currentData;
    const date = dailySummary.dt || currentData.dt;
    const maxTemp = Math.max(...forecastData.list.map((item) => item.main.temp_max)) || currentData.main.temp;
    const minTemp = Math.min(...forecastData.list.map((item) => item.main.temp_min)) || currentData.main.temp;
    const rainVolume = Math.round((dailySummary.pop || 0) * 100);

    detailDate.textContent = formatDateLabel(date);
    detailIcon.textContent = setWeatherIcon(main);
    detailCondition.textContent = description;
    dayRange.textContent = `${formatTemperature(maxTemp)} / ${formatTemperature(minTemp)}`;
    rainChance.textContent = `${rainVolume}%`;
    detailHumidity.textContent = `${currentData.main.humidity}%`;
    detailWind.textContent = `${Math.round(currentData.wind.speed)} km/h`;
    detailSunrise.textContent = formatTime(currentData.sys.sunrise, currentData.timezone || 0);
    detailSunset.textContent = formatTime(currentData.sys.sunset, currentData.timezone || 0);
};

const renderHourlyForecast = (forecastData) => {
    const items = forecastData.list.slice(0, 7);
    hourlyRow.innerHTML = items.map((item) => {
        const time = new Date(item.dt * 1000);
        return `
            <div class="forecast-item">
                <span>${time.toLocaleTimeString([], { hour: 'numeric' }).replace(' AM', 'AM').replace(' PM', 'PM')}</span>
                <i>${setWeatherIcon(item.weather[0].main)}</i>
                <strong>${formatTemperature(item.main.temp)}</strong>
            </div>
        `;
    }).join('');
};

const renderWeeklyForecast = (forecastData) => {
    const days = {};

    if (!forecastData || !Array.isArray(forecastData.list)) {
        weeklyRow.innerHTML = '';
        return;
    }

    forecastData.list.forEach((item) => {
        const key = item.dt_txt ? item.dt_txt.split(' ')[0] : new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!days[key]) {
            days[key] = item;
        }
    });

    const dailyEntries = Object.values(days).slice(0, 7);

    weeklyRow.innerHTML = dailyEntries.map((item) => {
        return `
            <div class="forecast-item">
                <span>${formatDayName(item.dt)}</span>
                <i>${setWeatherIcon(item.weather[0].main)}</i>
                <strong>${formatTemperature(item.main.temp)}</strong>
            </div>
        `;
    }).join('');
};

const getHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
};

const saveWeatherToHistory = (currentData, forecastData) => {
    const entry = {
        city: currentData.name,
        country: currentData.sys?.country || '',
        temp: Math.round(currentData.main.temp),
        description: currentData.weather?.[0]?.description || 'Weather',
        timestamp: new Date().toISOString(),
        currentData,
        forecastData
    };

    const history = getHistory();
    const filteredHistory = history.filter((item) => item.city !== entry.city || item.country !== entry.country);
    filteredHistory.unshift(entry);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory.slice(0, 10)));
    renderHistoryList();
};

const getFavorites = () => {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch (error) {
        return [];
    }
};

const isFavoriteCity = (cityName, country) => {
    return getFavorites().some((entry) => entry.city === cityName && entry.country === country);
};

const setFavoriteButtonState = (cityName, country) => {
    if (!favoriteToggle) {
        return;
    }

    const active = isFavoriteCity(cityName, country);
    favoriteToggle.classList.toggle('active', active);
    favoriteToggle.textContent = active ? '★' : '☆';
    favoriteToggle.setAttribute('aria-label', active ? 'Remove from favourites' : 'Add to favourites');
};

const renderHistoryList = () => {
    const history = getHistory();

    if (!historyList) {
        return;
    }

    if (!history.length) {
        historyList.innerHTML = '<li class="history-item"><div><strong>No saved searches</strong><small>Your recent city searches will appear here.</small></div></li>';
        return;
    }

    historyList.innerHTML = history.map((entry) => `
        <li>
            <button class="history-item" type="button" data-city="${entry.city}" data-country="${entry.country}">
                <div>
                    <strong>${entry.city}${entry.country ? ', ' + entry.country : ''}</strong>
                    <small>${entry.description}</small>
                </div>
                <span class="history-temp">${formatTemperature(entry.temp)}</span>
            </button>
        </li>
    `).join('');

    historyList.querySelectorAll('.history-item').forEach((item) => {
        item.addEventListener('click', () => {
            const city = item.dataset.city;
            const matchingEntry = getHistory().find((entry) => entry.city === city && (item.dataset.country ? entry.country === item.dataset.country : true));

            if (matchingEntry) {
                updateWeatherUI(matchingEntry.currentData, matchingEntry.forecastData);
                historyPanel.classList.add('hidden');
            }
        });
    });
};

const renderFavoritesList = () => {
    const favorites = getFavorites();

    if (!favoritesList) {
        return;
    }

    if (!favorites.length) {
        favoritesList.innerHTML = '<li class="history-item"><div><strong>No favourites yet</strong><small>Click the star to save a city.</small></div></li>';
        return;
    }

    favoritesList.innerHTML = favorites.map((entry) => `
        <li>
            <button class="history-item" type="button" data-city="${entry.city}" data-country="${entry.country}">
                <div>
                    <strong>${entry.city}${entry.country ? ', ' + entry.country : ''}</strong>
                    <small>${entry.description}</small>
                </div>
                <span class="history-temp">${formatTemperature(entry.temp)}</span>
    `).join('');

    favoritesList.querySelectorAll('.history-item').forEach((item) => {
        item.addEventListener('click', () => {
            const city = item.dataset.city;
            const matchingEntry = getFavorites().find((entry) => entry.city === city && (item.dataset.country ? entry.country === item.dataset.country : true));

            if (matchingEntry) {
                updateWeatherUI(matchingEntry.currentData, matchingEntry.forecastData);
                favoritesPanel.classList.add('hidden');
            }
        });
    });
};

const hideMainViews = () => {
    if (dashboardView) {
        dashboardView.classList.add('hidden');
    }

    if (forecastView) {
        forecastView.classList.add('hidden');
    }

    if (settingsView) {
        settingsView.classList.add('hidden');
    }
};

const restoreMainView = (viewName = 'dashboard') => {
    if (dashboardView) {
        dashboardView.classList.toggle('hidden', viewName !== 'dashboard');
    }

    if (forecastView) {
        forecastView.classList.toggle('hidden', viewName !== 'forecast');
    }

    if (settingsView) {
        settingsView.classList.toggle('hidden', viewName !== 'settings');
    }
};

const toggleHistoryPanel = () => {
    if (!historyPanel) {
        return;
    }

    const isHidden = historyPanel.classList.contains('hidden');
    hideMainViews();

    if (isHidden) {
        historyPanel.classList.remove('hidden');
        favoritesPanel?.classList.add('hidden');
        renderHistoryList();
    } else {
        historyPanel.classList.add('hidden');
        restoreMainView('dashboard');
    }
};

const toggleFavoritesPanel = () => {
    if (!favoritesPanel) {
        return;
    }

    const isHidden = favoritesPanel.classList.contains('hidden');
    hideMainViews();

    if (isHidden) {
        favoritesPanel.classList.remove('hidden');
        historyPanel?.classList.add('hidden');
        renderFavoritesList();
    } else {
        favoritesPanel.classList.add('hidden');
        restoreMainView('dashboard');
    }
};

const closeAllPanels = () => {
    if (favoritesPanel) {
        favoritesPanel.classList.add('hidden');
    }

    if (historyPanel) {
        historyPanel.classList.add('hidden');
    }
};

const setMainView = (view) => {
    const navButtons = document.querySelectorAll('.nav-item');

    navButtons.forEach((button) => {
        const isActive = (button.classList.contains('dashboard-trigger') && view === 'dashboard') ||
            (button.classList.contains('forecast-trigger') && view === 'forecast') ||
            (button.classList.contains('settings-trigger') && view === 'settings');
        button.classList.toggle('active', isActive);
    });

    if (dashboardView) {
        dashboardView.classList.toggle('hidden', view !== 'dashboard');
    }

    if (forecastView) {
        forecastView.classList.toggle('hidden', view !== 'forecast');
    }

    if (settingsView) {
        settingsView.classList.toggle('hidden', view !== 'settings');
    }

    closeAllPanels();
};

const renderForecastScreen = (currentData, forecastData) => {
    const forecastCityName = document.getElementById('forecastCityName');
    const forecastHeaderIcon = document.getElementById('forecastHeaderIcon');
    const forecastHeroIcon = document.getElementById('forecastHeroIcon');
    const forecastHeroTemp = document.getElementById('forecastHeroTemp');
    const forecastHeroCondition = document.getElementById('forecastHeroCondition');
    const forecastRainChance = document.getElementById('forecastRainChance');
    const forecastHumidity = document.getElementById('forecastHumidity');
    const forecastWind = document.getElementById('forecastWind');
    const forecastFeelsLike = document.getElementById('forecastFeelsLike');
    const forecastHourlyGrid = document.getElementById('forecastHourlyGrid');
    const forecastWeeklyGrid = document.getElementById('forecastWeeklyGrid');

    if (!forecastCityName || !forecastData) {
        return;
    }

    const cityName = currentData.name || 'City';
    const country = currentData.sys?.country || '';
    const main = currentData.weather?.[0]?.main || 'Clear';
    const description = currentData.weather?.[0]?.description || 'Weather';
    const rainChance = Math.round((forecastData.list?.[0]?.pop || 0) * 100);

    forecastCityName.textContent = `${cityName}${country ? ', ' + country : ''}`;
    forecastHeaderIcon.textContent = setWeatherIcon(main);
    forecastHeroIcon.textContent = setWeatherIcon(main);
    forecastHeroTemp.textContent = formatTemperature(currentData.main.temp);
    forecastHeroCondition.textContent = description;
    forecastRainChance.textContent = `${rainChance}%`;
    forecastHumidity.textContent = `${currentData.main.humidity}%`;
    forecastWind.textContent = `${Math.round(currentData.wind.speed)} km/h`;
    forecastFeelsLike.textContent = formatTemperature(currentData.main.feels_like);

    if (forecastHourlyGrid) {
        const hourlyItems = forecastData.list.slice(0, 8);
        forecastHourlyGrid.innerHTML = hourlyItems.map((item) => `
            <div class="forecast-item">
                <span>${new Date(item.dt * 1000).toLocaleTimeString([], { hour: 'numeric' })}</span>
                <i>${setWeatherIcon(item.weather[0].main)}</i>
                <strong>${formatTemperature(item.main.temp)}</strong>
            </div>
        `).join('');
    }

    if (forecastWeeklyGrid) {
        const days = {};
        forecastData.list.forEach((item) => {
            const key = item.dt_txt ? item.dt_txt.split(' ')[0] : new Date(item.dt * 1000).toISOString().split('T')[0];
            if (!days[key]) {
                days[key] = item;
            }
        });

        const weeklyEntries = Object.values(days).slice(0, 7);
        forecastWeeklyGrid.innerHTML = weeklyEntries.map((item) => `
            <div class="forecast-item">
                <span>${formatDayName(item.dt)}</span>
                <i>${setWeatherIcon(item.weather[0].main)}</i>
                <strong>${formatTemperature(item.main.temp)}</strong>
            </div>
        `).join('');
    }
};

const addFavorite = (currentData) => {
    const city = currentData.name;
    const country = currentData.sys?.country || '';
    const favorites = getFavorites();
    const matching = favorites.find((item) => item.city === city && item.country === country);

    if (matching) {
        const updated = favorites.filter((item) => !(item.city === city && item.country === country));
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
        renderFavoritesList();
        setFavoriteButtonState(city, country);
        return;
    }

    const favoriteEntry = {
        city,
        country,
        temp: Math.round(currentData.main.temp),
        description: currentData.weather?.[0]?.description || 'Weather',
        currentData,
        forecastData: null
    };

    const history = getHistory();
    const latestMatch = history.find((entry) => entry.city === city && entry.country === country);
    if (latestMatch) {
        favoriteEntry.forecastData = latestMatch.forecastData;
    }

    favorites.unshift(favoriteEntry);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.slice(0, 10)));
    renderFavoritesList();
    setFavoriteButtonState(city, country);
};

const updateWeatherUI = (currentData, forecastData) => {
    const cityName = currentData.name || 'Unknown City';
    const country = currentData.sys?.country || '';
    const description = currentData.weather?.[0]?.description || 'Weather';
    const main = currentData.weather?.[0]?.main || 'Clear';

    latestCurrentWeather = currentData;
    latestForecastWeather = forecastData;

    locationText.textContent = `${cityName}${country ? ', ' + country : ''}`;
    currentTemp.textContent = formatTemperature(currentData.main.temp);
    conditionText.textContent = description;
    statusIcon.textContent = setWeatherIcon(main);
    feelsLike.textContent = formatTemperature(currentData.main.feels_like);
    humidityValue.textContent = `${currentData.main.humidity}%`;
    windValue.textContent = `${Math.round(currentData.wind.speed)} km/h`;
    visibilityValue.textContent = `${Math.round(currentData.visibility / 1000)} km`;
    pressureValue.textContent = `${currentData.main.pressure} hPa`;
    uvValue.textContent = '6';
    sunriseValue.textContent = formatTime(currentData.sys.sunrise, currentData.timezone || 0);
    sunsetValue.textContent = formatTime(currentData.sys.sunset, currentData.timezone || 0);
    setFavoriteButtonState(cityName, country);

    updateDayDetail(currentData, forecastData);
    renderHourlyForecast(forecastData);
    renderWeeklyForecast(forecastData);
    renderForecastScreen(currentData, forecastData);
};

const fetchWeather = (city) => {
    if (!city.trim()) {
        cityInput.focus();
        return;
    }

    Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${APIKey}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${APIKey}`)
    ])
        .then(async ([currentResponse, forecastResponse]) => {
            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('City not found');
            }

            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();
            updateWeatherUI(currentData, forecastData);
            saveWeatherToHistory(currentData, forecastData);
        })
        .catch((error) => {
            alert('City not found. Please try another location.');
            console.error(error);
        });
};

searchBtn.addEventListener('click', () => fetchWeather(cityInput.value));
cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        fetchWeather(cityInput.value);
    }
});

if (historyTrigger) {
    historyTrigger.addEventListener('click', toggleHistoryPanel);
}

if (favoritesTrigger) {
    favoritesTrigger.addEventListener('click', toggleFavoritesPanel);
}

if (dashboardTrigger) {
    dashboardTrigger.addEventListener('click', () => {
        setMainView('dashboard');
    });
}

if (forecastTrigger) {
    forecastTrigger.addEventListener('click', () => {
        setMainView('forecast');
    });
}

if (settingsTrigger) {
    settingsTrigger.addEventListener('click', () => {
        setMainView('settings');
    });
}

if (closeHistory) {
    closeHistory.addEventListener('click', () => historyPanel.classList.add('hidden'));
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        renderHistoryList();
    });
}

if (closeFavorites) {
    closeFavorites.addEventListener('click', () => favoritesPanel.classList.add('hidden'));
}

if (favoriteToggle) {
    favoriteToggle.addEventListener('click', () => {
        const cityName = locationText.textContent.split(',')[0].trim();
        const country = locationText.textContent.includes(',') ? locationText.textContent.split(',').slice(1).join(',').trim() : '';
        const favorites = getFavorites();
        const current = favorites.find((entry) => entry.city === cityName && entry.country === country);

        if (current) {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.filter((entry) => !(entry.city === cityName && entry.country === country))));
            renderFavoritesList();
            setFavoriteButtonState(cityName, country);
            return;
        }

        const favoriteEntry = {
            city: cityName,
            country,
            temp: Number.parseInt(currentTemp.textContent, 10) || 0,
            description: conditionText.textContent,
            currentData: {
                name: cityName,
                sys: { country },
                main: { temp: Number.parseInt(currentTemp.textContent, 10) || 0 },
                weather: [{ description: conditionText.textContent }]
            },
            forecastData: null
        };

        const history = getHistory();
        const latestMatch = history.find((entry) => entry.city === cityName && entry.country === country);
        if (latestMatch) {
            favoriteEntry.forecastData = latestMatch.forecastData;
        }

        favorites.unshift(favoriteEntry);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.slice(0, 10)));
        renderFavoritesList();
        setFavoriteButtonState(cityName, country);
    });
}

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('weatherUser')) || null;
    } catch (error) {
        return null;
    }
};

const saveUserSession = (user) => {
    localStorage.setItem('weatherUser', JSON.stringify(user));
    updateProfileUI(user);
};

const clearUserSession = () => {
    localStorage.removeItem('weatherUser');
    updateProfileUI({
        name: 'Guest User',
        status: 'Login / Register',
        email: 'guest@example.com'
    });
};

const updateProfileUI = (user) => {
    const safeName = user?.name || 'Guest User';
    const safeStatus = user?.status || 'Login / Register';

    if (profileName) {
        profileName.textContent = safeName;
    }

    if (profileStatus) {
        profileStatus.textContent = safeStatus;
    }

    if (profileAvatar) {
        profileAvatar.textContent = safeName.charAt(0).toUpperCase();
    }

    const isLoggedIn = !!user?.name && user.name !== 'Guest User';

    if (loginBtn) {
        loginBtn.classList.toggle('hidden', isLoggedIn);
    }

    if (signupBtn) {
        signupBtn.classList.toggle('hidden', isLoggedIn);
    }

    if (logoutBtn) {
        logoutBtn.classList.toggle('hidden', !isLoggedIn);
    }
};

const openAuthModal = (mode = 'login') => {
    if (!authModal) return;

    authModal.classList.remove('hidden');
    authTitle.textContent = mode === 'register' ? 'Create your account' : 'Login to your account';

    authTabs.forEach((tab) => {
        const active = tab.dataset.authTab === mode;
        tab.classList.toggle('active', active);
    });

    authForms.forEach((form) => {
        form.classList.toggle('active', form.id === `${mode}Form`);
    });
};

const closeAuthModalDialog = () => {
    if (!authModal) return;
    authModal.classList.add('hidden');
};

const getUsers = () => {
    try {
        return JSON.parse(localStorage.getItem('weatherUsers')) || [];
    } catch (error) {
        return [];
    }
};

const saveUsers = (users) => {
    localStorage.setItem('weatherUsers', JSON.stringify(users));
};

if (loginBtn) {
    loginBtn.addEventListener('click', () => openAuthModal('login'));
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => openAuthModal('register'));
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        clearUserSession();
    });
}

if (closeAuthModalButton) {
    closeAuthModalButton.addEventListener('click', closeAuthModalDialog);
}

if (authModal) {
    authModal.addEventListener('click', (event) => {
        if (event.target === authModal) {
            closeAuthModalDialog();
        }
    });
}

authTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        openAuthModal(tab.dataset.authTab);
    });
});

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const email = String(formData.get('email') || '').trim();
        const password = String(formData.get('password') || '').trim();
        const users = getUsers();
        const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);

        if (!user) {
            alert('Invalid email or password. Please try again.');
            return;
        }

        saveUserSession({ name: user.name, status: 'Online', email: user.email });
        closeAuthModalDialog();
        loginForm.reset();
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(registerForm);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const password = String(formData.get('password') || '').trim();
        const confirmPassword = String(formData.get('confirmPassword') || '').trim();

        if (!name || !email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const users = getUsers();
        if (users.some((entry) => entry.email.toLowerCase() === email.toLowerCase())) {
            alert('This email is already registered.');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        saveUsers(users);
        saveUserSession({ name, status: 'Online', email });
        closeAuthModalDialog();
        registerForm.reset();
    });
}

document.querySelectorAll('.segment[data-unit]').forEach((button) => {
    button.addEventListener('click', () => {
        const settings = getSavedSettings();
        settings.unit = button.dataset.unit;
        saveSettings(settings);
        syncSettingsUI();

        if (latestCurrentWeather && latestForecastWeather) {
            updateWeatherUI(latestCurrentWeather, latestForecastWeather);
        }

        renderHistoryList();
        renderFavoritesList();
    });
});

document.querySelectorAll('.segment[data-theme]').forEach((button) => {
    button.addEventListener('click', () => {
        const settings = getSavedSettings();
        settings.theme = button.dataset.theme;
        saveSettings(settings);
        syncSettingsUI();
    });
});

const saveSettingsButton = document.querySelector('.save-settings-btn');
if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', saveSettingsPreferences);
}

const defaultCityInput = document.querySelector('.default-city-input');
if (defaultCityInput) {
    defaultCityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            saveSettingsPreferences();
        }
    });
}

const currentUser = getStoredUser();
if (currentUser) {
    updateProfileUI(currentUser);
} else {
    updateProfileUI({ name: 'Guest User', status: 'Login / Register', email: 'guest@example.com' });
}

syncSettingsUI();
renderHistoryList();
renderFavoritesList();
