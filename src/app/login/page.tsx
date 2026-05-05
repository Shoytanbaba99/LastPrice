"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="form-container">
        <div className="space-y-2 text-center">
          <h1 className="text-[1.875rem] font-light tracking-widest uppercase">
            Login
          </h1>
          <p
            className="text-[0.875rem] font-light"
            style={{ color: "var(--text-secondary)" }}
          >
            Enter the silent space.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="input-minimal text-[1rem]"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="input-minimal text-[1rem]"
              required
            />
          </div>

          {error && (
            <p className="text-[0.75rem] text-red-500 text-center font-light">
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="btn-solid w-full py-3 text-[0.75rem] tracking-widest uppercase"
          >
            {loading ? "Verifying..." : "Login"}
          </motion.button>
        </form>

        <p
          className="text-center text-[0.75rem] font-light"
          style={{ color: "var(--text-muted)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="underline underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-heading)" }}
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
