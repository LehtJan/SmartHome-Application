-- Table: public.wind_direction_forecast

-- DROP TABLE IF EXISTS public.wind_direction_forecast;

CREATE TABLE IF NOT EXISTS public.wind_direction_forecast
(
    "timestamp" timestamp with time zone NOT NULL,
    wind_direction real,
    place character varying(80) COLLATE pg_catalog."default" NOT NULL,
    time_added timestamp with time zone NOT NULL,
    CONSTRAINT wind_direction_forecast_pkey PRIMARY KEY (time_added, place, "timestamp")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.wind_direction_forecast
    OWNER to postgres;