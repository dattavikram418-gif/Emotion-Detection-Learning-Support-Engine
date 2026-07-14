/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Settings, HelpCircle, RefreshCw } from "lucide-react";

interface ProblemInputProps {
  onAnalyze: (params: {
    field: string;
    inputText: string;
    modelUsed: "BiLSTM" | "BERT";
    aiResponseToggled: boolean;
  }) => void;
  loading: boolean;
  modelUsed: "BiLSTM" | "BERT";
  setModelUsed: (m: "BiLSTM" | "BERT") => void;
  aiResponseToggled: boolean;
  setAiResponseToggled: (b: boolean) => void;
  displayDetails: boolean;
  setDisplayDetails: (b: boolean) => void;
}

const FIELDS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Literature",
  "History",
  "Engineering",
  "Medicine & Health",
  "Business & Economics",
  "Art & Design"
];

// Placeholder cues based on selected academic field
const FIELD_PLACEHOLDERS: Record<string, string> = {
  "Computer Science": "Explain the compilation error, segfault, logic bug, or data structure roadblock you're hitting (e.g. 'My binary search loop is infinite and doesn't converge...').",
  "Mathematics": "Describe the mathematical formula, proof, derivative, or algebraic equation causing difficulty (e.g. 'I don't understand how to apply the Chain Rule to this composite limit...').",
  "Physics": "Describe the kinematics, thermodynamic, or electromagnetic problem (e.g. 'Calculating the angular momentum of a rotating sphere with variable density is confusing me...').",
  "Chemistry": "State the chemical reaction, stoichiometry balance, or organic synthesis challenge (e.g. 'I keep getting the wrong molar ratios when balancing the combustion products...').",
  "Biology": "Detail the cellular processes, genetics, or evolutionary pathways causing roadblocks (e.g. 'Distinguishing the phases of meiosis II is confusing...').",
  "Literature": "Identify the critical analysis, text comprehension, or essay prompt difficulty.",
  "History": "Outline the historical period, analysis, or timeline confusion.",
  "Engineering": "Describe the structural, electrical, or systems design block.",
  "Medicine & Health": "Describe the anatomical, clinical, or biochemical concept roadblocks.",
  "Business & Economics": "Explain the microeconomic graph, statistical model, or financial problem.",
  "Art & Design": "Detail the aesthetic concept, structural form, or perspective roadblock."
};

const DEFAULT_PLACEHOLDER = "Enter details about the topic or homework problem you are struggling with...";

export default function ProblemInput({
  onAnalyze,
  loading,
  modelUsed,
  setModelUsed,
  aiResponseToggled,
  setAiResponseToggled,
  displayDetails,
  setDisplayDetails
}: ProblemInputProps) {
  const [field, setField] = useState("");
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const placeholder = FIELD_PLACEHOLDERS[field] || DEFAULT_PLACEHOLDER;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!field) {
      setError("Please select an academic field first.");
      return;
    }

    if (!inputText.trim()) {
      setError("Please describe the problem you're struggling with.");
      return;
    }

    onAnalyze({
      field,
      inputText: inputText.trim(),
      modelUsed,
      aiResponseToggled
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm font-sans">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-800">Learning Problem Desk</h3>
          <p className="text-xs text-slate-400">Select your discipline and describe the roadblock</p>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl border transition-all ${
            showSettings 
              ? "bg-[#1e293b] border-[#1e293b] text-white" 
              : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
          }`}
          title="Pipeline Config"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 bg-[#faf9f6] border border-slate-100 rounded-xl space-y-4 text-xs">
          <div className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Pipeline Engine Controls</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Classifier Engine */}
            <div>
              <span className="block font-semibold text-slate-700 mb-1.5">Primary Classifier Model</span>
              <div className="flex gap-2">
                {(["BiLSTM", "BERT"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModelUsed(m)}
                    className={`flex-1 py-1.5 px-3 border rounded-lg font-semibold transition-colors ${
                      modelUsed === m
                        ? "bg-[#1e293b] text-white border-[#1e293b]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom parameters */}
            <div className="space-y-2">
              <span className="block font-semibold text-slate-700">Analysis Features</span>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiResponseToggled}
                    onChange={(e) => setAiResponseToggled(e.target.checked)}
                    className="rounded text-[#c2410c] focus:ring-[#c2410c] h-3.5 w-3.5 border-slate-300"
                  />
                  <span className="text-slate-600">Gemini 2.5 Flash Response</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={displayDetails}
                    onChange={(e) => setDisplayDetails(e.target.checked)}
                    className="rounded text-[#c2410c] focus:ring-[#c2410c] h-3.5 w-3.5 border-slate-300"
                  />
                  <span className="text-slate-600">Sequence & Tokenizer Details</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Academic Field Dropdown */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Academic Subject
          </label>
          <select
            value={field}
            onChange={(e) => {
              setField(e.target.value);
              setError(null);
            }}
            className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-[#faf9f6] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1e293b] focus:border-transparent font-medium"
          >
            <option value="" disabled>-- Select academic field (11 options) --</option>
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Text Area for input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Describe Your Learning Difficulty
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError(null);
            }}
            placeholder={placeholder}
            className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-[#faf9f6] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e293b] focus:border-transparent resize-y font-mono"
          />
        </div>

        {/* Submit action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#1e293b] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4" />
                Deep Analyzing Text...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-[#fed7aa]" />
                Get AI Learning Help
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
