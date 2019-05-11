function adjustScreen() {
    if (views.graberClicked === true) {
        views.graberClicked = false;
        views.main.style.width = `${window.event.clientX}px`;
    }
}

function LocationChange() {
    fetchCity(views.citiesSelector.value);
}

function fetchCity(city) {
    fetchApi(city).then(function (json) {
        updateWeatherView(json);
    });
}

function fetchApi(req) {
    return (
        cache.call(`/api/https://api.openweathermap.org/data/2.5/forecast?q=${req}&appid=19c1eb066baab2b72c091dfdf6ffbeb4`)
            .then(response => {
                return (response.json());
            }));
}

function updateWeatherView(json) {
    views.map.setView([json.city.coord.lat, json.city.coord.lon], 8);
    updateMarkers(json.city.name);
    const weatherNow = json.list.pop();
    views.weatherIcon.src = `http://openweathermap.org/img/w/${weatherNow.weather[0].icon}.png`;
    views.weatherStats.innerHTML = `<h4>Description: ${weatherNow.weather[0].description}</h4>
                                    <h4>Wind: ${weatherNow.wind.speed}knots, ${weatherNow.wind.speed}&deg;</h4>
                                    <h4>Temperature: ${Math.round(weatherNow.main.temp - 273.15)}&deg;C</h4>
                                    <h4>Humidity: ${weatherNow.main.humidity}%</h4>`;
}

function updateMarkers(city) {
    views.cityList[views.currentCity].marker.setIcon(views.blueMarker);
    views.cityList[city].marker.setIcon(views.redMarker);
    views.currentCity = city;
}

function citySelected(city) {
    views.citiesSelector.value = city;
    fetchCity(city);
}

function setEventListeners() {
    views.citiesSelector.addEventListener('change', LocationChange);
    views.graber.addEventListener('mousedown', () => views.graberClicked = true);
    views.body.addEventListener('mouseup', adjustScreen);
}

function init() {
    // Initiate map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 22,
        id: 'mapbox.satellite',
        accessToken: 'pk.eyJ1Ijoiam9uYXRoYW5hIiwiYSI6ImNqdWxoaHVtcDBlbDgzem1xNmo3aXEyYzYifQ.5TZyAVppLKuArYNbJRE3rg'
    }).addTo(views.map);

    //add cites to selector and map markers (including click event listeners)
    let tmpView = '';
    Object.keys(views.cityList).forEach((city) => {
        tmpView += `<option value="${city}">${city}</option>`;
        views.cityList[city].marker = L.marker(views.cityList[city], {icon: views.blueMarker}).addTo(views.map).on('click', () => {
            citySelected(city)
        });
    });
    views.citiesSelector.innerHTML = tmpView;
    setEventListeners();
    LocationChange();
}

