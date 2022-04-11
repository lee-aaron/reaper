import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as grpcWeb from 'grpc-web';

import { HelloRequest, HelloReply } from './proto/helloworld_pb';
import { GreeterClient } from './proto/HelloworldServiceClientPb';

var client = new GreeterClient('http://localhost:8080');

var request = new HelloRequest();
request.setName("World");

function App() {

  client.sayHello(request, {"Accept": "application/grpc-web"}, (err: grpcWeb.RpcError, response: HelloReply) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(response.getMessage());
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
