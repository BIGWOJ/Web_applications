const search_city = document.getElementById('search_city');

search_city.addEventListener('change', search_request);

function search_request() {
    const city = search_city.value;
    const response = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=1ae2e48a0770066c42717998f06d6783&units=metric`;

    fetch(response)
        .then(response => response.json())
        .then(data => {
            document.getElementById('city').innerHTML = data.name;
            document.getElementById('temperature').innerHTML = `<p>${data.main.temp} °C</p>`;
            document.getElementById('description').innerHTML = `${data.weather[0].description}\n`;
            //document.getElementById('icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        })
        .catch(error => console.error('Error:', error));
}