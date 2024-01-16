-- Table: public.precipitation1h_forecast

-- DROP TABLE IF EXISTS public.precipitation1h_forecast;

CREATE TABLE IF NOT EXISTS public.precipitation1h_forecast
(
    "timestamp" timestamp with time zone NOT NULL,
    precipitation1h real,
    place character varying(80) COLLATE pg_catalog."default" NOT NULL,
    time_added timestamp with time zone NOT NULL,
    CONSTRAINT precipitation1h_forecast_pkey PRIMARY KEY (time_added, place, "timestamp")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.precipitation1h_forecast
    OWNER to postgres;