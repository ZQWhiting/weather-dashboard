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
