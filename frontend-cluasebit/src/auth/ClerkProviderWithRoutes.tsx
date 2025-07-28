// src/auth/ClerkProviderWithRoutes.tsx

import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { ReactNode } from "react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk publishable key in .env");
}

interface Props {
  children: ReactNode;
}

const ClerkProviderWithRoutes: React.FC<Props> = ({ children }) => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>{children}</BrowserRouter>
    </ClerkProvider>
  );
};

export default ClerkProviderWithRoutes;
