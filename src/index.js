import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import App from "./App";

const theme = extendTheme({
  colors: {
    coorsGreen: {
      50: "#f4f7e6",
      100: "#e2e3cb",
      200: "#cfd0ae",
      300: "#bcbd8e",
      400: "#a9aa6f",
      500: "#909156",
      600: "#707142",
      700: "#50502e",
      800: "#303019",
      900: "#111100",
    },
    coorsBlue: {
      50: "#e7f2ff",
      100: "#c4d5ee",
      200: "#a0b9de",
      300: "#7b9dd0",
      400: "#5781c2",
      500: "#3e68a9",
      600: "#305184",
      700: "#213a5f",
      800: "#12233b",
      900: "#020c19",
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
