<script lang="ts">
    import type { ReportData } from '$lib/scripts/types/report.types.js';
    import ReportPage from '../layout/ReportPage.svelte';
    import ReportSection from '../layout/ReportSection.svelte';

    let { data, pageNumber, totalPages }: { data: ReportData, pageNumber: number, totalPages: number } = $props();

    let topIntegrations = $derived(
        [...data.eventsByIntegration]
            .sort((a, b) => b.countValue - a.countValue)
            .slice(0, 5)
    );
</script>

<ReportPage 
    {pageNumber} 
    {totalPages}
    reportPeriodLabel={data.reportPeriodLabel}
    branding={data.branding}
>
    <ReportSection 
        title="Ingestion Breakdown"
        isMain={true}
        flexGrow={true}
    >
    <!-- BAR GRAPH -->
    <div class="bg-white border border-gray-100 rounded-3xl p-8 mb-6 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
        
        <div class="flex items-end justify-between gap-4 h-32 mb-6">
            {#each topIntegrations as item}
                <div class="flex-1 flex flex-col items-center group h-full justify-end">
                    <div class="w-full relative flex flex-col justify-end h-full">
                        <div 
                            class="bg-primary/20 hover:bg-primary print:bg-primary w-full rounded-t-lg transition-all duration-700 relative" 
                            style="height: {(item.countValue / (topIntegrations[0]?.countValue || 1)) * 100}%"
                        >
                            <div class="absolute -top-6 left-0 w-full text-center">
                                <span class="text-[9px] font-black text-primary tracking-tighter">{item.count}</span>
                            </div>
                        </div>
                    </div>
                    <p class="text-[9px] font-black text-foreground/60 mt-4 truncate w-full text-center uppercase tracking-widest leading-none">{item.name}</p>
                </div>
            {/each}
        </div>
        
        <div class="flex justify-between items-center border-t border-gray-100 pt-6">
            <div>
                <h3 class="text-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-1">Ingestion Distribution</h3>
                <p class="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">Primary telemetry contributors by event volume</p>
            </div>
            <div class="text-right">
                <p class="text-2xl font-black text-primary tracking-tighter leading-none mb-1">{data.funnelData.total.toLocaleString()}</p>
                <p class="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Total Events</p>
            </div>
        </div>
    </div>

    <!-- SOURCE INVENTORY -->
    <div class="flex-grow">
        <div class="flex items-center justify-between px-2 mb-6">
            <h3 class="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <span class="w-8 h-px bg-primary/30"></span>
                Source Inventory
            </h3>
            <span class="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">{data.eventsByIntegration.length} Active Sources</span>
        </div>
        
        <div class="grid grid-cols-2 gap-x-12 gap-y-2">
            {#each data.eventsByIntegration as item}
                <div class="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                    <div class="flex-grow min-w-0">
                        <div class="flex justify-between items-baseline mb-2">
                            <span class="text-[11px] font-black text-foreground/80 truncate pr-4">{item.name}</span>
                            <span class="text-[10px] font-black text-primary tracking-tighter">{item.count}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    class="h-full bg-primary/20 rounded-full transition-all duration-1000 group-hover:bg-primary/40 print:bg-primary/40" 
                                    style="width: {(item.countValue / data.funnelData.total) * 100}%"
                                ></div>
                            </div>
                            <span class="text-[8px] font-black text-foreground/30 w-10 text-right uppercase tracking-tighter">{item.processed}</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
    </ReportSection>
</ReportPage>
