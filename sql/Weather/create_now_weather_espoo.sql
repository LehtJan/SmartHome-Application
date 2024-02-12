-- View: public.now_weather_espoo

-- DROP VIEW public.now_weather_espoo;

CREATE OR REPLACE VIEW public.now_weather_espoo
 AS
 SELECT today_espoo.day,
    today_espoo.hour,
    today_espoo.temperature,
    today_espoo.humidity,
    today_espoo.precipitation1h,
    today_espoo.wind_direction,
    today_espoo.wind_speed,
    today_espoo.place
   FROM today_espoo
  WHERE today_espoo.hour = EXTRACT(hour FROM now());

ALTER TABLE public.now_weather_espoo
    OWNER TO postgres;

