import React, { useState } from "react";
import { Search } from "lucide-react";
import { fetchWeatherApi } from "openmeteo";
import { CloudSunRain, CloudHail, ThermometerSun } from "lucide-react";
function Main_page() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("");

  // 🔍 Fetch weather for searched city
  async function getWeather(city) {
    try {
      // Step 1: get lat/lon from city name
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setLocation("Location not found");
        setWeather(null);
        return;
      }

      const place = geoData.results[0];
      const lat = place.latitude;
      const lon = place.longitude;

      setLocation(`${place.name}, ${place.country}`);

      // Step 2: get weather for lat/lon
      const params = {
        latitude: lat,
        longitude: lon,
        current: ["temperature_2m", "cloud_cover"],
      };
      const url = "https://api.open-meteo.com/v1/forecast";

      const responses = await fetchWeatherApi(url, params);
      const response = responses[0];
      const utcOffsetSeconds = response.utcOffsetSeconds();
      const current = response.current();

      const weatherData = {
        temperature: current.variables(0)?.value() ?? null,
        cloud_cover: current.variables(1)?.value() ?? null,
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      };

      setWeather(weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() !== "") {
      getWeather(query);
    }
  };

  return (
    <div
      className="m-0 p-0 h-screen w-screen bg-cover bg-center fixed flex items-center justify-center"
      style={{ backgroundImage: "url('../public/bg.jpg')" }}
    >
      <div className="bg-gray-700/60 w-[40%] h-[60%] rounded-2xl shadow-lg flex flex-col items-center px-6 py-6">
        {/* 🔍 Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex h-12 w-full max-w-md items-center"
        >
          <input
            type="text"
            placeholder="Enter city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-gray-300 px-4 py-2 rounded-3xl flex-1 text-gray-700 outline-none"
          />
          <button type="submit">
            <Search className="ml-2 text-gray-300 w-6 h-6 cursor-pointer" />
          </button>
        </form>

        {/* 🌤️ Weather Info */}
        <div className="flex flex-col items-center mt-6">
          {weather && weather.temperature > 30 ? (
            <CloudSunRain className="w-32 h-32" />
          ) : weather && weather.temperature < 30 ? (
            <CloudHail className="w-32 h-32" />
          ) : (
            <ThermometerSun className="w-32 h-32" />
          )}
          <h1 className="text-6xl font-bold text-white mt-4">
            {weather ? `${weather.temperature.toFixed(2)}°C` : "--°C"}
          </h1>
          <h2 className="text-2xl text-white mt-2">
            {weather
              ? weather.cloud_cover > 50
                ? "Cloudy"
                : "Clear"
              : "Waiting..."}
          </h2>
          <h3 className="text-xl text-white mt-2">{location}</h3>
        </div>
      </div>
    </div>
  );
}

export default Main_page;
