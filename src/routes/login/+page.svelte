<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { authenticate } from '$lib/utils/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Lock, Eye, EyeOff } from 'lucide-svelte';

	let password = '';
	let showPassword = false;
	let error = '';
	let isLoading = false;

	onMount(() => {
		// Focus on password input
		const passwordInput = document.getElementById('password') as HTMLInputElement;
		if (passwordInput) {
			passwordInput.focus();
		}
	});

	async function handleSubmit() {
		if (!password.trim()) {
			error = 'Please enter a password';
			return;
		}

		isLoading = true;
		error = '';

		// Simulate a small delay for better UX
		await new Promise(resolve => setTimeout(resolve, 500));

		if (authenticate(password)) {
			goto('/');
		} else {
			error = 'Incorrect password';
			password = '';
		}

		isLoading = false;
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
				<Lock class="h-8 w-8 text-primary" />
			</div>
			<CardTitle class="text-2xl">Venture Meter</CardTitle>
			<p class="text-muted-foreground">Enter password to access the questionnaire</p>
		</CardHeader>
		<CardContent class="space-y-4">
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				<div class="space-y-2">
					<label for="password" class="text-sm font-medium">Password</label>
					<div class="relative">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							onkeypress={handleKeyPress}
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Enter password"
							disabled={isLoading}
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							{#if showPassword}
								<EyeOff size="16" />
							{:else}
								<Eye size="16" />
							{/if}
						</button>
					</div>
				</div>

				{#if error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{error}
					</div>
				{/if}

				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
					{/if}
					{isLoading ? 'Checking...' : 'Access Questionnaire'}
				</Button>
			</form>
		</CardContent>
	</Card>
</div> 