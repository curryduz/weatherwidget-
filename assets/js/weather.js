$( document ).ready(function() {
    const searches = [];
    const keys = Object.keys(localStorage);
    console.log(searches);
    let i = keys.length;

    while (i--) {
        searches.push(localStorage.getItem(keys[i]));
    }

    jQuery.each(searches, function(index, value) {
        $('.saved-searches').append(`
            <li>` + value + `</li>
        `);
    });

    const button = $('button');
    const listItem = $('.saved-searches li');

    $('input').keyup(function() {
        $('button').prop('disabled', false);
    });

    button.add(listItem).click(function(e) {
        e.preventDefault();
        $(".five-day").empty();

        $('.main-landing').addClass('hidden');
        $('.dashboard').removeClass('hidden');

        const target= $(e.target);
        let city;

        if (target.is(':button') || target.is('i')) {
            city = $('input').val();
        } else if (target.is('li')) {
            city = target[0].innerHTML;
        }

        if (city === undefined || city === '') {
            return;
        }

        localStorage.setItem('city-' + city, city);

        const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=c2a1f6a8ab689e2fe8baffb9baf0d523";
        getWeather(weatherUrl);
    });

    function getWeather(weatherUrl) {
        $.ajax({
            method: "GET",
            url: weatherUrl,
            data: 'json',
            success: (response) => {
                const icon = response.weather[0].icon;
                const iconurl = "https://openweathermap.org/img/w/" + icon + ".png";
                const timestamp = response.dt;
                const date = new Date(timestamp * 1000);
                const month = (date.getMonth() + 1);
                const day = (date.getDate());
                const year = (date.getFullYear());
                const currentDay = month + '/' + day + '/' + year;

                $(".city").html(response.name + ' ' + currentDay + "<img src=" + iconurl + ">");
                $(".temp").html("Temperature: " + response.main.temp + " &#8457");
                $(".humidity").html("Humidity: " + response.main.humidity + "%");
                $(".wind-speed").html("Wind Speed: " + response.wind.speed);

                const lat = response.coord.lat;
                const lon = response.coord.lon;
                const uvUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=c2a1f6a8ab689e2fe8baffb9baf0d523";
                const fiveDayUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly,minutely&units=imperial&appid=c2a1f6a8ab689e2fe8baffb9baf0d523"

                $.ajax({
                    method: "GET",
                    url: uvUrl,
                    data: 'json',
                    success: (response) => {
                        $(".uv").html("UV Index: <span>" + response.value + "</span>");

                        if (response.value < 3) {
                            $(".uv span").addClass('low');
                        } else if (response.value > 2 && response.value < 6) {
                            $(".uv span").addClass('moderate');
                        } else if (response.value > 5) {
                            $(".uv span").addClass('high');
                        }
                    }
                });

                $.ajax({
                    method: "GET",
                    url: fiveDayUrl,
                    data: 'json',
                    success: (response) => {
                        const forecastDays = response.daily;

                        jQuery.each(forecastDays, function(index, value) {
                            const forecastTimestamp = value.dt;
                            const forecastDate = new Date(forecastTimestamp * 1000);
                            const forecastMonth = (forecastDate.getMonth() + 1);
                            const forecastDay = (forecastDate.getDate());
                            const forecastYear = (forecastDate.getFullYear());
                            const formattedDay = forecastMonth + '/' + forecastDay + '/' + forecastYear;

                            const temp = value.temp.day;
                            const humidity = value.humidity;
                            const weather = value.weather[0].icon;

                            if (index < 6 && index > 0) {
                                $(".five-day").append(`
                                    <li>
                                        <p>` + formattedDay + `</p>
                                        <img src="https://openweathermap.org/img/w/` + weather + `.png"/>
                                        <p>Temp: ` + temp + ` &#8457</p>
                                        <p>Humidity: ` + humidity + `%</p>
                                    </li>
                                `);
                            }
                        });
                    }
                });
            }
        });
    }

});
