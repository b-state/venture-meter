<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/components/ui/button';
    import { Home, RefreshCw } from 'lucide-svelte';
    import VentureMeterLogo from '$lib/assets/VentureMeterLogo.svelte';

    let { data } = $props();
    let status = $derived($page.status);
    let message = $derived($page.error?.message || 'Ein unerwarteter Fehler ist aufgetreten');

    function getErrorMessage(status: number): string {
        switch (status) {
            case 404:
                return 'Die gesuchte Seite konnte nicht gefunden werden';
            case 403:
                return 'Zugriff verweigert';
            case 500:
                return 'Ein Serverfehler ist aufgetreten';
            default:
                return 'Ein unerwarteter Fehler ist aufgetreten';
        }
    }
</script>
<div class="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center px-4">
    <div class="text-center max-w-2xl flex flex-col gap-6">
        <p class="text-8xl font-bold text-primary">{status}</p>

        <p class="text-xl font-semibold">{getErrorMessage(status)}</p>

        <div class="flex gap-6 justify-center">
            <a href="/">
                <Button variant="outline" size="lg" class="gap-2">
                    <Home size="20" />
                    Zur Startseite
                </Button>
            </a>
            <Button variant="outline" size="lg" class="gap-2" onclick={() => window.location.reload()}>
                <RefreshCw size="20" />
                Seite neu laden
            </Button>
        </div>
    </div>
</div>