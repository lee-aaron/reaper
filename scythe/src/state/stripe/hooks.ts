import { useAppSelector } from "../hooks";

export function useStripe() {
  const stripe = useAppSelector((state) => state.stripe);
  return stripe;
}
