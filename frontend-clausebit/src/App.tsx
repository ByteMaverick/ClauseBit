// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ClerkProviderWithRoutes from "./auth/ClerkProviderWithRoutes.tsx";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import ClauseBitDashboard from "./pages/ClauseBitDashboard";
import AuthenticationPage from "src/auth/AuthenticationPage.tsx";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import TermsAndConditions from "./pages/TermsAndConditions";

const App: React.FC = () => {
  return (
    <ClerkProviderWithRoutes>
      <Routes>
        {/* Public auth pages */}
        <Route path="/sign-in/*" element={<AuthenticationPage />} />
        <Route path="/sign-up/*" element={<AuthenticationPage />} />

        {/* Routes using layout */}
        <Route
          path="/"
          element={
            <Layout title="ClauseBit">
              <Home />
            </Layout>
          }
        />
          {/* Terms and Conditions page */}
        <Route
          path="/terms"
          element={
            <Layout title="Terms and Conditions - ClauseBit">
              <TermsAndConditions />
            </Layout>
          }
        />

        {/* Protected dashboard route */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <ClauseBitDashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ClerkProviderWithRoutes>
  );
};

export default App;
