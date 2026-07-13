"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
  }

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display font-800 text-3xl mb-2">Welcome back</h1>
      <p className="text-white/50 mb-8">Sign in to manage bookings and saved listings.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="gold-btn rounded-lg py-3 font-medium disabled:opacity-60">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-white/50 text-sm mt-6">
        No account yet?{" "}
        <Link href="/signup" className="text-gold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
