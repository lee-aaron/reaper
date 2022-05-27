import { useTheme } from "@mui/material";
import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

const Payment: React.FC<{}> = () => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <h1>Payment</h1>
      {/* <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements> */}
    </React.Fragment>
  );
};

export default Payment;
