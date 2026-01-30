<script lang="ts">
    import type { Snippet } from 'svelte';
    import ReportHeader from './ReportHeader.svelte';
    import ReportFooter from './ReportFooter.svelte';

    let { 
        children, 
        reportPeriodLabel,
        pageNumber,
        totalPages,
        showFooterDetails = false,
        branding
    }: { 
        children: Snippet, 
        reportPeriodLabel: string,
        pageNumber?: number,
        totalPages?: number,
        showFooterDetails?: boolean,
        branding?: any
    } = $props();
</script>

<div class="a4-page page-break bg-white" style="background-image: linear-gradient(to bottom left, color-mix(in srgb, var(--primary), white 95%), white, white);">
    <ReportHeader {reportPeriodLabel} {branding} />
    
    <div class="flex-grow flex flex-col">
        {@render children()}
    </div>

    <ReportFooter {pageNumber} {totalPages} showDetails={showFooterDetails} {branding} />
</div>
