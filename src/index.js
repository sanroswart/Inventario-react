import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

// Crear usuario por defecto si no existe
if (!localStorage.getItem("registeredUser")) {
  localStorage.setItem(
    "registeredUser",
    JSON.stringify({
      username: "admin",
      password: "1234",
    })
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
