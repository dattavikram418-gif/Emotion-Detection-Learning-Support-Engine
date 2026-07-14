/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, GraduationCap, CheckCircle2, Bookmark } from "lucide-react";
import { EmotionRecord } from "../types";

interface ResponseViewProps {
  record: EmotionRecord;
}

export default function ResponseView({ record }: ResponseViewProps) {
  const isAI = record.responseType === "AI";

  // Simple formatter to format bullet points or sections if the AI returns them
  const formatResponseText = (text: string) => {
    if (!text) return null;

    // Split text into lines to look for headers or bullet points
    const lines = text.split("\n");
    let inList = false;

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Check if line is a Header
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="font-display font-bold text-base text-slate-800 mt-4 mb-2">
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="font-display font-bold text-lg text-slate-800 mt-5 mb-2.5">
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h2 key={idx} className="font-display font-bold text-xl text-slate-800 mt-6 mb-3">
            {trimmed.replace(/^#\s*/, "")}
          </h2>
        );
      }

      // Check if line is bold text (e.g. **Section**)
      if (trimmed.startsWith("ACKNOWLEDGMENT:") || trimmed.startsWith("**ACKNOWLEDGMENT:**") || trimmed.startsWith("1. ACKNOWLEDGMENT")) {
        return (
          <div key={idx} className="p-4 bg-orange-50 border border-orange-100 rounded-xl mb-4 text-orange-950 text-sm leading-relaxed">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-orange-800 mb-1">Acknowledgment & Validation</span>
            {trimmed.replace(/^(1\.\s+)?(\*\*ACKNOWLEDGMENT:\*\*|ACKNOWLEDGMENT:)\s*/i, "")}
          </div>
        );
      }

      if (trimmed.startsWith("FIELD-SPECIFIC TIPS:") || trimmed.startsWith("**FIELD-SPECIFIC TIPS:**") || trimmed.startsWith("2. FIELD-SPECIFIC TIPS")) {
        return (
          <div key={idx} className="mt-4 mb-2">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-indigo-800 mb-2">Academic & Subject Strategy</span>
            <p className="text-sm font-medium text-slate-700">{trimmed.replace(/^(2\.\s+)?(\*\*FIELD-SPECIFIC TIPS:\*\*|FIELD-SPECIFIC TIPS:)\s*/i, "")}</p>
          </div>
        );
      }

      if (trimmed.startsWith("ENCOURAGING NEXT STEP:") || trimmed.startsWith("**ENCOURAGING NEXT STEP:**") || trimmed.startsWith("3. ENCOURAGING NEXT STEP")) {
        return (
          <div key={idx} className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mt-4 mb-4 text-emerald-950 text-sm leading-relaxed">
            <span className="font-bold block uppercase tracking-wider text-[10px] text-emerald-800 mb-1">Encouraging Next Steps</span>
            {trimmed.replace(/^(3\.\s+)?(\*\*ENCOURAGING NEXT STEP:\*\*|ENCOURAGING NEXT STEP:)\s*/i, "")}
          </div>
        );
      }

      // Check if line is a bullet point or numbered item
      if (trimmed.match(/^(\*|-|\d+\.)\s+/)) {
        const content = trimmed.replace(/^(\*|-|\d+\.)\s+/, "");
        return (
          <div key={idx} className="flex items-start gap-2.5 text-slate-600 text-sm py-1 pl-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>{content}</span>
          </div>
        );
      }

      if (trimmed === "") {
        return <div key={idx} className="h-2" />;
      }

      // Normal paragraph
      return (
        <p key={idx} className="text-slate-600 text-sm leading-relaxed mb-2.5">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm font-sans space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-50">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Empathetic Response Feed</span>
          <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#c2410c]" />
            Personalized Guidance
          </h3>
        </div>

        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
          isAI 
            ? "bg-orange-50 border-orange-100 text-[#c2410c]" 
            : "bg-slate-50 border-slate-100 text-slate-600"
        }`}>
          {isAI ? (
            <>
              <Sparkles className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
              Gemini AI Generated
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5 text-slate-400" />
              Predefined Advisor Template
            </>
          )}
        </span>
      </div>

      {/* Response content */}
      <div className="pt-2">
        {formatResponseText(record.aiResponse)}
      </div>

      {/* Helpful quote footer */}
      <div className="pt-4 border-t border-slate-50 text-center text-[11px] text-slate-400 italic">
        "Every master was once a beginner who refused to give up."
      </div>
    </div>
  );
}
