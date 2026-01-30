<script lang="ts">
    import { onMount } from 'svelte';
    import Report from '$lib/components/pages/home/Report.svelte';
    import type { ReportData } from '$lib/scripts/types/report.types.js';

    let reportData: ReportData | null = $state(null);

    onMount(() => {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'SET_REPORT_DATA') {
                reportData = event.data.data;
            }
        });
        // Signal that the renderer is ready to receive data
        if (window.opener) {
            window.opener.postMessage({ type: 'RENDERER_READY' }, '*');
        } else {
            // If not opened via window.open (e.g. puppeteer), we might need another way or just wait for message
            console.log('Renderer loaded, waiting for data...');
        }
    });
</script>

{#if reportData}
    <div class="print-container">
        <Report data={reportData} />
    </div>
{/if}

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        background: white;
    }
    .print-container {
        width: 210mm;
    }
</style>
