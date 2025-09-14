import React from "react";
import { HelmetProvider } from "react-helmet-async";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkflowProvider } from "./contexts/WorkflowContext";

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <WorkflowProvider>
          <Routes />
        </WorkflowProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
