<script lang="ts">
    import type { ReportData } from '$lib/scripts/types/report.types.js';
    import ReportPage from '../layout/ReportPage.svelte';

    let { data, totalPages }: { data: ReportData, totalPages: number } = $props();
</script>

<ReportPage 
    {totalPages} 
    showFooterDetails={true}
    reportPeriodLabel={data.reportPeriodLabel}
    branding={data.branding}
>
    <div class="flex-grow flex flex-col justify-between py-24 px-12 text-center">
        <div class="mt-24">
            <h2 class="text-foreground text-7xl font-black mb-8 tracking-tighter uppercase leading-[0.85]">
                Security<br/>
                <span class="text-primary">Operations</span><br/>
                Report
            </h2>
        </div>

        <div class="mb-12 space-y-16">
            <div>
                <p class="text-primary text-[10px] tracking-[0.4em] uppercase mb-4 font-black">Prepared For</p>
                <p class="text-4xl font-black text-foreground uppercase tracking-tighter">{data.companyName}</p>
            </div>

            <div>
                <p class="text-foreground/40 text-[9px] tracking-[0.4em] uppercase mb-2 font-black">Reporting Period</p>
                <p class="text-2xl font-black text-foreground tracking-tight">{data.reportPeriod}</p>
            </div>
        </div>
    </div>
</ReportPage>
