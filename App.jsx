
import React, { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { example_backend } from 'declarations/example_backend';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState(null);

  const authClientPromise = AuthClient.create();

  const signIn = async () => {
    const authClient = await authClientPromise;

    const internetIdentityUrl = import.meta.env.PROD
      ? undefined
      : `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;

    await new Promise((resolve) => {
      authClient.login({
        identityProvider: internetIdentityUrl,
        onSuccess: () => resolve(undefined),
      });
    });

    const identity = authClient.getIdentity();
    updateIdentity(identity);
    setIsLoggedIn(true);
  };

  const signOut = async () => {
    const authClient = await authClientPromise;
    await authClient.logout();
    updateIdentity(null);
    setIsLoggedIn(false);
  };

  const updateIdentity = (identity) => {
    if (identity) {
      setPrincipal(identity.getPrincipal());
      Actor.agentOf(example_backend).replaceIdentity(identity);
    } else {
      setPrincipal(null);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const authClient = await authClientPromise;
      const isAuthenticated = await authClient.isAuthenticated();
      setIsLoggedIn(isAuthenticated);
      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        updateIdentity(identity);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <main>
      <h1>Welcome to Internet Identity Example</h1>
      {isLoggedIn ? (
        <>
          <p>Welcome back, {principal ? principal.toString() : "User"}!</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={signIn}>Sign In</button>
      )}
    </main>
  );
}

export default App;
