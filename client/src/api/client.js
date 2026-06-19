// The single fetch wrapper used by every API module.
//
// Why centralize this instead of calling fetch directly?
// Every request needs credentials: 'include' for the session cookie, and every
// error response needs to be unwrapped from the backend's { error: { message } }
// envelope. Doing this in one place means the API modules stay thin and
// components only ever see thrown Error objects with a plain .message string.

const BASE = '/api';

async function apiFetch(path, options = {}) {
  const { body, ...rest } = options;

  const init = {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const res = await fetch(`${BASE}${path}`, init);

  // 204 No Content — nothing to parse.
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

export default apiFetch;