class Weather_app_class {
    constructor(api_key) {
        this.api_key = api_key;
        this.current_weather_url = "https://api.openweathermap.org/data/2.5/weather?q={location}&appid={key}&units=metric";
        this.forecast_url = "https://api.openweathermap.org/data/2.5/forecast?q={location}&appid={key}&units=metric";
        //Getting weather icon from openweathermap
        this.icon_url = "https://openweathermap.org/img/wn/{icon}@2x.png";
        //Replacing {key} with correct api key
        this.current_weather_url = this.current_weather_url.replace("{key}", this.api_key);
        this.forecast_url = this.forecast_url.replace("{key}", this.api_key);
        this.current_weather = null;
        this.forecast_weather = null;
        this.weather_containers = document.querySelector('#weather_containers');
        //Clearing city input field after searching for weather
        document.querySelector("#city_input").value = "";
    }

    get_current_weather(location) {
        //Replacing {location} with given location
        const query_url = this.current_weather_url.replace("{location}", location);
        const xml_request = new XMLHttpRequest();
        xml_request.onload = () => {
            //Parsing JSON response
            this.current_weather = JSON.parse(xml_request.responseText);
            this.append_weather_block();
        }
        //Sending asynchronous request
        xml_request.open("GET", query_url, true);
        xml_request.send();
    }

    async get_forecast(location) {
        const forecast_url = this.forecast_url.replace("{location}", location);
        //Asynchronous request
        const response = await fetch(forecast_url);
        const forecast = await response.json();
        this.forecast_weather = forecast.list;
        this.append_weather_block();
    }

    //Setting current weather and forecast for given location
    load_weather_results(location) {
        this.get_current_weather(location);
        this.get_forecast(location);
    }

    //Adding single weather block to the whole forecast
    append_weather_block() {
        //Clearing previous weather data
        this.weather_containers.innerHTML = '';
        const city_div = document.createElement("div");
        city_div.className = "city_div";
        city_div.textContent = `${this.current_weather.name}, ${this.current_weather.sys.country}`;
        this.weather_containers.appendChild(city_div);

        //Adding current weather
        if (this.current_weather) {
            //Converting unix timestamp since 01.01.1970 to date
            //*1000 because constructor expects timestamp in milliseconds
            const weather_date = new Date(this.current_weather.dt * 1000);
            const formatted_date = `${weather_date.toLocaleDateString("pl-PL")} ${weather_date.toLocaleTimeString("pl-PL")}`;
            const temp = this.current_weather.main.temp;
            const temp_feels_like = this.current_weather.main.feels_like;
            const icon = this.current_weather.weather[0].icon;
            const weather_description = this.current_weather.weather[0].description;
            //Change temperature to one decimal place
            const weather_div = this.create_weather_div(formatted_date, temp.toFixed(1), temp_feels_like.toFixed(1), icon, weather_description);
            this.weather_containers.appendChild(weather_div);
        }

        //Adding forecast weather
        if (this.forecast_weather) {
            for (let forecast of this.forecast_weather) {
                const weather_date = new Date(forecast.dt * 1000);
                const formatted_date = `${weather_date.toLocaleDateString("pl-PL")} ${weather_date.toLocaleTimeString("pl-PL")}`;
                const temp = forecast.main.temp;
                const temp_feels_like = forecast.main.feels_like;
                const icon = forecast.weather[0].icon;
                const weather_description = forecast.weather[0].description;

                const weather_div = this.create_weather_div(formatted_date, temp.toFixed(1), temp_feels_like.toFixed(1), icon, weather_description);
                this.weather_containers.appendChild(weather_div);
            }
        }
    }

    //Creating single weather block
    create_weather_div(date, temp, temp_feels_like, icon, desc) {
        const weather_div = document.createElement("div");
        weather_div.className = "weather_details";

        const date_div = document.createElement("div");
        date_div.className = "weather_date";
        date_div.textContent = date;
        weather_div.appendChild(date_div);

        const temp_div = document.createElement("div");
        temp_div.className = "weather-temp";
        temp_div.innerHTML = `${temp} &deg;C`;
        weather_div.appendChild(temp_div);

        const feels_like_div = document.createElement("div");
        feels_like_div.className = "weather_feels_like";
        feels_like_div.innerHTML = `Feels like: ${temp_feels_like} &deg;C`;
        weather_div.appendChild(feels_like_div);

        const weather_icon = document.createElement("img");
        weather_icon.className = "weather_icon";
        weather_icon.src = this.icon_url.replace("{icon}", icon);
        weather_div.appendChild(weather_icon);

        const description_div = document.createElement("div");
        description_div.className = "weather_description";
        description_div.textContent = desc;
        weather_div.appendChild(description_div);

        //Changing display style to flex which makes div visible
        weather_div.style.display = "flex";
        return weather_div;
    }
}

document.querySelector("#get_weather_button").addEventListener("click", () => {
    const location = document.querySelector("#city_input").value;
    //Starting weather app only if location is not empty
    if (location) {
        const weather_app_instance = new Weather_app_class("1ae2e48a0770066c42717998f06d6783");
        weather_app_instance.load_weather_results(location);
    }
});

//Clearing city input field after page reload
document.querySelector("#city_input").value = "";