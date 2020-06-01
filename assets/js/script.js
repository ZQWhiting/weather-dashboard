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
    // format the github api url
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    // make a request to the url
    fetch(apiUrl)
        .then(function (response) {
            // request was successful
            if (response.ok) {
                response.json().then(function (data) {
                    /* getUv(data); */
                    displayWeather(data);
                });
            } else {
                alert(`Error: ${response.statusText}`);
            }
        })
        .catch(function (error) {
            alert(`Unable to connect to OpenWeather`);
        });
};

const displayWeather = function (weather) {
    const date = moment().format('D/M/YYYY');
    const city = weather.name;
    $('#solo-header').text(`${city} (${date})`);

    const iconCode = weather.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`
    const iconEl = $('<img>').attr('src', iconUrl);
    iconEl.appendTo($('#solo-header'));

    const temp = weather.main.temp.toFixed(1);
    const wind = weather.wind.speed.toFixed(1);
    const humid = weather.main.humidity;
    $('#solo-temp').text(`Temperature: ${temp} ºF`)
    $('#solo-humid').text(`Humidity: ${humid}%`)
    $('#solo-wind').text(`Wind Speed: ${wind} MPH`)
    $('#solo-uv').text(`UV Index: `)
}