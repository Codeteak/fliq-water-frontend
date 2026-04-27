import { AxiosError } from "axios";

export interface AppError {
  message: string;
  statusCode?: number;
  code?: string;
}

function looksTechnical(message: string): boolean {
  return /(GET|POST|PUT|PATCH|DELETE)\s+\/|\/api\/|ECONN|stack|trace|Exception|Error:|SQL/i.test(
    message,
  );
}

function messageByStatus(statusCode?: number): string {
  if (statusCode === 401) return "Please login and try again.";
  if (statusCode === 403) return "You are not allowed to perform this action.";
  if (statusCode === 404) return "Requested data was not found.";
  if (statusCode && statusCode >= 500) return "Server error. Please try again.";
  return "Something went wrong. Please try again.";
}

export function normalizeError(error: unknown, fallback = "Something went wrong"): AppError {
  if (error instanceof AxiosError) {
    const backendMessage = (error.response?.data as { message?: string } | undefined)?.message;
    const safeFallback = messageByStatus(error.response?.status);
    const message =
      backendMessage && !looksTechnical(backendMessage)
        ? backendMessage
        : error.message && !looksTechnical(error.message)
          ? error.message
          : fallback || safeFallback;

    return {
      message,
      statusCode: error.response?.status,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    if (error.message && !looksTechnical(error.message)) {
      return { message: error.message };
    }
    return { message: fallback || "Something went wrong. Please try again." };
  }

  return { message: fallback };
}
