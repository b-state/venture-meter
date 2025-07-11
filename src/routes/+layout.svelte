<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';
	import VentureMeterLogo from '$lib/assets/VentureMeterLogo.svelte';
	import { page } from '$app/state';

	let { children } = $props();
	let currentPath = $derived(page.url.pathname);
</script>

<ModeWatcher />
<header class="flex w-full items-center justify-between border-b h-16 px-5 sticky top-0 backdrop-blur-lg bg-background/80 z-50">
	<div class="w-48">
		<a href="/" class="w-40">
			<VentureMeterLogo />
		</a>
	</div>
	<nav class="flex gap-10">
		<a
			class="transition hover:text-primary {currentPath === '/' ? 'text-primary' : 'text-muted-foreground'}"
			href="/"
		>
			Start
		</a>
		<a
			class="transition hover:text-primary {currentPath.startsWith('/questionnaire') ? 'text-primary' : 'text-muted-foreground'}"
			href="/questionnaire"
		>
			Fragebogen
		</a>
		<a
			class="transition hover:text-primary {currentPath === '/about' ? 'text-primary' : 'text-muted-foreground'}"
			href="/about"
		>
			Über
		</a>
		<a
			class="transition hover:text-primary {currentPath === '/contact' ? 'text-primary' : 'text-muted-foreground'}"
			href="/contact"
		>
			Kontakt
		</a>
	</nav>
	<DarkModeToggle></DarkModeToggle>
</header>

{@render children()}
