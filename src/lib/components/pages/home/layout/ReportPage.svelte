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

<div class="a4-page page-break bg-linear-to-bl from-primary/5 via-white to-white">
    <ReportHeader {reportPeriodLabel} {branding} />
    
    <div class="flex-grow flex flex-col">
        {@render children()}
    </div>

    <ReportFooter {pageNumber} {totalPages} showDetails={showFooterDetails} {branding} />
</div>
