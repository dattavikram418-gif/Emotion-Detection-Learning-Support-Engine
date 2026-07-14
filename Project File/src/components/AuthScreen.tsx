/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, GraduationCap, Lock, Mail, User as UserIcon } from "lucide-react";
import { User, UserRole } from "../types";

interface AuthScreenProps {
  onSuccess: (user: User) => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin 
      ? { email, password } 
      : { email, name, role, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1e293b] text-white shadow-md"
        >
          <GraduationCap className="h-6 w-6 text-[#fed7aa]" />
        </motion.div>
        
        <h2 className="mt-6 text-center font-display text-3xl font-bold tracking-tight text-[#1e293b]">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="mt-2 text-center text-sm text-[#64748b]">
          Emotion-Aware Educational Support with BiLSTM & BERT
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white py-8 px-4 shadow-sm border border-slate-100 rounded-2xl sm:px-10"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                <div className="text-sm font-medium text-red-800">{error}</div>
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-[#faf9f6] focus:outline-none focus:ring-2 focus:ring-[#1e293b] focus:border-transparent text-[#1e293b]"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                    Your Role
                  </label>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {(["student", "educator", "admin"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-3 text-xs border rounded-lg font-medium capitalize transition-colors ${
                          role === r
                            ? "bg-[#1e293b] border-[#1e293b] text-white"
                            : "bg-[#faf9f6] border-slate-200 text-[#475569] hover:bg-slate-50"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-[#faf9f6] focus:outline-none focus:ring-2 focus:ring-[#1e293b] focus:border-transparent text-[#1e293b]"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-[#faf9f6] focus:outline-none focus:ring-2 focus:ring-[#1e293b] focus:border-transparent text-[#1e293b]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#1e293b] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-1">
                    <Sparkles className="animate-spin h-4 w-4" /> Working...
                  </span>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#64748b]">
              {isLogin ? "New to the platform?" : "Already have an account?"}
            </span>{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-medium text-[#c2410c] hover:underline"
            >
              {isLogin ? "Register Now" : "Login"}
            </button>
          </div>

          {/* Quick Info Credentials Banner */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-500 mb-1">Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
              <div>
                <p className="font-medium">Student</p>
                <p>student@example.com</p>
              </div>
              <div>
                <p className="font-medium">Educator</p>
                <p>educator@example.com</p>
              </div>
            </div>
            <p className="mt-2 text-[10px]">Password: <span className="font-mono">password123</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
