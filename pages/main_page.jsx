import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { fetchWeatherApi } from "openmeteo";

function Main_page() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("Loading...");

  useEffect(() => {
    async function getWeather(lat, lon) {
      const params = {
        latitude: lat,
        longitude: lon,
        current: ["temperature_2m", "rain", "cloud_cover"],
      };
      const url = "https://api.open-meteo.com/v1/forecast";

      try {
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const current = response.current();

        const weatherData = {
          temperature: current.variables(0)?.value() ?? null,
          rain: current.variables(1)?.value() ?? null,
          cloud_cover: current.variables(2)?.value() ?? null,
          time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        };

        setWeather(weatherData);
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    }

    async function getLocation(lat, lon) {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`
        );
        const data = await res.json();
        if (data && data.results && data.results[0]) {
          const place = data.results[0];
          setLocation(`${place.name}, ${place.country}`);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    }

    // Get browser location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        getWeather(lat, lon);
        getLocation(lat, lon);
      },
      (err) => {
        console.error(err);
        // fallback: Berlin
        getWeather(52.52, 13.41);
        setLocation("Berlin, Germany");
      }
    );
  }, []);

  return (
    <div
      className="m-0 p-0 h-screen w-screen bg-cover bg-center fixed flex items-center justify-center"
      style={{ backgroundImage: "url('../public/bg.jpg')" }}
    >
      <div className="bg-gray-700/60 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl h-auto rounded-2xl shadow-lg flex flex-col justify-center px-6 py-8">
        {/* Search Bar */}
        <div className="flex h-10 sm:h-12 md:h-14 w-full justify-center items-center">
          <input
            type="text"
            placeholder="Search city..."
            className="bg-gray-300 px-4 py-2 rounded-3xl flex-1 text-gray-700 outline-none text-sm sm:text-base md:text-lg"
          />
          <Search className="ml-2 text-gray-300 w-6 h-6 cursor-pointer" />
        </div>

        {/* Weather Info */}
        <div className="flex flex-col items-center mt-6">
          <img
            src="../public/cloud.png"
            alt="weather icon"
            className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40"
          />
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mt-4">
            {weather ? `${weather.temperature.toFixed(2)}°C` : "--°C"}
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl text-white mt-2">
            {weather
              ? weather.cloud_cover > 50
                ? "Cloudy"
                : "Clear"
              : "Loading..."}
          </h2>
          <h3 className="text-base sm:text-xl md:text-2xl text-white mt-2">
            {location}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default Main_page;
