/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResult, PreprocessingDetail } from "../types";

// Vocabulary for simulating tokenization
const SIMULATED_VOCAB: Record<string, number> = {
  "<PAD>": 0,
  "<UNK>": 1,
  "i": 2,
  "the": 3,
  "to": 4,
  "and": 5,
  "a": 6,
  "of": 7,
  "in": 8,
  "is": 9,
  "that": 10,
  "it": 11,
  "my": 12,
  "on": 13,
  "for": 14,
  "with": 15,
  "code": 16,
  "error": 17,
  "not": 18,
  "get": 19,
  "how": 20,
  "stuck": 21,
  "confused": 22,
  "frustrated": 23,
  "easy": 24,
  "bored": 25,
  "curious": 26,
  "understand": 27,
  "wonder": 28,
  "impossible": 29,
  "solved": 30,
};

// Emotion categories
const EMOTIONS = ["Bored", "Confident", "Confused", "Curious", "Frustrated"] as const;
type EmotionType = typeof EMOTIONS[number];

// Keyword list for explicit emotions
const KEYWORDS: Record<EmotionType, string[]> = {
  Bored: ["bored", "boring", "tedious", "sleepy", "slow", "dull", "uninteresting", "monotonous", "tired", "dry"],
  Confident: ["confident", "solved", "easy", "got this", "clear", "understand", "success", "mastered", "simple", "perfect", "ready", "achieved", "proud", "fluent"],
  Confused: ["confused", "stuck", "lost", "clueless", "don't understand", "puzzled", "vague", "dont get", "not clear", "where", "how to", "perplexed", "mess", "explain", "what is"],
  Curious: ["curious", "wonder", "explore", "interested", "fascinating", "intriguing", "learn more", "how does", "discover", "cool", "excited", "investigate"],
  Frustrated: ["frustrated", "annoyed", "mad", "angry", "hate", "impossible", "broken", "giving up", "fail", "useless", "stupid", "worst", "waste", "terrible", "wrong", "stress", "exhausted", "bug"]
};

// Clean text function
export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, "") // remove punctuation except apostrophes
    .replace(/\s+/g, " ")     // collapse whitespace
    .trim();
}

// Tokenize and pad to fixed length (80 tokens)
export function preprocessText(text: string): PreprocessingDetail {
  const cleaned = cleanText(text);
  const words = cleaned.split(" ").filter(w => w.length > 0);
  
  // Find keyword matches
  const keywordMatches: PreprocessingDetail["keywordMatches"] = [];
  
  words.forEach(word => {
    (Object.keys(KEYWORDS) as EmotionType[]).forEach(category => {
      if (KEYWORDS[category].includes(word)) {
        keywordMatches.push({
          word,
          category,
          weight: 10 // "Keyword scoring with 10x weight for explicit emotions"
        });
      }
    });
  });

  // Check for phrases (like "don't understand", "learn more", "got this")
  const lowercaseText = text.toLowerCase();
  (Object.keys(KEYWORDS) as EmotionType[]).forEach(category => {
    KEYWORDS[category].forEach(phrase => {
      if (phrase.includes(" ") && lowercaseText.includes(phrase)) {
        keywordMatches.push({
          word: phrase,
          category,
          weight: 10
        });
      }
    });
  });

  // Pad or truncate to 80
  const tokens = words.slice(0, 80);
  const paddedTokens: (string | number)[] = [...tokens];
  while (paddedTokens.length < 80) {
    paddedTokens.push("<PAD>");
  }

  return {
    tokens,
    paddedTokens,
    keywordMatches
  };
}

// Helper: Softmax activation function
function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => Number((e / sumExps).toFixed(4)));
}

// Helper to determine mixed emotions based on 15% threshold
export function detectMixedEmotions(scores: Record<string, number>): {
  predictedEmotion: string;
  primaryEmotion: string;
  secondaryEmotion: string | null;
} {
  // Sort emotions by score descending
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);

  const [primaryName, primaryScore] = sorted[0];
  const [secondaryName, secondaryScore] = sorted[1];

  // "Mixed Emotion Detection (≥15% Secondary Scores)"
  if (secondaryScore >= 0.15 && secondaryScore !== primaryScore) {
    return {
      predictedEmotion: `${primaryName} + ${secondaryName}`,
      primaryEmotion: primaryName,
      secondaryEmotion: secondaryName
    };
  } else {
    return {
      predictedEmotion: primaryName,
      primaryEmotion: primaryName,
      secondaryEmotion: null
    };
  }
}

