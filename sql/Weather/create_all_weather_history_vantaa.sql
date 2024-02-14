SELECT 
  date(timestamp),
  AVG(temperature) as temperature,
  AVG(wind_speed) as wind_speed,
  AVG(price) as price,
  place
FROM 
  all_weather_forecasts
  JOIN hourly_price ON all_weather_forecasts.timestamp = hourly_price.timeslot
WHERE date(timestamp) < current_date
	AND place = 'Vantaa'
GROUP BY 
  date(timestamp), place;