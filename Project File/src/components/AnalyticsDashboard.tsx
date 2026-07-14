/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from "recharts";
import { BarChart3, TrendingUp, Compass, Table, Sparkles } from "lucide-react";
import { EmotionRecord } from "../types";

interface AnalyticsDashboardProps {
  records: EmotionRecord[];
}

const COLORS = ["#94a3b8", "#10b981", "#f59e0b", "#6366f1", "#f43f5e"];
const EMOTIONS = ["Bored", "Confident", "Confused", "Curious", "Frustrated"];

export default function AnalyticsDashboard({ records }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"emotions" | "fields" | "summary">("emotions");

  // Compute emotion distribution statistics
  const emotionPieData = useMemo(() => {
    const counts: Record<string, number> = {
      Bored: 0, Confident: 0, Confused: 0, Curious: 0, Frustrated: 0
    };

    records.forEach(rec => {
      const isMixed = rec.predictedEmotion.includes("+");
      const primary = isMixed ? rec.predictedEmotion.split(" + ")[0] : rec.predictedEmotion;
      if (counts[primary] !== undefined) {
        counts[primary]++;
      } else {
        // Fallback
        counts["Confused"]++;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [records]);

  // Compute confidence timeline chart data
  const timelineData = useMemo(() => {
    return records.map((rec, index) => {
      const isMixed = rec.predictedEmotion.includes("+");
      const primary = isMixed ? rec.predictedEmotion.split(" + ")[0] : rec.predictedEmotion;
      return {
        session: `S${index + 1}`,
        confidence: Math.round(rec.confidenceScore * 100),
        emotion: primary,
        date: new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });
  }, [records]);

  // Compute field distribution stats
  const fieldBarData = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    
    records.forEach(rec => {
      const isMixed = rec.predictedEmotion.includes("+");
      const primary = isMixed ? rec.predictedEmotion.split(" + ")[0] : rec.predictedEmotion;
      
      if (!map[rec.field]) {
        map[rec.field] = { Bored: 0, Confident: 0, Confused: 0, Curious: 0, Frustrated: 0 };
      }
      map[rec.field][primary]++;
    });

    return Object.entries(map).map(([field, counts]) => ({
      field,
      ...counts
    }));
  }, [records]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    if (records.length === 0) return { avgConfidence: 0, topEmotion: "None" };

    const totalConf = records.reduce((sum, r) => sum + r.confidenceScore, 0);
    const avgConfidence = Math.round((totalConf / records.length) * 100);

    const counts: Record<string, number> = {};
    records.forEach(r => {
      const isMixed = r.predictedEmotion.includes("+");
      const primary = isMixed ? r.predictedEmotion.split(" + ")[0] : r.predictedEmotion;
      counts[primary] = (counts[primary] || 0) + 1;
    });

    const topEmotion = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    return {
      avgConfidence,
      topEmotion
    };
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center font-sans">
        <Compass className="h-8 w-8 text-slate-300 mx-auto mb-2 animate-spin" />
        <h3 className="font-display font-bold text-slate-800">Analytics Dashboard</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
          Perform a few emotion analysis cycles to unlock beautiful timeline trend analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm font-sans space-y-6">
      {/* Tab Controls & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 pb-4 gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800">Educational Analytics Room</h3>
          <p className="text-xs text-slate-400">Class breakdowns, student timeline profiles, and statistical distribution</p>
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("emotions")}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "emotions"
                ? "bg-white text-slate-800 shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Emotions
          </button>
          <button
            onClick={() => setActiveTab("fields")}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "fields"
                ? "bg-white text-slate-800 shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Fields
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "summary"
                ? "bg-white text-slate-800 shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Table className="h-3.5 w-3.5" /> Summary
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "emotions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="border border-slate-50 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                Emotion Class Distribution
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {emotionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[EMOTIONS.indexOf(entry.name) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #f1f5f9" }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart */}
            <div className="border border-slate-50 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                Confidence Timeline (Learner's Journey)
              </span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="session" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #f1f5f9" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#c2410c" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }} 
                      name="Confidence Score (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "fields" && (
        <div className="border border-slate-50 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
            Emotions by Academic Field Breakdown
          </span>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fieldBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="field" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #f1f5f9" }}
                />
                <Legend iconType="circle" />
                {EMOTIONS.map((emo, idx) => (
                  <Bar key={emo} dataKey={emo} stackId="a" fill={COLORS[idx]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#faf9f6] p-4 border border-slate-100 rounded-xl text-center">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Total Cycles</span>
              <span className="text-2xl font-bold text-slate-800 font-display">{records.length}</span>
            </div>
            <div className="bg-[#faf9f6] p-4 border border-slate-100 rounded-xl text-center">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Avg Confidence</span>
              <span className="text-2xl font-bold text-emerald-600 font-display">{summaryStats.avgConfidence}%</span>
            </div>
            <div className="bg-[#faf9f6] p-4 border border-slate-100 rounded-xl text-center">
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Dominant Mood</span>
              <span className="text-2xl font-bold text-indigo-600 font-display capitalize">{summaryStats.topEmotion}</span>
            </div>
          </div>

          {/* Chronological Table Log */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Chronological Learning Log
            </span>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead className="bg-[#faf9f6] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Student Input</th>
                    <th className="px-4 py-2.5">Emotion</th>
                    <th className="px-4 py-2.5 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {records.map((rec) => (
                    <tr key={rec.recordId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">{rec.field}</td>
                      <td className="px-4 py-2.5 truncate max-w-xs" title={rec.inputText}>
                        "{rec.inputText}"
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] rounded font-semibold">
                          {rec.predictedEmotion}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-700">
                        {Math.round(rec.confidenceScore * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
