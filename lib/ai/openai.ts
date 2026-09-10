import "server-only";
import OpenAI from "openai";

let client: OpenAI | null = null;

export function isAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error("AI assistance is not configured.");
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export function getAIModel() {
  return process.env.OPENAI_MODEL || "gpt-5.4-mini";
}
