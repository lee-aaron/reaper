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

const Dashboard: NextPage = () => {
  const theme = useTheme();

  // maybe some hook to signal protected route and redirect to login page

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
            Dashboard
          </Typography>
        </Paper>
      </Container>
    </React.Fragment>
  );
};

export default Dashboard;
