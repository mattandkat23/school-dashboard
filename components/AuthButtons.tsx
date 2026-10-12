"use client";

import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-lg bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 transition"
    >
      Sign in with Google
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 transition"
    >
      Sign out
    </button>
  );
}

export function ReconnectButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="rounded-lg bg-amber-600 px-4 py-2 text-white font-medium hover:bg-amber-700 transition"
    >
      Reconnect Google account
    </button>
  );
}
