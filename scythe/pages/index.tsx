// import { grpc } from "@improbable-eng/grpc-web";
// import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";

// import { HelloRequest, HelloReply } from '../proto/helloworld_pb'
// import { Greeter } from '../proto/helloworld_pb_service'

// grpc.setDefaultTransport(NodeHttpTransport());

// const req = new HelloRequest();
// req.setName('World');

// grpc.invoke(Greeter.SayHello, {
//   request: req,
//   host: 'http://127.0.0.1:8080',
//   onMessage: (message: HelloReply) => {
//     console.log(message.getMessage());
//   },
//   onEnd: (code: grpc.Code, msg: string) => {
//     if (code === grpc.Code.OK) {
//       console.log(msg);
//     }
//   }
// })

import { Container, Grid, Paper, Typography, useTheme } from "@mui/material";
import type { NextPage } from "next";
import React from "react";

const Home: NextPage = () => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Container
        sx={{
          marginTop: 5,
        }}
      >
        <Paper
          sx={{
            padding: theme.spacing(3, 2),
          }}
          elevation={3}
        >
          <Typography variant="h4" align="center">
            Welcome to Reaper!
          </Typography>
          <Typography
            sx={{ mt: theme.spacing(2) }}
            variant="body1"
            align="center"
          >
            A Discussion and Forum for Aaron&apos;s Crypto Holdings
          </Typography>
        </Paper>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{
            padding: theme.spacing(3, 2),
          }}
        >
          <Grid item xs={4} sm={8} md={12}>
            <Paper
              sx={{
                padding: theme.spacing(1),
              }}
            >
              <Typography variant="h6" align="center">
                Services
              </Typography>
              <Typography variant="body1" align="center">
                I provide crypto yield farming analysis services for various
                coins and protocols across different networks.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4} sm={8} md={12}>
            <Paper
              sx={{
                padding: theme.spacing(1),
              }}
            >
              <Typography variant="h6" align="center">
                Pricing
              </Typography>
              <Typography variant="body1" align="center">
                This is a subscription based platform that allows you to use this platform and gain access to forums.
              </Typography>
              <Typography variant="body1" align="center">
                $5 USD per month
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default Home;
