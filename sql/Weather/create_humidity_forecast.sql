-- Table: public.humidity_forecast

-- DROP TABLE IF EXISTS public.humidity_forecast;

CREATE TABLE IF NOT EXISTS public.humidity_forecast
(
    "timestamp" timestamp with time zone NOT NULL,
    humidity real,
    place character varying(80) COLLATE pg_catalog."default" NOT NULL,
    time_added timestamp with time zone NOT NULL,
    CONSTRAINT humidity_forecast_pkey PRIMARY KEY (time_added, place, "timestamp")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.humidity_forecast
    OWNER to postgres;