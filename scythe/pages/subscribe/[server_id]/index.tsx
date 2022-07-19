import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Loading from "../../../src/components/Loading";
import { useIsAuthenticated } from "../../../src/state/authentication/hooks";

interface Products {
  price_id: string;
  prod_id: string;
  sub_price: number;
  sub_name: string;
  sub_description: string;
  server_id: string;
  name: string;
}

const SubscribePage: React.FC<{}> = () => {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const [loading, setLoading] = useState(true);
  const [prods, setProds] = useState<Array<Products>>([]);
  const theme = useTheme();

  if (!isAuthenticated) {
    router.push("/login");
  }

  useEffect(() => {
    if (!router.query.server_id) return;

    // use server_id
    let url = new URL("/api/v1/search_product", window.location.origin);
    url.searchParams.append("server_id", router.query.server_id as string);

    fetch(url.toString())
      .then((res) => res.json())
      .then((res) => {
        setProds(res);
        setLoading(false);
      });
  }, [router.query.server_id, router.isReady]);

  if (loading) {
    return <Loading />;
  }

  if (prods.length === 0) {
    return (
      <React.Fragment>
        <Container sx={{ mt: 1 }}>
          <Grid
            container
            sx={{
              padding: theme.spacing(3, 2),
              justifyContent: "center",
            }}
          >
            <Typography variant="h4">No products found</Typography>
          </Grid>
        </Container>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Container sx={{ mt: 1 }}>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            padding: theme.spacing(3, 2),
            justifyContent: "center",
          }}
        >
          {prods.map((prod) => (
            <Grid key={prod.prod_id} item xs={4} sm={4} md={3}>
              <Tooltip
                title="Click to be redirected to the subscription page"
                arrow
              >
                <Card
                  sx={{ maxWidth: 340, padding: "1rem", my: "1rem" }}
                  onClick={() => {
                    router.push({
                      pathname: `/subscribe/${prod.server_id}/${prod.prod_id}`,
                    });
                  }}
                >
                  <CardHeader title={prod.sub_name} />
                  <CardContent>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      component="p"
                    >
                      {prod.sub_description}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      component="p"
                    >
                      {prod.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                    >
                      ${prod.sub_price} / month
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default SubscribePage;
