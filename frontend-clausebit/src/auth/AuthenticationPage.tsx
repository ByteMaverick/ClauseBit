import React, { useEffect } from "react";
import { SignIn, SignUp, SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";

const AuthenticationPage: React.FC = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  // Optional: redirect signed-in users who manually visit /sign-in or /sign-up
  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="flex-1 px-4 py-10 flex justify-center">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
              <span className="text-black">ClauseBit</span>
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Sign in to personalize your privacy experience
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
            <SignedOut>
              <SignIn routing="path" path="/sign-in" afterSignInUrl="/dashboard" />
              <div className="my-4 border-t border-gray-200" />
              <SignUp routing="path" path="/sign-up" afterSignUpUrl="/dashboard" />
            </SignedOut>

            <SignedIn>
              <div className="text-center text-green-600 font-medium">
                You are already signed in. Redirecting...
              </div>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* 🔻 Footer */}
      <footer className="text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} ClauseBit. All rights reserved.
        <span className="mx-2">|</span>
        <Link to="/" className="underline text-gray-500 hover:text-blue-700">
          Home
        </Link>
      </footer>
    </div>
  );
};

export default AuthenticationPage;
