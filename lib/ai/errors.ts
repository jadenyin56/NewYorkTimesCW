import {
  APIConnectionError,
  APIError,
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
} from "openai";
import { NextResponse } from "next/server";

type AIFeature = "grid" | "clue";

export function openAIErrorResponse(error: unknown, feature: AIFeature) {
  const apiError = error instanceof APIError ? error : null;
  const requestId = apiError?.requestID ?? undefined;

  console.error(`[ai/${feature}] OpenAI request failed`, {
    name: error instanceof Error ? error.name : "UnknownError",
    status: apiError?.status,
    code: apiError?.code,
    type: apiError?.type,
    requestId,
  });

  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: "OpenAI rejected the API key. Replace OPENAI_API_KEY in Vercel, then redeploy.", code: "OPENAI_AUTH", requestId },
      { status: 503 },
    );
  }

  if (error instanceof PermissionDeniedError) {
    return NextResponse.json(
      { error: "This OpenAI project does not have access to the configured model. Check OPENAI_MODEL and the key’s permissions.", code: "OPENAI_PERMISSION", requestId },
      { status: 503 },
    );
  }

  if (error instanceof NotFoundError || error instanceof BadRequestError) {
    return NextResponse.json(
      { error: "OpenAI rejected the model configuration. Check OPENAI_MODEL in Vercel and redeploy.", code: "OPENAI_CONFIG", requestId },
      { status: 503 },
    );
  }

  if (error instanceof RateLimitError) {
    const outOfCredit = error.code === "insufficient_quota";
    return NextResponse.json(
      {
        error: outOfCredit
          ? "The OpenAI project has no available API credit. Add billing credit or raise its usage limit, then try again."
          : "OpenAI is rate-limiting requests. Wait briefly and try again.",
        code: outOfCredit ? "OPENAI_QUOTA" : "OPENAI_RATE_LIMIT",
        requestId,
      },
      { status: outOfCredit ? 503 : 429 },
    );
  }

  if (error instanceof APIConnectionError || (apiError?.status && apiError.status >= 500)) {
    return NextResponse.json(
      { error: "OpenAI is temporarily unavailable. Please try again shortly.", code: "OPENAI_UNAVAILABLE", requestId },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { error: "The AI service could not complete this request.", code: "OPENAI_UNKNOWN", requestId },
    { status: 502 },
  );
}
