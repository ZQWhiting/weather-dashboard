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
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    // make a request to the url
    fetch(apiUrl)
        .then(function (response) {
            // request was successful
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data, city);
                });
            } else {
                alert(`Error: ${response.statusText}`);
            }
        })
        .catch(function (error) {
            alert(`Unable to connect to OpenWeather`);
        });
};