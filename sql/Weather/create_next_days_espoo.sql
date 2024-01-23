-- View: public.next_days_espoo

-- DROP VIEW public.next_days_espoo;

CREATE OR REPLACE VIEW public.next_days_espoo
 AS
 SELECT all_weather_forecasts."timestamp",
    all_weather_forecasts.temperature,
    all_weather_forecasts.wind_speed,
    all_weather_forecasts.place
   FROM all_weather_forecasts
  WHERE EXTRACT(month FROM all_weather_forecasts."timestamp") = EXTRACT(month FROM now()) AND EXTRACT(day FROM all_weather_forecasts."timestamp") > EXTRACT(day FROM now()) AND (EXTRACT(hour FROM all_weather_forecasts."timestamp") % 2::numeric) = 0::numeric AND all_weather_forecasts.place::text = 'Espoo'::text
  ORDER BY all_weather_forecasts."timestamp";

ALTER TABLE public.next_days_espoo
    OWNER TO postgres;

