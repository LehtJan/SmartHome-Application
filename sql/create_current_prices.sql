-- View: public.current_prices

-- DROP VIEW public.current_prices;

CREATE OR REPLACE VIEW public.current_prices
 AS
 SELECT hourly_price.timeslot,
    hourly_price.price
   FROM hourly_price
  WHERE hourly_price.timeslot >= date_trunc('hour'::text, now())
  ORDER BY hourly_price.timeslot;

ALTER TABLE public.current_prices
    OWNER TO postgres;
COMMENT ON VIEW public.current_prices
    IS 'Shows electricity prices from now on';