// Model Prediction Pipelines
export class EmotionClassifier {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
  }

  // Get base emotional probability distribution
  private async getBaseLogits(text: string, prep: PreprocessingDetail): Promise<Record<EmotionType, number>> {
    // Start with a small random baseline to simulate real neural network outputs
    const baseLogits: Record<EmotionType, number> = {
      Bored: 0.1,
      Confident: 0.1,
      Confused: 0.1,
      Curious: 0.1,
      Frustrated: 0.1
    };

    // Analyze sentence-level features
    const lower = text.toLowerCase();
    
    // Bored triggers
    if (lower.includes("already know") || lower.includes("repetitive") || lower.includes("too slow") || lower.includes("easy") && lower.includes("bored")) baseLogits.Bored += 2.5;
    
    // Confident triggers
    if (lower.includes("got this") || lower.includes("easy") || lower.includes("solved") || lower.includes("clear") || lower.includes("success") || lower.includes("understand")) baseLogits.Confident += 2.5;
    
    // Confused triggers
    if (lower.includes("why") || lower.includes("how") || lower.includes("stuck") || lower.includes("lost") || lower.includes("explain") || lower.includes("don't get") || lower.includes("dont get") || lower.includes("don't understand") || lower.includes("dont understand")) baseLogits.Confused += 2.5;
    
    // Curious triggers
    if (lower.includes("interested") || lower.includes("wonder") || lower.includes("learn") || lower.includes("more about") || lower.includes("how does") || lower.includes("discover")) baseLogits.Curious += 2.5;
    
    // Frustrated triggers
    if (lower.includes("impossible") || lower.includes("broken") || lower.includes("giving up") || lower.includes("fail") || lower.includes("annoyed") || lower.includes("error") || lower.includes("stupid") || lower.includes("hate")) baseLogits.Frustrated += 2.5;

    // Apply 10x weight for explicit matching keywords (Lexicon-based scoring)
    prep.keywordMatches.forEach(match => {
      baseLogits[match.category as EmotionType] += match.weight * 0.8;
    });

    return baseLogits;
  }

  // 1. BiLSTM Classifier Pipeline
  public async predictBiLSTM(text: string): Promise<PredictionResult> {
    const prep = preprocessText(text);
    const logitsRecord = await this.getBaseLogits(text, prep);
    const logits = [
      logitsRecord.Bored,
      logitsRecord.Confident,
      logitsRecord.Confused,
      logitsRecord.Curious,
      logitsRecord.Frustrated
    ];

    // Softmax normalization
    const probs = softmax(logits);
    const emotionScores: Record<string, number> = {
      Bored: probs[0],
      Confident: probs[1],
      Confused: probs[2],
      Curious: probs[3],
      Frustrated: probs[4]
    };

    const mixedDetails = detectMixedEmotions(emotionScores);
    const primaryProb = emotionScores[mixedDetails.primaryEmotion];

    return {
      ...mixedDetails,
      confidenceScore: primaryProb,
      emotionScores,
      cleanedText: cleanText(text),
      preprocessing: prep
    };
  }

  // 2. BERT Classifier Pipeline
  public async predictBERT(text: string): Promise<PredictionResult> {
    const prep = preprocessText(text);
    const baseLogits = await this.getBaseLogits(text, prep);

    // "class weighting (1.2, 1.8, 0.6, 1.0, 1.4 for Bored, Confident, Confused, Curious, Frustrated)"
    const CLASS_WEIGHTS: Record<EmotionType, number> = {
      Bored: 1.2,
      Confident: 1.8,
      Confused: 0.6,
      Curious: 1.0,
      Frustrated: 1.4
    };

    // Apply class weights
    const weightedLogits = { ...baseLogits };
    (Object.keys(weightedLogits) as EmotionType[]).forEach(emo => {
      weightedLogits[emo] = baseLogits[emo] * CLASS_WEIGHTS[emo];
    });

    // "Enhances predictions with keyword-based adjustments: boosts Confident class (2.5x) when confidence keywords are detected or boosts Confused class (2.0x) when confusion keywords are found"
    const hasConfidentKeywords = prep.keywordMatches.some(m => m.category === "Confident");
    const hasConfusedKeywords = prep.keywordMatches.some(m => m.category === "Confused");

    if (hasConfidentKeywords) {
      weightedLogits.Confident *= 2.5;
    }
    if (hasConfusedKeywords) {
      weightedLogits.Confused *= 2.0;
    }

    // Convert to array and run through softmax for final BERT distribution
    const logits = [
      weightedLogits.Bored,
      weightedLogits.Confident,
      weightedLogits.Confused,
      weightedLogits.Curious,
      weightedLogits.Frustrated
    ];
    const probs = softmax(logits);

    const emotionScores: Record<string, number> = {
      Bored: probs[0],
      Confident: probs[1],
      Confused: probs[2],
      Curious: probs[3],
      Frustrated: probs[4]
    };

    const mixedDetails = detectMixedEmotions(emotionScores);
    const primaryProb = emotionScores[mixedDetails.primaryEmotion];

    return {
      ...mixedDetails,
      confidenceScore: primaryProb,
      emotionScores,
      cleanedText: cleanText(text),
      preprocessing: prep
    };
  }
}
