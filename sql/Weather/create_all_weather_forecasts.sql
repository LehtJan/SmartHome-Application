-- View: public.all_weather_forecasts

-- DROP VIEW public.all_weather_forecasts;

CREATE OR REPLACE VIEW public.all_weather_forecasts
 AS
 WITH temperature AS (
         SELECT temperature_forecast."timestamp",
            temperature_forecast.temperature,
            temperature_forecast.place,
            temperature_forecast.time_added,
            row_number() OVER (PARTITION BY temperature_forecast."timestamp", temperature_forecast.place ORDER BY temperature_forecast.time_added DESC) AS rn
           FROM temperature_forecast
        ), humidity AS (
         SELECT humidity_forecast."timestamp",
            humidity_forecast.humidity,
            humidity_forecast.place,
            humidity_forecast.time_added,
            row_number() OVER (PARTITION BY humidity_forecast."timestamp", humidity_forecast.place ORDER BY humidity_forecast.time_added DESC) AS rn
           FROM humidity_forecast
        ), precipitation1h AS (
         SELECT precipitation1h_forecast."timestamp",
            precipitation1h_forecast.precipitation1h,
            precipitation1h_forecast.place,
            precipitation1h_forecast.time_added,
            row_number() OVER (PARTITION BY precipitation1h_forecast."timestamp", precipitation1h_forecast.place ORDER BY precipitation1h_forecast.time_added DESC) AS rn
           FROM precipitation1h_forecast
        ), wind_direction AS (
         SELECT wind_direction_forecast."timestamp",
            wind_direction_forecast.wind_direction,
            wind_direction_forecast.place,
            wind_direction_forecast.time_added,
            row_number() OVER (PARTITION BY wind_direction_forecast."timestamp", wind_direction_forecast.place ORDER BY wind_direction_forecast.time_added DESC) AS rn
           FROM wind_direction_forecast
        ), wind_speed AS (
         SELECT wind_speed_forecast."timestamp",
            wind_speed_forecast.wind_speed,
            wind_speed_forecast.place,
            wind_speed_forecast.time_added,
            row_number() OVER (PARTITION BY wind_speed_forecast."timestamp", wind_speed_forecast.place ORDER BY wind_speed_forecast.time_added DESC) AS rn
           FROM wind_speed_forecast
        )
 SELECT t."timestamp",
    t.temperature,
    h.humidity,
    p.precipitation1h,
    wd.wind_direction,
    ws.wind_speed,
    t.place
   FROM temperature t
     JOIN humidity h ON t."timestamp" = h."timestamp" AND t.place::text = h.place::text AND t.rn = h.rn
     JOIN precipitation1h p ON t."timestamp" = p."timestamp" AND t.place::text = p.place::text AND t.rn = p.rn
     JOIN wind_direction wd ON t."timestamp" = wd."timestamp" AND t.place::text = wd.place::text AND t.rn = wd.rn
     JOIN wind_speed ws ON t."timestamp" = ws."timestamp" AND t.place::text = ws.place::text AND t.rn = ws.rn
  WHERE t.rn = 1
  ORDER BY t.place, t."timestamp" DESC;

ALTER TABLE public.all_weather_forecasts
    OWNER TO postgres;

