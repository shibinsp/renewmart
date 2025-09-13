import React from "react";
import { HelmetProvider } from "react-helmet-async";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
