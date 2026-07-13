"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"renter" | "landlord">("renter");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        role,
      });
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display font-800 text-3xl mb-2">Create your account</h1>
      <p className="text-white/50 mb-8">Save listings, message hosts, or list your own room.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
        />
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
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-transparent border border-panelborder rounded-lg px-4 py-3 text-sm placeholder:text-white/40 focus:border-gold outline-none"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRole("renter")}
            className={`flex-1 rounded-lg py-3 text-sm border ${
              role === "renter" ? "gold-btn border-transparent" : "outline-btn"
            }`}
          >
            I&apos;m renting
          </button>
          <button
            type="button"
            onClick={() => setRole("landlord")}
            className={`flex-1 rounded-lg py-3 text-sm border ${
              role === "landlord" ? "gold-btn border-transparent" : "outline-btn"
            }`}
          >
            I&apos;m listing a room
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="gold-btn rounded-lg py-3 font-medium disabled:opacity-60">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-white/50 text-sm mt-6">
        Already have an account?{" "}
        <Link href="/signin" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
