-- View: public.highest_price_today

-- DROP VIEW public.highest_price_today;

CREATE OR REPLACE VIEW public.highest_price_today
 AS
 SELECT prices_today.price,
    prices_today.timeslot
   FROM prices_today
  ORDER BY prices_today.price DESC
 LIMIT 1;

ALTER TABLE public.highest_price_today
    OWNER TO postgres;

