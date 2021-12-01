import { useEffect, useState } from "react";
import "./App.css";

const options = {
  weekday: "short",
  // year: "numeric",
  month: "short",
  day: "numeric",
};

function App() {
  const [position, setPosition] = useState();
  const [nearByCities, setNearByCities] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [selectedSearchCityOption, setSelectedSearchCityOption] = useState();
  const [weather, setWeather] = useState();
  const [isSearchLocation, setIsSearchLocation] = useState(false);
  const [isCelcius, setIsCelcius] = useState(true);

  const geoSuccess = function (position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    console.log("Latitude: ", lat, " Longitude: ", long);
    setPosition({
      latitude: lat,
      longitude: long,
    });
  };

  const geoFail = function () {
    console.log("Unable to retrieve your location");
  };

  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) {
      console.log("Geolocation is not supported by your browser");
    } else {
      geo.getCurrentPosition(geoSuccess, geoFail);
    }
  }, []);

  useEffect(() => {
    async function fetchNearByLocations() {
      try {
        const searchLoactionAPI = `https://www.metaweather.com/api/location/search/?lattlong=${position.latitude},${position.longitude}`;
        const nearbyLocations = await (await fetch(searchLoactionAPI)).json();
        const cities = nearbyLocations
          .filter((e) => e.location_type === "City")
          .map((c) => ({ name: c.title, woeid: c.woeid }));
        setSelectedCity(cities[0]);
        setNearByCities(cities);
      } catch (error) {
        console.log(error);
      }
    }
    if (position) fetchNearByLocations();
  }, [position]);

  useEffect(() => {
    async function getWeather() {
      try {
        const getWeatherAPI = `https://www.metaweather.com/api/location/${selectedCity.woeid}/`;
        const weather = await (await fetch(getWeatherAPI)).json();
        console.log(weather);
        setWeather(weather.consolidated_weather);
      } catch (error) {
        console.log(error);
      }
    }
    if (selectedCity) getWeather();
  }, [selectedCity]);

  return (
    <div className="App">
      <div className="sidebar">
        {isSearchLocation ? (
          <div className="search-location-container">
            <div className="search-location-header">
              <span
                className="material-icons close-button"
                onClick={() => setIsSearchLocation(false)}
              >
                close
              </span>
            </div>
            <div className="search-box">
              {/* <select
                id="search-cities"
                className="select-input"
                onChange={(e) => {
                  console.log(e.target.value);
                  setSelectedSearchCityOption(e.target.value);
                }}
              >
                {nearByCities.map((city) => (
                  <option value={city.woeid} key={city.woeid}>
                    {city.name}
                  </option>
                ))}
              </select> */}
            </div>
          </div>
        ) : (
          <div className="today-weather-container">
            <div className="sidebar-header">
              <div className="search-locations">
                <button
                  id="search-location-button"
                  className="search-locations-button"
                  onClick={() => setIsSearchLocation(true)}
                >
                  Search for places
                </button>
                <div
                  className="icon-container"
                  onClick={() =>
                    navigator.geolocation.getCurrentPosition(
                      geoSuccess,
                      geoFail
                    )
                  }
                >
                  <span className="material-icons">my_location</span>
                </div>
              </div>
            </div>
            <div className="sidebar-sky-wrapper">
              <div className="sidebar-sky"></div>
              <div className="image-container">
                {weather ? (
                  <img
                    src={`https://www.metaweather.com//static/img/weather/${weather[0].weather_state_abbr}.svg`}
                    alt="weather"
                  ></img>
                ) : null}
              </div>
            </div>
            {weather ? (
              <div>
                <div className="temp-today">
                  <span>{`${Math.round(weather[0].the_temp)}`}</span>
                  <span className="temp-unit">{isCelcius ? "°C" : "°F"}</span>
                </div>
                <div className="weather-state-name">
                  {weather[0].weather_state_name}
                </div>
                <div className="date-container">
                  <div>Today</div>
                  <div className="date">
                    {new Date(weather[0].applicable_date).toLocaleDateString(
                      "en-GB",
                      options
                    )}
                  </div>
                </div>
                <div className="location-container">
                  <span className="material-icons">location_on</span>
                  <span className="location-name">{selectedCity.name}</span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
