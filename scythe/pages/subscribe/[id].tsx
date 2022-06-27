import { Container } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import CustomerForm from "../../src/components/Customer/form";
import CheckoutForm from "../../src/components/Stripe/CheckoutForm";
import SubscriptionCard from "../../src/components/Subscription/SubscriptionCard";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";
import { useCustomer } from "../../src/state/payments/hooks";

const SubscribePage: React.FC<{}> = () => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const cus = useCustomer();

  if (!isAuthenticated) {
    router.push("/login");
  }

  let [stripePromise, setStripePromise] = React.useState(loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || ""));

  useEffect(() => {
    setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "", {
      stripeAccount: cus.prod_id[router.query.prod_id as string]
    }));
  }, [cus.prod_id[router.query.prod_id as string]]);


  return (
    <React.Fragment>
      <Container sx={{ mt: 1 }}>
        {!cus.id ? (
          <CustomerForm />
        ) : !cus.secret[router.query.prod_id as string] ? (
          <SubscriptionCard />
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: cus.secret[router.query.prod_id as string] || "",
              appearance: {
                theme: 'stripe'
              }
            }}
          >
            <CheckoutForm />
          </Elements>
        )}
      </Container>
    </React.Fragment>
  );
};

export default SubscribePage;
