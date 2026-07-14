/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PredictionResult } from "../types";

interface ComparisonCardsProps {
  comparison: {
    BiLSTM: PredictionResult;
    BERT: PredictionResult;
  };
  activeModel: "BiLSTM" | "BERT";
}

const EMOTION_EMOJIS: Record<string, string> = {
  Bored: "🥱",
  Confident: "😎",
  Confused: "😕",
  Curious: "🧐",
  Frustrated: "😫"
};

// Colors for active highlighted state
const EMOTION_COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  Bored: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    bar: "bg-gray-400"
  },
  Confident: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    bar: "bg-emerald-500"
  },
  Confused: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    bar: "bg-amber-500"
  },
  Curious: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    bar: "bg-indigo-500"
  },
  Frustrated: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    bar: "bg-rose-500"
  }
};

export default function ComparisonCards({ comparison, activeModel }: ComparisonCardsProps) {
  const renderModelCard = (modelName: "BiLSTM" | "BERT", result: PredictionResult) => {
    const isActive = activeModel === modelName;
    const isMixed = result.predictedEmotion.includes("+");
    const primaryEmotion = result.primaryEmotion;
    const secondaryEmotion = result.secondaryEmotion;

    // Get color theme for active primary emotion
    const colorTheme = EMOTION_COLOR_CLASSES[primaryEmotion] || {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      bar: "bg-slate-500"
    };

    // Sorted scores for rendering as progress bars
    const sortedScores = Object.entries(result.emotionScores)
      .sort((a, b) => b[1] - a[1]);

    return (
      <div 
        className={`rounded-2xl border p-5 transition-all ${
          isActive 
            ? `${colorTheme.bg} ${colorTheme.border} ring-2 ring-offset-2 ring-slate-800` 
            : "bg-white border-slate-100 shadow-sm"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Classifier Model</span>
            <h4 className="font-display font-bold text-lg text-slate-800 flex items-center gap-1.5">
              {modelName}
              {isActive && (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded border border-slate-300 uppercase tracking-wider scale-90">
                  Active Choice
                </span>
              )}
            </h4>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detected State</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border}`}>
              {isMixed ? (
                <>
                  {EMOTION_EMOJIS[primaryEmotion] || "❓"} {primaryEmotion} + {EMOTION_EMOJIS[secondaryEmotion || ""] || "❓"} {secondaryEmotion}
                </>
              ) : (
                <>
                  {EMOTION_EMOJIS[primaryEmotion] || "❓"} {primaryEmotion}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Emotion probabilities with progress bars */}
        <div className="space-y-3 mt-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Probability Distribution
          </div>

          {sortedScores.map(([emotion, score]) => {
            const isPrimary = emotion === primaryEmotion;
            const isSecondary = emotion === secondaryEmotion;
            
            const pct = (score * 100).toFixed(1);
            const subTheme = EMOTION_COLOR_CLASSES[emotion] || { bar: "bg-slate-400" };

            return (
              <div key={emotion} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`font-medium flex items-center gap-1 ${isPrimary ? "font-bold text-slate-800" : "text-slate-500"}`}>
                    <span>{EMOTION_EMOJIS[emotion]}</span>
                    <span>{emotion}</span>
                    {isPrimary && (
                      <span className="text-[9px] font-bold text-[#c2410c] bg-orange-50 px-1 py-0.2 rounded border border-orange-100 uppercase tracking-wider">
                        Primary
                      </span>
                    )}
                    {isSecondary && (
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100 uppercase tracking-wider">
                        Secondary
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-700">{pct}%</span>
                </div>
                
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${subTheme.bar}`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 font-sans">
      <div>
        <h3 className="font-display font-bold text-lg text-slate-800">Neural Network Model Output</h3>
        <p className="text-xs text-slate-400">Comparing Student-Adaptive BiLSTM with Fine-Tuned BERT representations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderModelCard("BiLSTM", comparison.BiLSTM)}
        {renderModelCard("BERT", comparison.BERT)}
      </div>
    </div>
  );
}
