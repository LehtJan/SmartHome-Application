-- View: public.price_now_comparison_yesterday

-- DROP VIEW public.price_now_comparison_yesterday;

CREATE OR REPLACE VIEW public.price_now_comparison_yesterday
 AS
 SELECT hourly_price.price
   FROM hourly_price
  WHERE EXTRACT(day FROM hourly_price.timeslot) = EXTRACT(day FROM now()) AND EXTRACT(hour FROM hourly_price.timeslot) = EXTRACT(hour FROM now()) AND EXTRACT(year FROM hourly_price.timeslot) = EXTRACT(year FROM now()) OR EXTRACT(day FROM hourly_price.timeslot) = EXTRACT(day FROM now() - '1 day'::interval) AND EXTRACT(hour FROM hourly_price.timeslot) = EXTRACT(hour FROM now()) AND EXTRACT(year FROM hourly_price.timeslot) = EXTRACT(year FROM now());

ALTER TABLE public.price_now_comparison_yesterday
    OWNER TO postgres;
COMMENT ON VIEW public.price_now_comparison_yesterday
    IS 'This will show the current price and the price of yesterday for the same hour. Used to compare if price is now higher or lower than before.';

