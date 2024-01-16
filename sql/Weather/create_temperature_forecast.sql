-- Table: public.temperature_forecast

-- DROP TABLE IF EXISTS public.temperature_forecast;

CREATE TABLE IF NOT EXISTS public.temperature_forecast
(
    "timestamp" timestamp with time zone NOT NULL,
    temperature real,
    place character varying COLLATE pg_catalog."default" NOT NULL,
    time_added timestamp with time zone NOT NULL,
    CONSTRAINT temperature_forecast_pkey PRIMARY KEY (time_added, place, "timestamp")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.temperature_forecast
    OWNER to postgres;