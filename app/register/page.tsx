"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/lib/auth/actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signUpAction, {
    error: null,
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          The detailed profile comes after — for now, just the basics.
        </p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm text-text-secondary">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="username"
              className="rounded-md border border-border bg-surface-1 px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-text-secondary">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-border bg-surface-1 px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-text-secondary">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded-md border border-border bg-surface-1 px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          {state.error && (
            <p className="text-sm text-error" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-pill bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
