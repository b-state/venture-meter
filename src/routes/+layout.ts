import { isAuthenticated } from '$lib/utils/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
	// Allow access to login page and static assets
	if (url.pathname === '/login' || url.pathname.startsWith('/static/')) {
		return {};
	}

	// Wait for browser environment before checking authentication
	if (typeof window !== 'undefined') {
		if (!isAuthenticated()) {
			throw redirect(302, '/login');
		}
	}

	return {};
}; 