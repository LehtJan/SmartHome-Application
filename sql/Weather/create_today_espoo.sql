-- View: public.today_espoo

-- DROP VIEW public.today_espoo;

CREATE OR REPLACE VIEW public.today_espoo
 AS
 SELECT weather_today.day,
    weather_today.hour,
    weather_today.temperature,
    weather_today.humidity,
    weather_today.precipitation1h,
    weather_today.wind_direction,
    weather_today.wind_speed,
    weather_today.place
   FROM weather_today
  WHERE weather_today.place::text = 'Espoo'::text AND weather_today.day = EXTRACT(day FROM now());

ALTER TABLE public.today_espoo
    OWNER TO postgres;

