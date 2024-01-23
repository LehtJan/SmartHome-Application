-- View: public.lowest_price_today

-- DROP VIEW public.lowest_price_today;

CREATE OR REPLACE VIEW public.lowest_price_today
 AS
 SELECT prices_today.price,
    prices_today.timeslot
   FROM prices_today
  ORDER BY prices_today.price
 LIMIT 1;

ALTER TABLE public.lowest_price_today
    OWNER TO postgres;

