-- View: public.hourly_page

-- DROP VIEW public.hourly_page;

CREATE OR REPLACE VIEW public.hourly_page
 AS
 SELECT EXTRACT(day FROM hourly_price.timeslot) AS day,
    EXTRACT(hour FROM hourly_price.timeslot) AS hour,
    hourly_price.price
   FROM hourly_price
  WHERE hourly_price.timeslot >= date_trunc('hour'::text, now())
  ORDER BY (EXTRACT(day FROM hourly_price.timeslot)), (EXTRACT(hour FROM hourly_price.timeslot));

ALTER TABLE public.hourly_page
    OWNER TO postgres;

