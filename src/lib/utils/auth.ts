// Simple password protection utility
const PASSWORD_KEY = 'venture-meter-auth';
import { PUBLIC_AUTH_PASSWORD } from '$env/static/public';

export function isAuthenticated(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(PASSWORD_KEY) === 'true';
}

export function authenticate(password: string): boolean {
    console.log('password', password, PUBLIC_AUTH_PASSWORD);
	if (password === PUBLIC_AUTH_PASSWORD) {
		localStorage.setItem(PASSWORD_KEY, 'true');
		return true;
	}
	return false;
}

export function logout(): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(PASSWORD_KEY);
}