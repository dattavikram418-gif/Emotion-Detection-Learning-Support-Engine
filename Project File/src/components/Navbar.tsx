/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { GraduationCap, ShieldAlert, BadgeInfo } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-100 py-4 px-6 flex items-center justify-between font-sans shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#1e293b] text-[#fed7aa] rounded-xl shadow-md">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-lg text-[#1e293b] tracking-tight leading-none">
            AI Learning Assistant
          </h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            BiLSTM vs BERT Emotion Engine
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Server Active Flag */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Active Gemini Server API</span>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-800 leading-none">{user.name}</span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{user.role} workspace</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
