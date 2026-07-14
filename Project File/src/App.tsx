/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, EmotionRecord, PredictionResult } from "./types";
import Navbar from "./components/Navbar";
import AuthScreen from "./components/AuthScreen";
import Sidebar from "./components/Sidebar";
import ProblemInput from "./components/ProblemInput";
import ComparisonCards from "./components/ComparisonCards";
import AnalysisDetails from "./components/AnalysisDetails";
import ResponseView from "./components/ResponseView";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { Compass } from "lucide-react";

const DEFAULT_GUEST_USER: User = {
  email: "student@example.com",
  name: "Learner",
  role: "student",
  loginCount: 1,
  createdAt: new Date().toISOString()
};

export default function App() {
  const [user, setUser] = useState<User>(DEFAULT_GUEST_USER);
  const [records, setRecords] = useState<EmotionRecord[]>([]);
  const [csvCount, setCsvCount] = useState<number>(0);
  const [activeRecord, setActiveRecord] = useState<EmotionRecord | null>(null);
  const [comparison, setComparison] = useState<{
    BiLSTM: PredictionResult;
    BERT: PredictionResult;
  } | null>(null);

  // App settings state
  const [modelUsed, setModelUsed] = useState<"BiLSTM" | "BERT">("BERT");
  const [aiResponseToggled, setAiResponseToggled] = useState<boolean>(true);
  const [displayDetails, setDisplayDetails] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  // Check if user session already exists in localStorage or load default
  useEffect(() => {
    const cachedUser = localStorage.getItem("ai_learning_user");
    let currentUser = DEFAULT_GUEST_USER;
    if (cachedUser) {
      try {
        currentUser = JSON.parse(cachedUser);
      } catch {
        localStorage.removeItem("ai_learning_user");
      }
    } else {
      localStorage.setItem("ai_learning_user", JSON.stringify(DEFAULT_GUEST_USER));
    }
    setUser(currentUser);
    fetchUserHistory(currentUser.email);
    fetchCSVStats();
  }, []);

  // Fetch record history for authenticated user
  const fetchUserHistory = async (email: string) => {
    try {
      const res = await fetch(`/api/records?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        // Set the most recent record as active initially if available
        if (data.records && data.records.length > 0) {
          const sorted = [...data.records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setActiveRecord(sorted[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  // Fetch total CSV logs stats
  const fetchCSVStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setCsvCount(data.count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch CSV stats:", err);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    localStorage.setItem("ai_learning_user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    fetchUserHistory(authenticatedUser.email);
    fetchCSVStats();
  };

  const handleLogout = () => {
    localStorage.removeItem("ai_learning_user");
    localStorage.setItem("ai_learning_user", JSON.stringify(DEFAULT_GUEST_USER));
    setUser(DEFAULT_GUEST_USER);
    setRecords([]);
    setActiveRecord(null);
    setComparison(null);
    fetchUserHistory(DEFAULT_GUEST_USER.email);
    fetchCSVStats();
  };

  const handleClearHistory = async () => {
    if (!user) return;
    const confirmClear = window.confirm("Are you sure you want to clear your entire learning history? This will remove all logs.");
    if (!confirmClear) return;

    try {
      const res = await fetch("/api/records/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });

      if (res.ok) {
        setRecords([]);
        setActiveRecord(null);
        setComparison(null);
        fetchCSVStats();
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  // Perform core emotion prediction and learning helper analysis
  const handleAnalyze = async (params: {
    field: string;
    inputText: string;
    modelUsed: "BiLSTM" | "BERT";
    aiResponseToggled: boolean;
  }) => {
    if (!user) return;
    setAnalyzing(true);
    setComparison(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          ...params
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze emotional response");
      }

      // Prepend or append new record
      setRecords(prev => [...prev, data.activeRecord]);
      setActiveRecord(data.activeRecord);
      setComparison(data.comparison);
      fetchCSVStats();
    } catch (err: any) {
      alert(`Error during analysis: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Selecting historical records to display in details
  const handleSelectRecord = (selectedRec: EmotionRecord) => {
    setActiveRecord(selectedRec);
    
    // Simulate re-running classifier locally for sequence views on historical records
    const simulateComparison = async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user?.email,
            field: selectedRec.field,
            inputText: selectedRec.inputText,
            modelUsed: selectedRec.modelUsed,
            aiResponseToggled: false
          })
        });
        if (res.ok) {
          const data = await res.json();
          setComparison(data.comparison);
        }
      } catch (err) {
        console.error("Failed to load scoring comparison for history item:", err);
      }
    };
    simulateComparison();
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans text-slate-800">
      {/* Navbar header */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Sidebar Navigation & Metrics */}
        <Sidebar 
          user={user} 
          records={records} 
          csvCount={csvCount}
          onLogout={handleLogout}
          onClearHistory={handleClearHistory}
          onSelectRecord={handleSelectRecord}
        />

        {/* Primary Content Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
          
          {/* Welcome Alert / Info Banner */}
          <div className="bg-[#1e293b] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-950 shadow-md">
            <div>
              <span className="text-orange-300 font-bold uppercase tracking-wider text-[10px] block mb-1">Empathetic Co-Pilot Mode</span>
              <h2 className="text-xl font-bold font-display text-[#fed7aa]">Hello, {user.name}!</h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                Feeling confused, curious, or frustrated is standard when mastering complex subjects. Describe what you're studying, and we'll analyze your emotion using deep learning models to deliver personalized educational guidance.
              </p>
            </div>
            <div className="shrink-0 p-3 bg-slate-800/80 rounded-xl border border-slate-700 font-mono text-[11px] text-orange-200">
              Role: <span className="font-bold text-white uppercase">{user.role}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Column 1: Input Desk */}
            <div className="space-y-6">
              <ProblemInput 
                onAnalyze={handleAnalyze} 
                loading={analyzing}
                modelUsed={modelUsed}
                setModelUsed={setModelUsed}
                aiResponseToggled={aiResponseToggled}
                setAiResponseToggled={setAiResponseToggled}
                displayDetails={displayDetails}
                setDisplayDetails={setDisplayDetails}
              />

              {/* If comparison values exist, render neural progress bars */}
              {comparison && (
                <ComparisonCards 
                  comparison={comparison} 
                  activeModel={activeRecord?.modelUsed || modelUsed} 
                />
              )}
            </div>

            {/* Column 2: AI Assistance & Core Sequences */}
            <div className="space-y-6">
              {activeRecord ? (
                <>
                  <ResponseView record={activeRecord} />
                  
                  {displayDetails && comparison && (
                    <AnalysisDetails 
                      result={activeRecord.modelUsed === "BiLSTM" ? comparison.BiLSTM : comparison.BERT} 
                    />
                  )}
                </>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center h-full min-h-[300px]">
                  <Compass className="h-10 w-10 text-slate-300 mb-3 animate-pulse" />
                  <h3 className="font-display font-bold text-slate-700">Awaiting Student Input</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Describe your learning challenge on the left panel to trigger the emotion analysis models and AI guidance system.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Section: Analytics Dashboard */}
          <AnalyticsDashboard records={records} />

        </main>
      </div>
    </div>
  );
}
