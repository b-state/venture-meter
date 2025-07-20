import { isAuthenticated } from '$lib/utils/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
	// Allow access to login page and static assets
	if (url.pathname === '/login' || url.pathname.startsWith('/static/')) {
		return {};
	}

	// Check if user is authenticated
	if (!isAuthenticated()) {
		throw redirect(302, '/login');
	}

	return {};
}; 