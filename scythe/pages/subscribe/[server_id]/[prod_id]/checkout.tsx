import { Container, Paper } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Loading from "../../../../src/components/Loading";
import CheckoutForm from "../../../../src/components/Stripe/CheckoutForm";
import { useIsAuthenticated } from "../../../../src/state/authentication/hooks";
import { useStripe } from "../../../../src/state/stripe/hooks";
import { useIsDarkMode } from "../../../../src/state/user/hooks";

const Payment: React.FC<{}> = () => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const stripe = useStripe();
  const darkMode = useIsDarkMode();

  if (!isAuthenticated) {
    router.push("/login");
  }

  let [stripePromise, setStripePromise] = React.useState(
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "")
  );

  useEffect(() => {
    setStripePromise(
      loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "", {
        stripeAccount: stripe.prod_id[router.query.prod_id as string],
      })
    );
  }, [stripe.prod_id[router.query.prod_id as string]]);

  return (
    <React.Fragment>
      <Container sx={{ mt: 2 }}>
        {stripe.loading === "loading" ||
        !stripe.secret[router.query.prod_id as string] ? (
          <Loading />
        ) : (
          <Paper sx={{
            padding: 3,
          }}>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret:
                  stripe.secret[router.query.prod_id as string] || "",
                appearance: {
                  theme: darkMode ? "night" : "stripe",
                },
              }}
            >
              <CheckoutForm />
            </Elements>
          </Paper>
        )}
      </Container>
    </React.Fragment>
  );
};

export default Payment;
