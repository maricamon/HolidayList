import { StrictMode } from "react";
import ReactDOM from "react-dom";
import Main from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <Main />
  </StrictMode>,
  rootElement
);
