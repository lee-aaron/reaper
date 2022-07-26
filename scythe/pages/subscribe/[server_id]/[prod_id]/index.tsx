import { Container } from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React from "react";
import { useIsAuthenticated } from "../../../../src/state/authentication/hooks";
import { useCustomer } from "../../../../src/state/payments/hooks";
const CustomerForm = dynamic(
  () => import("../../../../src/components/Customer/form")
);
const SubscriptionCard = dynamic(
  () => import("../../../../src/components/Subscription/SubscriptionCard")
);

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
