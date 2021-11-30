import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [position, setPosition] = useState();
  const [nearByCities, setNearByCities] = useState();
  const [selectedCity, setSelectedCity] = useState();

  const geoSuccess = function (position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log("Latitude: ", latitude, " Longitude: ", longitude);
    setPosition({
      latitude,
      longitude,
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
        setSelectedCity(cities[0].woeid);
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
        const getWeatherAPI = `https://www.metaweather.com/api/location/${selectedCity}/`;
        const weather = await (await fetch(getWeatherAPI)).json();
        console.log(weather);
      } catch (error) {
        console.log(error);
      }
    }
    if (selectedCity) getWeather();
  }, [selectedCity]);

  return <div className="App">Hello World!</div>;
}

export default App;