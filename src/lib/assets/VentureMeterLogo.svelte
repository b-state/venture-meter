<script lang="ts">
	import { mode } from 'mode-watcher';

	let darkMode = $derived($mode === 'dark');
</script>

{#if darkMode}
	<img src="VentureMeterLogoWhite.svg" alt="Venture Meter Logo" />
{:else}
	<img src="VentureMeterLogo.svg" alt="Venture Meter Logo" />
{/if}
