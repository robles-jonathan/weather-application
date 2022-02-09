$(document).ready(function () {
    "use strict";
    mapboxgl.accessToken = MAPBOX_KEY;

    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [0, 0],
        zoom: 10, // starting zoom
        logoPosition: 'top-left'
    });

    //CREATE MARKER to be manipulated throughout the code
    const marker = new mapboxgl.Marker({
        draggable: true
    })

    function reveresSearch(lng, lat){
        reverseGeocode({lng, lat}, MAPBOX_KEY).then(function(results) {
            $("#city").empty();
            var split = results.split(",");
            var city = split[1];
            $('#city').append("Current City: " + city)
        });
    }

    initializeMapAndWeather();
    createPin();//INITIALIZE createPin() FUNCTION
    movePinToLocation();
    map.addControl(new mapboxgl.NavigationControl());//ADDS NAVIGATION CONTROLS

    function initializeMapAndWeather(){
        var lat = 29.5311973;
        var lon = -98.4705371;
        marker.setLngLat([lon,lat]).addTo(map);
        map.setCenter([lon,lat]);
        getWeatherInfo(lat,lon);
        reveresSearch(lon, lat);
    }

    function createPin(){
        map.on('click', (e) => {
            var lat = e.lngLat.lat;
            var lon = e.lngLat.lng;
            marker.setLngLat(e.lngLat).addTo(map);
            map.setCenter([lon,lat]);
            getWeatherInfo(lat, lon);
            reveresSearch(lon, lat)
        });
    }

    function movePinToLocation(){
        // Centers Map to Address entered by user
        $('#submit-address').click(function(){
            var address = $('#address').val();
            geocode(address, MAPBOX_KEY).then(function (results) {
                var lat = results[1];
                var lon = results[0];
                // console.log("lat: " + lat + " \n lon: " + lon)
                marker.setLngLat([results[0],results[1]]).addTo(map);
                map.setCenter([results[0],results[1]]);
                getWeatherInfo(lat,lon);
                reveresSearch(lon, lat);
            });
            $('#address').val('');
            // $('.addressSubmit').css('display','none');
            console.log("im trying to remove input")
        })
    }


    // DISPLAYS LngLat when marker has stopped dragging inside map
    function onDragEnd() {
        const lngLat = marker.getLngLat();
        var lng = lngLat.lng;
        var lat = lngLat.lat;
        map.setCenter([lng,lat]);
        getWeatherInfo(lat, lng);
        reveresSearch(lng, lat);
    }
    marker.on('dragend', onDragEnd);


    function getWeatherInfo(lat, lon) {
        $("#card").empty();
        $('#current-temp').empty();
        $.get("https://api.openweathermap.org/data/2.5/onecall", {
            lat: lat,
            lon: lon,
            exclude: ["minutely", "hourly"],
            units: "imperial",
            appid: OPEN_WEATHER_KEY
        }).done(function (data) {

            console.log(data)
            var dailyArray = data.daily.slice(0,5);
            console.log(dailyArray)
            var currentDegrees = data.current.temp
            console.log(currentDegrees)
            $('#current-temp').append("Current Temp: " + currentDegrees + "&deg;F")

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ForEACH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
            dailyArray.forEach((element, index, array) => {
                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DATE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
                // how to get the date
                var forEachDate = new Date(array[index].dt * 1000).toDateString().split(" ");
                /*
                    forEachDate = ['Fri', 'Dec', '03', '2021', '16:13:04', 'GMT-0600', '(Central', 'Standard', 'Time)']
                 */
                var date = forEachDate[1] + "-" + forEachDate[2] + "-" + forEachDate[3];

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DEGREES~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
                var minDegrees = array[index].temp.min;
                var maxDegrees = array[index].temp.max;
                var degrees = '<strong>' + minDegrees + '&deg;F  /  ' + maxDegrees + '&deg;F</strong>';

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ICONS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
                var iconLocation = array[index].weather[0].icon
                var icon = '<img src="http://openweathermap.org/img/w/' + iconLocation + '.png" alt="weather icon"/>'

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DESCRIPTION~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
                var descriptionLocation = array[index].weather[0].description
                var description = '<strong>' + descriptionLocation + '</strong>'

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~HUMIDITY~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
                var humidityLocation = array[index].humidity
                var humidity = 'Humidity: <strong>' + humidityLocation + '%</strong>'

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~WIND~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
                var windLocation = array[index].wind_speed
                var wind = 'Wind: <strong>' + windLocation + ' mph</strong>'

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~PRESSURE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
                var pressureLocation = array[index].pressure
                var pressure = 'Pressure: <strong>' + pressureLocation + ' mbar</strong>'

                //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~INITIALIZING CARD~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
                const card =
                    `<div class="card" style="width: 18rem;">
                    <h5 class="card-header text-uppercase text-center">${date}</h5>
                    <div class="card-body">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item text-uppercase text-center">${degrees}</li>
                        <li class="list-group-item text-uppercase text-center">${icon}</li>
                        <li class="list-group-item text-uppercase text-center">${description}</li>
                        <li class="list-group-item text-uppercase text-center">${humidity}</li>
                        <li class="list-group-item text-uppercase text-center">${wind}</li>
                        <li class="list-group-item text-uppercase text-center">${pressure}</li>
                      </ul>
                  </div>
                </div>`
                const ele = document.createElement('div');
                ele.innerHTML = card;
                document.querySelector('#card').appendChild(ele.firstChild);
            })
        })
    }
})

