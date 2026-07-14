/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PredictionResult } from "../types";

interface AnalysisDetailsProps {
  result: PredictionResult;
}

const EMOTION_COLORS: Record<string, string> = {
  Bored: "bg-gray-100 text-gray-700 border-gray-300",
  Confident: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Confused: "bg-amber-100 text-amber-800 border-amber-300",
  Curious: "bg-indigo-100 text-indigo-800 border-indigo-300",
  Frustrated: "bg-rose-100 text-rose-800 border-rose-300"
};

export default function AnalysisDetails({ result }: AnalysisDetailsProps) {
  const { preprocessing } = result;
  const { tokens, paddedTokens, keywordMatches } = preprocessing;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm font-sans space-y-6">
      <div>
        <h4 className="font-display font-bold text-base text-slate-800">Sequence & Tokenization Details</h4>
        <p className="text-xs text-slate-400">Under-the-hood sequence mapping processed by the NLP cleaning pipeline</p>
      </div>

      {/* Sequence preparation metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Tokenizer</span>
          <span className="font-semibold text-slate-700">Keras / HF Tokenizer</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Vocabulary Size</span>
          <span className="font-semibold text-slate-700 font-mono">30,000 words</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Sequence Length</span>
          <span className="font-semibold text-slate-700 font-mono">Fixed 80-tokens</span>
        </div>
      </div>

      {/* 80-token sequence grid */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Fixed 80-Token Tensor Grid</span>
          <span className="text-[10px] text-slate-400 font-medium">Hover tokens to check tokenized words</span>
        </div>
        
        <div className="grid grid-cols-10 gap-1.5 p-3.5 bg-slate-900 rounded-xl max-h-56 overflow-y-auto border border-slate-950 shadow-inner">
          {paddedTokens.map((tok, idx) => {
            const isPad = tok === "<PAD>";
            const cleanTok = String(tok);
            
            // Check if this token matches any keyword
            const keywordMatch = keywordMatches.find(m => cleanTok.toLowerCase().includes(m.word.toLowerCase()));
            
            let tokClass = "bg-slate-800 text-slate-300 border-slate-700";
            if (isPad) {
              tokClass = "bg-slate-900/40 text-slate-600 border-slate-800/60 font-normal";
            } else if (keywordMatch) {
              const category = keywordMatch.category;
              const colMap: Record<string, string> = {
                Bored: "bg-gray-700/80 text-gray-200 border-gray-600",
                Confident: "bg-emerald-800 text-emerald-200 border-emerald-700",
                Confused: "bg-amber-800 text-amber-200 border-amber-700",
                Curious: "bg-indigo-800 text-indigo-200 border-indigo-700",
                Frustrated: "bg-rose-800 text-rose-200 border-rose-700"
              };
              tokClass = colMap[category] || tokClass;
            }

            return (
              <div 
                key={idx}
                className={`px-1 py-1.5 text-[9px] font-mono font-semibold rounded text-center border overflow-hidden truncate cursor-help transition-all hover:scale-105 hover:bg-slate-100 hover:text-slate-900 hover:border-white ${tokClass}`}
                title={`Index: ${idx} | Token: "${tok}" ${keywordMatch ? `(Keyword: ${keywordMatch.category})` : ""}`}
              >
                {tok}
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyword scoring rules log */}
      <div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">Lexicon Adjustment Logic</span>
        {keywordMatches.length === 0 ? (
          <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400">
            No emotional keyword multipliers triggered. Standard neural weights applied.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-[#faf9f6] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Keyword</th>
                  <th className="px-4 py-2.5">Trigger Class</th>
                  <th className="px-4 py-2.5">Weight Multiplier</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {keywordMatches.map((match, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-800 font-bold">"{match.word}"</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${EMOTION_COLORS[match.category] || "bg-slate-100 text-slate-600"}`}>
                        {match.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-emerald-600 font-semibold">{match.weight}x multiplier</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-emerald-700 bg-emerald-50/50">Renormalized</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
