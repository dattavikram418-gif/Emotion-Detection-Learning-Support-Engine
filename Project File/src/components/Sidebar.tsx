/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  User as UserIcon, 
  Trash2, 
  Layers, 
  Activity, 
  LogOut, 
  History, 
  FileSpreadsheet,
  Database
} from "lucide-react";
import { User, EmotionRecord } from "../types";

interface SidebarProps {
  user: User;
  records: EmotionRecord[];
  csvCount: number;
  onLogout: () => void;
  onClearHistory: () => void;
  onSelectRecord: (record: EmotionRecord) => void;
}

export default function Sidebar({
  user,
  records,
  csvCount,
  onLogout,
  onClearHistory,
  onSelectRecord
}: SidebarProps) {
  const lastThree = records.slice(-3).reverse();

  return (
    <div className="w-full lg:w-80 bg-white border-r border-slate-100 flex flex-col h-full font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-50 flex items-center gap-3">
        <div className="p-2 bg-[#1e293b] rounded-xl text-[#fed7aa] shadow-sm">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-[#1e293b]">AI Learning</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Assistant Core</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="p-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm uppercase">
            {user.name.slice(0, 2)}
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-sm text-slate-800 truncate">{user.name}</h3>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            {user.role}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="bg-[#faf9f6] p-2 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Logins</span>
            <span className="text-sm font-bold text-[#1e293b]">{user.loginCount}</span>
          </div>
          <div className="bg-[#faf9f6] p-2 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Joined</span>
            <span className="text-sm font-bold text-[#1e293b]">{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="p-6 border-b border-slate-50 flex-1 overflow-y-auto space-y-6">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Analytics Feed</h4>
          <div className="space-y-3">
            {/* Total Records */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Total Interactions</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{records.length}</span>
            </div>

            {/* CSV Logs logged */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-slate-600">CSV Analytics Logs</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                {csvCount} logged
              </span>
            </div>
          </div>
        </div>

        {/* History Quick-view */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <History className="h-3 w.3" /> Recent Sessions
            </h4>
            {records.length > 0 && (
              <button 
                onClick={onClearHistory}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Clear Session History"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {lastThree.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-[#faf9f6]">
              <p className="text-xs text-slate-400">No session history yet.</p>
              <p className="text-[10px] text-slate-300 mt-1">Submit a problem to start logging.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lastThree.map((rec) => {
                const isMixed = rec.predictedEmotion.includes("+");
                // Find primary emotion name
                const mainEmotion = isMixed ? rec.predictedEmotion.split(" + ")[0] : rec.predictedEmotion;
                
                // Color mappings
                const colors: Record<string, string> = {
                  Bored: "bg-gray-100 text-gray-700 border-gray-200",
                  Confident: "bg-emerald-50 text-emerald-700 border-emerald-100",
                  Confused: "bg-amber-50 text-amber-700 border-amber-100",
                  Curious: "bg-indigo-50 text-indigo-700 border-indigo-100",
                  Frustrated: "bg-rose-50 text-rose-700 border-rose-100"
                };
                const colClass = colors[mainEmotion] || "bg-slate-50 text-slate-700";

                return (
                  <button
                    key={rec.recordId}
                    onClick={() => onSelectRecord(rec)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-[#faf9f6] transition-all flex items-start gap-2.5 group"
                  >
                    <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${colClass}`}>
                      {rec.predictedEmotion}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-slate-700 truncate capitalize group-hover:text-[#c2410c]">{rec.field}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">"{rec.inputText}"</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Logout Row */}
      <div className="p-6 border-t border-slate-50 bg-[#faf9f6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Standard DB Schema</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 font-semibold transition-colors"
          title="Reset back to default workspace"
        >
          <LogOut className="h-3.5 w-3.5" /> Reset Session
        </button>
      </div>
    </div>
  );
}
