SELECT all_weather_forecasts."timestamp",
    all_weather_forecasts.temperature,
    all_weather_forecasts.wind_speed,
    all_weather_forecasts.place
FROM all_weather_forecasts
WHERE date(all_weather_forecasts."timestamp") > current_date AND (EXTRACT(hour FROM all_weather_forecasts."timestamp") % 2::numeric) = 0::numeric AND all_weather_forecasts.place = 'Espoo'
ORDER BY all_weather_forecasts."timestamp";