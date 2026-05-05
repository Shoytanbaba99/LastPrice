"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      router.push("/login");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    registerMutation.mutate({ name, email, password });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="form-container">
        <div className="space-y-2 text-center">
          <h1 className="text-[1.875rem] font-light tracking-widest uppercase">
            Register
          </h1>
          <p
            className="text-[0.875rem] font-light"
            style={{ color: "var(--text-secondary)" }}
          >
            Join the silent marketplace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Name"
              className="input-minimal text-[1rem]"
              required
            />
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
            <p className="text-[0.75rem] text-red-500 text-center font-light">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={registerMutation.isPending}
            whileTap={{ scale: 0.98 }}
            className="btn-solid w-full py-3 text-[0.75rem] tracking-widest uppercase"
          >
            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </motion.button>
        </form>

        <p
          className="text-center text-[0.75rem] font-light"
          style={{ color: "var(--text-muted)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-heading)" }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
