const apiKey = `39493785b634f65fe602344a1b7e0862`

// form handler
$('#city-submit').on('click', function (event) {
    event.preventDefault();

    const cityInput = $('#city-input').val().trim();

    if (cityInput) {
        getWeather(cityInput);
        $('#city-input').val('');
    } else {
        alert(`Please enter a city`)
    }
})

const getWeather = function (city) {
    // format the openweather api url
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    // make a request to the url
    fetch(apiUrl)
        .then(function (response) {
            // request was successful
            if (response.ok) {
                response.json().then(function (currentWeather) {
                    getUv(currentWeather);
                });
            } else {
                alert(`Error: ${response.statusText}`);
            }
        })
        .catch(function (error) {
            alert(`Unable to connect to OpenWeather`);
        });
};

const getUv = function (currentWeather) {
    const lat = currentWeather.coord.lat;
    const lon = currentWeather.coord.lon;
    const apiUrl = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`

    fetch(apiUrl)
        .then(function (response) {
            // request was successful
            if (response.ok) {
                response.json().then(function (uvIndex) {
                    displayWeather(currentWeather, uvIndex)
                });
            } else {
                alert(`Error: ${response.statusText}`);
            }
        })
        .catch(function (error) {
            alert(`Unable to connect to OpenWeather`);
        });
};

const displayWeather = function (currentWeather, uvIndex) {
    const date = moment().format('D/M/YYYY');
    const city = currentWeather.name;
    $('#solo-header').text(`${city} (${date})`);

    const iconCode = currentWeather.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`
    const iconEl = $('<img>').attr('src', iconUrl);
    iconEl.appendTo($('#solo-header'));

    const temp = currentWeather.main.temp.toFixed(1);
    const wind = currentWeather.wind.speed.toFixed(1);
    const humid = currentWeather.main.humidity;
    $('#solo-temp').text(`Temperature: ${temp} ºF`)
    $('#solo-humid').text(`Humidity: ${humid}%`)
    $('#solo-wind').text(`Wind Speed: ${wind} MPH`)
    $('#solo-uv').text(`UV Index: `)

    const uvIndexEl = $('<span>')
        .text(uvIndex.value)
        .addClass('rounded text-white p-1');

    if (uvIndexEl.text() <= 2) {
        uvIndexEl.addClass('bg-success');
    }
    else if (uvIndexEl.text() <= 5) {
        uvIndexEl.addClass('bg-warning');
    }
    else {
        uvIndexEl.addClass('bg-danger');
    }
    uvIndexEl.appendTo($('#solo-uv'));
};