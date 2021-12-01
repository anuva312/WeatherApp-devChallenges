import { useEffect, useState } from "react";
import "./App.css";

const options = {
  weekday: "short",
  month: "short",
  day: "numeric",
};

const convertToFarenheit = function (celcius) {
  return celcius * 1.8 + 32;
};

function App() {
  const [position, setPosition] = useState();
  const [nearByCities, setNearByCities] = useState();
  const [selectedCity, setSelectedCity] = useState();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedSearchCityOption, setSelectedSearchCityOption] = useState();
  const [isEmpty, setIsEmpty] = useState(false);
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

  const handleClose = function () {
    setShowOptions(false);
    setIsSearchLocation(false);
    setIsEmpty(false);
    setSelectedSearchCityOption(null);
  };

  const handleSelectLocation = function () {
    if (selectedSearchCityOption) {
      setSelectedCity(selectedSearchCityOption);
      setSelectedSearchCityOption(null);
      setIsSearchLocation(false);
      setShowOptions(false);
    } else {
      setIsEmpty(true);
    }
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
        setNearByCities(cities.slice(1));
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
                onClick={() => handleClose()}
              >
                close
              </span>
            </div>
            <div className="search-box">
              <div className="select-location-container">
                <button
                  id="search-cities"
                  className="select-location-button"
                  onClick={() => {
                    setShowOptions(true);
                  }}
                >
                  {selectedSearchCityOption ? (
                    <span className="selected-option">
                      {selectedSearchCityOption.name}
                    </span>
                  ) : (
                    <div className="select-button-contents">
                      <span className="material-icons">search</span>
                      <span className="placeholder"> search nearby cities</span>
                    </div>
                  )}
                </button>
                <button
                  className="search-button"
                  onClick={() => handleSelectLocation()}
                >
                  Search
                </button>
              </div>
              {isEmpty ? <div className="error">Select a location</div> : null}
            </div>

            {showOptions
              ? nearByCities.map((city) => (
                  <div
                    id={`option_${city.woeid}`}
                    key={city.woeid}
                    className="select-location-options"
                    onClick={() => {
                      setSelectedSearchCityOption(city);
                      setIsEmpty(false);
                    }}
                  >
                    {city.name}
                  </div>
                ))
              : null}
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
                  <span>{`${
                    isCelcius
                      ? Math.round(weather[0].the_temp)
                      : Math.round(convertToFarenheit(weather[0].the_temp))
                  }`}</span>
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
      <div className="main-content">
        <div className="header">
          <div
            className={`temp-unit-selector ${isCelcius ? "selected" : ""}`}
            onClick={() => setIsCelcius(true)}
          >
            <span>°C</span>
          </div>
          <div
            className={`temp-unit-selector ${isCelcius ? "" : "selected"}`}
            onClick={() => setIsCelcius(false)}
          >
            <span>°F</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
