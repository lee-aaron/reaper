import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useIsAuthenticated } from "../../src/state/authentication/hooks";
import { useCustomer } from "../../src/state/payments/hooks";

interface CustomerSubscriptions {
  portalUrl: string;
  subscription_name: string;
  subscription_description: string;
}

const Dashboard: NextPage = () => {
  const theme = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const cus = useCustomer();
  const [subs, setSubs] = React.useState<Array<CustomerSubscriptions>>([]);

  if (!isAuthenticated) {
    router.push("/login");
  }

  useEffect(() => {
    // fetch customer portal url
    // should be a map of prod id to customer id; temporarily use all keys in customer prod_id
    let promises = Object.keys(cus.id).map(async (cus_id: string) => {
      let portalUrl = new URL("/api/v1/create_portal", window.location.origin);
      portalUrl.searchParams.append("customer_id", cus_id);
      portalUrl.searchParams.append("return_url", window.location.href);
      portalUrl.searchParams.append("server_id", cus.id[cus_id].server_id);

      // fetch subscription info
      const subscriptionUrl = new URL(
        "/api/v1/search_subscription",
        window.location.origin
      );
      subscriptionUrl.searchParams.append("prod_id", cus.id[cus_id].prod_id);
      const res = await fetch(subscriptionUrl.toString()).then(res => res.json());
      
      return { 
        portalUrl: portalUrl.toString(),
        subscription_name: res.subscription_name,
        subscription_description: res.subscription_description,
      }
    });

    Promise.all(promises).then((res) => {
      setSubs((prev) => {
        if (prev.filter(p => p.portalUrl === res[0].portalUrl).length === 0) {
          return [...prev, ...res];
        }
        return prev;
      })
    })
  }, [cus.id]);

  return (
    <React.Fragment>
      <Container
        sx={{
          marginTop: 5,
        }}
        maxWidth="xl"
      >
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
          }}
          elevation={3}
        >
          <Typography variant="h4" align="center">
            Dashboard
          </Typography>
        </Paper>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            py: theme.spacing(2),
          }}
        >
          {subs.map((sub: CustomerSubscriptions) => (
            <Grid item>
              <Card>
                <CardHeader title={sub.subscription_name} />
                <CardContent>
                  <Typography variant="subtitle1">
                    {sub.subscription_description}
                  </Typography>
                  <Typography variant="body2">
                    View your invoices here
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    onClick={() => {
                      window.location.href = sub.portalUrl;
                    }}
                  >
                    Click to be redirected
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Dashboard;
