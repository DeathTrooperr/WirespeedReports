<script lang="ts">
    import type { ReportData } from '$lib/scripts/types/report.types.js';
    import ReportPage from '../layout/ReportPage.svelte';
    import ReportSection from '../layout/ReportSection.svelte';

    let { data, totalPages }: { data: ReportData, totalPages: number } = $props();
</script>

<ReportPage
    pageNumber={2} 
    {totalPages}
    reportPeriodLabel={data.reportPeriodLabel}
>
    <ReportSection title="Executive Summary" isMain={true}>
        <div class="relative">
            <p class="text-foreground/80 leading-relaxed text-sm whitespace-pre-line pl-0">
                {@html data.executiveSummary}
            </p>
        </div>
    </ReportSection>

    <ReportSection title="Service Scope & Coverage">
        <div class="grid grid-cols-2 gap-6">
            <div class="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
                <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <p class="text-foreground/40 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Protected Identities</p>
                <div class="flex items-baseline gap-3">
                    <p class="text-2xl font-black text-primary tracking-tighter">{data.billableUsers}</p>
                    <span class="text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <p class="text-foreground/50 text-[10px] leading-relaxed mt-4 font-medium italic">Managed identities across all integrated directories and cloud platforms.</p>
            </div>
            <div class="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
                <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <p class="text-foreground/40 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Managed Endpoints</p>
                <div class="flex items-baseline gap-3">
                    <p class="text-2xl font-black text-primary tracking-tighter">{data.billableEndpoints}</p>
                    <span class="text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Protected</span>
                </div>
                <p class="text-foreground/50 text-[10px] leading-relaxed mt-4 font-medium italic">Unique physical and virtual assets with active telemetry and response agents.</p>
            </div>
        </div>
    </ReportSection>

    <ReportSection title="Performance Metrics">
        <div class="grid grid-cols-4 gap-6 relative">
            <div class="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 text-center relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                <p class="text-foreground/40 text-[9px] uppercase font-black mb-2 tracking-[0.2em]">MTTD</p>
                <p class="text-2xl font-black text-primary tracking-tighter">{data.meanTimeMetrics.mttd}</p>
                <p class="text-foreground/50 text-[8px] mt-2 font-bold uppercase tracking-widest italic">Mean Time To Detect</p>
            </div>

            <!-- Arrow -->
            <div class="absolute top-1/2 left-[24%] -translate-y-1/2 -translate-x-1/2 z-10 hidden lg:block">
                <svg class="w-6 h-6 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                </svg>
            </div>

            <div class="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 text-center relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                <p class="text-foreground/40 text-[9px] uppercase font-black mb-2 tracking-[0.2em]">MTTV</p>
                <p class="text-2xl font-black text-primary tracking-tighter">{data.meanTimeMetrics.mttv}</p>
                <p class="text-foreground/50 text-[8px] mt-2 font-bold uppercase tracking-widest italic">Mean Time To Verdict</p>
            </div>

            <!-- Arrow -->
            <div class="absolute top-1/2 left-[50%] -translate-y-1/2 -translate-x-1/2 z-10 hidden lg:block">
                <svg class="w-6 h-6 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                </svg>
            </div>

            <div class="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 text-center relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                <p class="text-foreground/40 text-[9px] uppercase font-black mb-2 tracking-[0.2em]">MTTC</p>
                <p class="text-2xl font-black text-primary tracking-tighter">{data.meanTimeMetrics.mttc || "N/A"}</p>
                <p class="text-foreground/50 text-[8px] mt-2 font-bold uppercase tracking-widest italic">Mean Time To Contain</p>
            </div>

            <!-- Arrow -->
            <div class="absolute top-1/2 left-[76%] -translate-y-1/2 -translate-x-1/2 z-10 hidden lg:block">
                <svg class="w-6 h-6 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                </svg>
            </div>

            <div class="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 text-center relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                <p class="text-foreground/40 text-[9px] uppercase font-black mb-2 tracking-[0.2em]">MTTR</p>
                <p class="text-2xl font-black text-primary tracking-tighter">{data.meanTimeMetrics.mttr}</p>
                <p class="text-foreground/50 text-[8px] mt-2 font-bold uppercase tracking-widest italic">Mean Time To Respond</p>
            </div>
        </div>
    </ReportSection>

    <ReportSection title="Cases by Severity">
        <div class="grid grid-cols-5 gap-4">
            <div class="text-center p-5 rounded-2xl bg-white border border-red-100 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
                <p class="text-[9px] uppercase font-black text-red-600 mb-2 tracking-widest">Critical</p>
                <p class="text-2xl font-black text-red-700 tracking-tighter">{data.casesBySeverity.critical}</p>
            </div>
            <div class="text-center p-5 rounded-2xl bg-white border border-orange-100 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1 bg-orange-500"></div>
                <p class="text-[9px] uppercase font-black text-orange-600 mb-2 tracking-widest">High</p>
                <p class="text-2xl font-black text-orange-700 tracking-tighter">{data.casesBySeverity.high}</p>
            </div>
            <div class="text-center p-5 rounded-2xl bg-white border border-amber-100 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
                <p class="text-[9px] uppercase font-black text-amber-600 mb-2 tracking-widest">Medium</p>
                <p class="text-2xl font-black text-amber-700 tracking-tighter">{data.casesBySeverity.medium}</p>
            </div>
            <div class="text-center p-5 rounded-2xl bg-white border border-blue-100 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
                <p class="text-[9px] uppercase font-black text-blue-600 mb-2 tracking-widest">Low</p>
                <p class="text-2xl font-black text-blue-700 tracking-tighter">{data.casesBySeverity.low}</p>
            </div>
            <div class="text-center p-5 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1 bg-gray-400"></div>
                <p class="text-[9px] uppercase font-black text-gray-500 mb-2 tracking-widest">Info</p>
                <p class="text-2xl font-black text-gray-700 tracking-tighter">{data.casesBySeverity.informational}</p>
            </div>
        </div>
    </ReportSection>
</ReportPage>
