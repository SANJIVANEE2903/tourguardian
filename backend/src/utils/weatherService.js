const axios = require('axios');
const { pool } = require('../config/db');

// Weathercode mapping for human-readable severe descriptions
function getWeatherDescription(code) {
  if (code >= 95) return 'Severe Thunderstorm / Hail';
  if (code >= 80) return 'Heavy Rain Showers';
  if (code >= 71) return 'Snow / Freezing Conditions';
  if (code >= 61) return 'Heavy Rainfall';
  if (code >= 51) return 'Moderate Rain & Drizzle';
  return 'Stormy Conditions';
}

async function checkAndWarnSevereWeather(userId, destination, startDate, endDate) {
  try {
    if (!destination || !userId) return null;

    // 1. Geocode destination using Open-Meteo Geocoding API
    const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: destination, count: 1 },
      timeout: 5000
    });

    if (!geoRes.data || !geoRes.data.results || geoRes.data.results.length === 0) {
      console.log(`Weather warning: Could not geocode destination "${destination}"`);
      return null;
    }

    const { latitude: lat, longitude: lng, name: locName } = geoRes.data.results[0];

    // 2. Query forecast using Open-Meteo Forecast API
    const forecastRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max',
        timezone: 'auto'
      },
      timeout: 5000
    });

    const daily = forecastRes.data?.daily;
    if (!daily || !daily.time) return null;

    // 3. Evaluate daily forecast for severe weather conditions
    const warnings = [];
    for (let i = 0; i < daily.time.length; i++) {
      const code = daily.weathercode[i];
      const precip = daily.precipitation_sum[i];
      const tempMax = daily.temperature_2m_max[i];
      const wind = daily.windspeed_10m_max[i];
      const dateStr = daily.time[i];

      if (code >= 51 || precip > 15) {
        warnings.push(`${getWeatherDescription(code)} on ${dateStr} (${precip}mm rain)`);
      } else if (tempMax > 38) {
        warnings.push(`Extreme Heat (${tempMax}°C) on ${dateStr}`);
      } else if (wind > 40) {
        warnings.push(`High Winds (${wind} km/h) on ${dateStr}`);
      }
    }

    // 4. Create notification if severe weather predicted
    if (warnings.length > 0) {
      const summaryMsg = `Severe weather alert for ${locName || destination}: ${warnings.slice(0, 2).join('; ')}. Stay prepared and follow local safety advisories.`;
      
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "weather_warning")',
        [userId, `⚠️ Severe Weather Warning: ${destination}`, summaryMsg]
      );

      console.log(`✅ Weather warning notification issued to user ${userId} for ${destination}`);
      return { hasWarning: true, warnings, summary: summaryMsg };
    }

    return { hasWarning: false };
  } catch (err) {
    console.warn(`Weather API check skipped/failed for ${destination}:`, err.message);
    return null; // Graceful non-blocking fallback
  }
}

module.exports = { checkAndWarnSevereWeather };
