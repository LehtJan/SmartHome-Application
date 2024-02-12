-- Table: public.weather_station

-- DROP TABLE IF EXISTS public.weather_station;

CREATE TABLE IF NOT EXISTS public.weather_station
(
    place character varying(80) COLLATE pg_catalog."default" NOT NULL,
    fmi_sid character varying COLLATE pg_catalog."default",
    lat real,
    lon real,
    CONSTRAINT weather_station_pkey PRIMARY KEY (place)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.weather_station
    OWNER to postgres;