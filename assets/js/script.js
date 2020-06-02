const apiKey = `39493785b634f65fe602344a1b7e0862`

// form handler
$('#city-submit').on('click', (event) => {
    event.preventDefault();

    const cityInput = $('#city-input').val().trim();

    if (cityInput) {
        $('#city-input').val('');
        getWeather(cityInput);
    } else {
        alert(`Please enter a city`);
    }
});

const getWeather = async (city) => {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

        const currentWeather = await fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`${response.status} ${response.statusText}`);
                } else {
                    return response.json()
                }
            });

        const cityLat = currentWeather.coord.lat;
        const cityLon = currentWeather.coord.lon;
        const cityId = currentWeather.id;
        const uvUrl = `http://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${cityLat}&lon=${cityLon}`;
        const fiveDayUrl = `http://api.openweathermap.org/data/2.5/forecast?id=${cityId}&units=imperial&appid=${apiKey}`;

        const uvIndex = await fetch(uvUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`${response.status} ${response.statusText}`);
                } else {
                    return response.json();
                }
            });

        const fiveDayForecast = await fetch(fiveDayUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`${response.status} ${response.statusText}`);
                } else {
                    return response.json();
                }
            });

        displayWeather(currentWeather, uvIndex, fiveDayForecast);
    } catch (e) {
        switch (e.message) {
            case '404 Not Found':
                alert(e + '\nPlease enter a valid city');
                break;
            case 'Failed to fetch':
                alert(e + '\nUnable to connect to OpenWeather.');
                break;
            default:
                alert(e);
                console.log(e);
        }
    }
};

const displayWeather = (currentWeather, uvIndex, fiveDay) => {
    $('#5-day-deck').text('')
    let date = moment().format('D/M/YYYY');
    const city = currentWeather.name;
    $('#solo-header').text(`${city} (${date})`);

    let iconCode = currentWeather.weather[0].icon;
    let iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
    const iconEl = $('<img>').attr('src', iconUrl);
    iconEl.appendTo($('#solo-header'));

    let temp = currentWeather.main.temp.toFixed(1);
    let wind = currentWeather.wind.speed.toFixed(1);
    let humid = currentWeather.main.humidity;
    $('#solo-temp').text(`Temperature: ${temp} ºF`);
    $('#solo-humid').text(`Humidity: ${humid}%`);
    $('#solo-wind').text(`Wind Speed: ${wind} MPH`);
    $('#solo-uv').text(`UV Index: `);

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

    $('#5-day-header').text('5-Day Forecast:');

    const fiveDayInfo = getFiveDayInfo(fiveDay);
    for (let i = 0; i < fiveDayInfo.length; i++) {
        iconCode = fiveDayInfo[i].icon;
        iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`
        temp = fiveDayInfo[i].temp.toFixed(1);
        humid = fiveDayInfo[i].humid;
        date = moment(fiveDayInfo[i].date).format('D/M/YYYY');
        $('<div>')
            .addClass('card bg-primary text-white px-2 py-2')
            .attr('id', i)
            .appendTo($('#5-day-deck'));

        $('<h4>')
            .text(date)
            .addClass('mb-4')
            .appendTo($(`#${i}`))

        $('<img>')
            .addClass('mb-4 ml-2')
            .attr('src', iconUrl)
            .appendTo($('<div>')
                .appendTo($(`#${i}`)))

        $('<p>')
            .text(`Temp: ${temp} ºF`)
            .appendTo($(`#${i}`))

        $('<p>')
            .text(`Humidity: ${humid}%`)
            .addClass('mb-0')
            .appendTo($(`#${i}`))

    }
};

const getFiveDayInfo = function (fiveDay) {
    let dateTracker;
    let x = -1
    let fiveDayInfo = []

    for (let i = 0; i < fiveDay.list.length; i++) {
        const listItem = fiveDay.list[i];
        let date = listItem.dt_txt
        date = date.split(" ")
        date = date[0];

        let icon = listItem.weather[0].icon;
        icon = icon.replace('n', 'd');
        let temp = listItem.main.temp;
        let humid = listItem.main.humidity;

        if (date === dateTracker) {
            if (fiveDayInfo[x].temp < temp) {
                fiveDayInfo[x].temp = temp;
            }
            if (fiveDayInfo[x].humid < humid) {
                fiveDayInfo[x].humid = humid;
                fiveDayInfo[x].icon = icon; // find better way to update icon?
            }
        } else {
            x++;
            dateTracker = date;
            dayObj = {
                date: date,
                temp: temp,
                humid: humid,
                icon: icon
            }
            fiveDayInfo.push(dayObj);
        }
    }

    for (let i = 0; i < fiveDayInfo.length; i++) {
        let elementDate = moment(fiveDayInfo[i].date).format('D/M/YYYY');
        let date = moment().format('D/M/YYYY');
        if (elementDate === date) {
            fiveDayInfo.splice(i, 1);
        }
    }
    return fiveDayInfo;
}