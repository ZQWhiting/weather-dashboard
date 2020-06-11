const apiKey = `39493785b634f65fe602344a1b7e0862`

// fetch function
const myFetch = async (apiUrl) => {
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    else {
        return response.json();
    }
};

// form handler
$('#city-submit').on('click', (event) => {
    event.preventDefault();

    const cityInput = $('#city-input').val().trim().toLowerCase();

    if (cityInput) {
        // get weather info from OpenWeather
        // clear form city-input value
        getWeather(cityInput);
        $('#city-input').val('');
    } else {
        alert(`Please enter a city`);
    }
});

const getWeather = async (city) => {
    // values to be set as arguments to displayWeather function
    let currentWeather;
    let uvIndex;
    let sortedFiveDay;

    // get info and assign to values
    try {
        // url for current weather api call
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

        // api call to current weather data
        currentWeather = await myFetch(apiUrl);

        // use data from current weather response to obtain urls for other api calls
        const cityLat = currentWeather.coord.lat;
        const cityLon = currentWeather.coord.lon;
        const cityId = currentWeather.id;
        const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${cityLat}&lon=${cityLon}`;
        const fiveDayUrl = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&units=imperial&appid=${apiKey}`;

        // api call to uv index
        uvIndex = await myFetch(uvUrl);

        // api call to 5-day/3-hour forecast
        const fiveDayForecast = await myFetch(fiveDayUrl);

        // retrieve wanted info from 5-day/3-hour forecast response
        sortedFiveDay = getFiveDayInfo(fiveDayForecast);

    } catch (e) { // Error handling
        switch (e.message) {
            case '404 Not Found':
                alert(e + '\nPlease enter a valid city');
                break;
            case 'Failed to fetch':
                alert(e + '\nUnable to connect to OpenWeather');
                break;
            default:
                alert(e + '\nCheck console for details')
                console.log(e, e.status, e.statusText);
        }
    }
    // display wanted data
    // save search value
    displayWeather(currentWeather, uvIndex, sortedFiveDay);
    saveSearch(city);
};

const getFiveDayInfo = fiveDay => {
    // array to store wanted info to be returned
    let fiveDayInfo = []

    // tracks fiveDayInfo[x]
    // tracks repeat date
    let x = -1
    let dateTracker;

    // iterate through the data retrieved from the api
    for (let i = 0; i < fiveDay.list.length; i++) {
        const listItem = fiveDay.list[i];

        // shortname values
        let icon = listItem.weather[0].icon;
        icon = icon.replace('n', 'd');
        let temp = listItem.main.temp;
        let humid = listItem.main.humidity;

        // obtain date value
        let date = listItem.dt_txt
        date = date.split(" ");
        date = date[0];

        // IF date is a repeat, obtain highest data values
        if (date === dateTracker) {
            // IF temperature stored in the object is less than the new temperature value
            // replace old temperature
            if (fiveDayInfo[x].temp < temp) {
                fiveDayInfo[x].temp = temp;
            }
            // IF humidity stored in the object is less than the new humidity value
            // replace old temperature
            // replace old icon
            if (fiveDayInfo[x].humid < humid) {
                fiveDayInfo[x].humid = humid;
                fiveDayInfo[x].icon = icon; // find better way to update icon?
            }
            // ELSE it is the first object of a date
        } else {
            // mark the start of a new date on the datetracker
            dateTracker = date;

            // create an object storing the wanted values
            // and push it into the array to be returned
            day = {
                date: date,
                temp: temp,
                humid: humid,
                icon: icon
            }
            fiveDayInfo.push(day);

            // and track next object fiveDayInfo[x]
            x++;
        }
    }

    /* before returning the info, remove unwanted date */
    // iterate through sorted info array
    for (let i = 0; i < fiveDayInfo.length; i++) {
        // create moment objects for the current object
        // and for today
        let elementDate = moment(fiveDayInfo[i].date).format('D/M/YYYY');
        let date = moment().format('D/M/YYYY');

        // IF the object has the same date as today
        // remove it from the array
        if (elementDate === date) {
            fiveDayInfo.splice(i, 1);
        }
    }

    // return the wanted info
    return fiveDayInfo;
};

const displayWeather = (currentWeather, uvIndex, fiveDay) => {
    /* Start of Current Weather Display */
    // Display Header
    let date = moment().format('D/M/YYYY');
    let city = currentWeather.name;
    $('#solo-header').text(`${city} (${date})`);

    let iconCode = currentWeather.weather[0].icon;
    let icon = `https://openweathermap.org/img/w/${iconCode}.png`;
    $('<img>')
        .attr('src', icon)
        .appendTo($('#solo-header'));

    // Display Weather Values
    let temp = currentWeather.main.temp.toFixed(1);
    let wind = currentWeather.wind.speed.toFixed(1);
    let humid = currentWeather.main.humidity;
    $('#solo-temp').text(`Temperature: ${temp} ºF`);
    $('#solo-humid').text(`Humidity: ${humid}%`);
    $('#solo-wind').text(`Wind Speed: ${wind} MPH`);

    // Display UV Index
    $('#solo-uv').text(`UV Index: `);

    const uvIndexEl = $('<span>')
        .text(uvIndex.value)
        .addClass('rounded text-white p-1');

    // UV Index Color Indicators
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
    /* End of Current Weather Display */

    /* Start of 5 Day Forecast display */
    // Remove previous cards
    $('#5-day-deck').text('');

    // Display Header
    $('#5-day-header').text('5-Day Forecast:');

    // Display a Card for Each Day
    for (let i = 0; i < fiveDay.length; i++) {

        // Data Values to Display
        iconCode = fiveDay[i].icon;
        icon = `https://openweathermap.org/img/w/${iconCode}.png`
        temp = fiveDay[i].temp.toFixed(1);
        humid = fiveDay[i].humid;
        date = moment(fiveDay[i].date).format('D/M/YYYY');

        // HTML DOM Elements
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
            .attr('src', icon)
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
    /* End of 5 Day Forecast Display */
};

const saveSearch = (city) => {
    let copy;

    // get saved history
    let savedHistory = localStorage.getItem('weather-search');
    savedHistory = JSON.parse(savedHistory) || [];

    // IF a city was passed through as an argument AND there is no prior saved history
    // add the city to the storage array
    if (city & !savedHistory) {
        savedHistory.unshift(city);

        // ELSE IF a city was passed through
    } else if (city) {
        // iterate through the saved history
        for (let i = 0; i < savedHistory.length; i++) {
            // IF the city matches any previous searches
            // it is a copy
            if (savedHistory[i] === city) {
                copy = true;
            }
        }
        // if it is not a copy
        // add the city to the storage array
        if (!copy) {
            savedHistory.unshift(city);
        }
    }

    // save updated array to local storage
    // and display the search history on the document
    localStorage.setItem('weather-search', JSON.stringify(savedHistory));
    displaySearchHistory(savedHistory);
}

const displaySearchHistory = (savedHistory) => {
    // clear search history
    $('#search-history')
        .text('')

    // iterate through the saved history array
    // and display a DOM element with an attached event listener
    for (let i = 0; i < savedHistory.length; i++) {
        $('<button>')
            .text(savedHistory[i])
            .addClass('list-group-item text-left capitalize')
            .appendTo($('#search-history'))
            .on('click', function () {
                getWeather(savedHistory[i]);
            })
    }
}

// load search history on page load
saveSearch();