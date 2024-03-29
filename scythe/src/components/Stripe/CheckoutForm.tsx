import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import {
  PaymentElement,
  useElements,
  useStripe
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../state/hooks";
import { ClearSecret } from "../../state/stripe/action";

const CheckoutForm: React.FC<{}> = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [message, setMessage] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onBeforeUnload = () => {
      dispatch(ClearSecret(router.query.prod_id as string));
    }
    router.events.on("routeChangeStart", onBeforeUnload);
    return () => {
      router.events.off("routeChangeStart", onBeforeUnload);
    }
  }, [message, dispatch, router.events, router.query.prod_id]);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent) {
        switch (paymentIntent.status) {
          case "succeeded":
            setMessage("Payment succeeded!");
            break;
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: window.location.href,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <React.Fragment>
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" />
        <Box display="flex" justifyContent="flex-end" alignItems="flex-end">
          <LoadingButton
            loading={isLoading}
            disabled={isLoading || !stripe || !elements}
            size="small"
            type="submit"
            variant="outlined"
            sx={{ mt: 1, minWidth: 100 }}
          >
            Pay Now
          </LoadingButton>
        </Box>
        {/* Show any error or success messages */}
        {message && (
          <Box
            id="payment-message"
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Typography variant="body1">{message}</Typography>
          </Box>
        )}
      </form>
    </React.Fragment>
  );
};

export default CheckoutForm;
