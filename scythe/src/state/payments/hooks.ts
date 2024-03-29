import { useAppSelector } from "../hooks";

export function useOwner() {
  const owner = useAppSelector((state) => state.payments.owner);
  return owner;
}

export function useCustomer() {
  const customer = useAppSelector((state) => state.payments.cus);
  return customer;
}

export function useSubscription() {
  const subscription = useAppSelector((state) => state.payments.sub);
  return subscription;
}

export function useRoles() {
  const roles = useAppSelector((state) => state.payments.roles);
  return roles;
}

export function useProduct() {
  const prod = useAppSelector((state) => state.payments.prod);
  return prod;
}
