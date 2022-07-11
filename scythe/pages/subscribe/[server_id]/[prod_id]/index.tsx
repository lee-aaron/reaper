import { Container } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";
import CustomerForm from "../../../../src/components/Customer/form";
import SubscriptionCard from "../../../../src/components/Subscription/SubscriptionCard";
import { useIsAuthenticated } from "../../../../src/state/authentication/hooks";
import { useCustomer } from "../../../../src/state/payments/hooks";

const SubscribePage: React.FC<{}> = () => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const cus = useCustomer();

  if (!isAuthenticated) {
    router.push("/login");
  }

  return (
    <React.Fragment>
      <Container sx={{ mt: 1 }}>
        {!cus.user_created ? <CustomerForm /> : <SubscriptionCard />}
      </Container>
    </React.Fragment>
  );
};

export default SubscribePage;
