-- View: public.all_weather_observations

-- DROP VIEW public.all_weather_observations;

CREATE OR REPLACE VIEW public.all_weather_observations
 AS
 SELECT t."timestamp",
    t.temperature,
    wd.wind_direction,
    ws.wind_speed,
    t.place
   FROM temperature_observation t
     JOIN wind_direction_observation wd ON t."timestamp" = wd."timestamp" AND t.place::text = wd.place::text
     JOIN wind_speed_observation ws ON t."timestamp" = ws."timestamp" AND t.place::text = ws.place::text
  ORDER BY t."timestamp" DESC;

ALTER TABLE public.all_weather_observations
    OWNER TO postgres;

