import { useAppSelector } from "../hooks";

export function useOwner() {
  const owner = useAppSelector((state) => state.payments.owner);
  return owner;
}