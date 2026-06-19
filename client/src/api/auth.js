import apiFetch from './client.js';

export function getMe() {
  return apiFetch('/auth/me');
}

export function login(username, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: { username, password },
  });
}

export function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

export function register(username, email, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: { username, email, password },
  });
}