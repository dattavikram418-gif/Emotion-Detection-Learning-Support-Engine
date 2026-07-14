/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "student" | "educator" | "admin";

export interface User {
  email: string;
  name: string;
  role: UserRole;
  loginCount: number;
  createdAt: string;
}

export interface EmotionRecord {
  recordId: string;
  email: string;
  field: string;
  inputText: string;
  predictedEmotion: string;
  secondaryEmotion: string | null;
  confidenceScore: number;
  modelUsed: "BiLSTM" | "BERT";
  aiResponse: string;
  responseType: "AI" | "Template";
  emotionScores: Record<string, number>;
  timestamp: string;
  csvLogged: boolean;
  cleanedText: string;
}

export interface PreprocessingDetail {
  tokens: string[];
  paddedTokens: (string | number)[];
  keywordMatches: { word: string; category: string; weight: number }[];
}

export interface PredictionResult {
  predictedEmotion: string;
  primaryEmotion: string;
  secondaryEmotion: string | null;
  confidenceScore: number;
  emotionScores: Record<string, number>;
  cleanedText: string;
  preprocessing: PreprocessingDetail;
}

export interface AnalyticsSummary {
  totalInteractions: number;
  byEmotion: Record<string, number>;
  byField: Record<string, Record<string, number>>;
  averageConfidence: number;
  emotionJourney: { timestamp: string; emotion: string; confidence: number; text: string }[];
}
