export type CalculatorOperation = "add" | "subtract" | "multiply" | "divide";

export type CalculateRequest = {
  operation: CalculatorOperation;
  a: number;
  b: number;
};

type CalculateSuccessResponse = {
  result: number;
};

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export async function calculate(
  payload: CalculateRequest,
): Promise<CalculateSuccessResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;
    const message =
      errorBody?.error?.message ?? "Request failed. Please try again.";
    throw new Error(message);
  }

  return (await response.json()) as CalculateSuccessResponse;
}
