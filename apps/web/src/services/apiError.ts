type ApiErrorBody = {
  error?: unknown;
  message?: unknown;
  code?: unknown;
  details?: unknown;
};

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options: { status: number; code?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

export async function readApiBody(response: Response): Promise<unknown> {
  if (typeof response.text === 'function') {
    const raw = await response.text();
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { error: raw };
    }
  }

  if (typeof response.json === 'function') {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  return null;
}

export async function parseApiError(
  response: Response,
  fallbackMessage: string
): Promise<ApiRequestError> {
  const body = (await readApiBody(response)) as ApiErrorBody | null;

  const messageCandidate =
    typeof body?.error === 'string'
      ? body.error
      : typeof body?.message === 'string'
        ? body.message
        : null;

  const code = typeof body?.code === 'string' ? body.code : undefined;

  return new ApiRequestError(messageCandidate?.trim() || fallbackMessage, {
    status: response.status,
    code,
    details: body?.details,
  });
}
