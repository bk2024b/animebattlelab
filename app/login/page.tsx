"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signInWithGoogleAction } from "@/lib/auth/actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInAction, {
    error: null,
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold">Welcome back</h1>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
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
              autoComplete="current-password"
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
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-tertiary">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form action={signInWithGoogleAction}>
          <button
            type="submit"
            className="w-full rounded-pill border border-border px-4 py-2.5 text-sm font-medium hover:border-accent/50"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
