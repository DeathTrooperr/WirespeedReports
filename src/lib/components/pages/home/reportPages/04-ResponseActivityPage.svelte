<script lang="ts">
    import type { ReportData, EscalatedCase } from '$lib/scripts/types/report.types.js';
    import ReportPage from '../layout/ReportPage.svelte';
    import ReportSection from '../layout/ReportSection.svelte';

    let { data, chunk, index, totalCasePages, totalPages }: { 
        data: ReportData, 
        chunk: EscalatedCase[], 
        index: number,
        totalCasePages: number,
        totalPages: number
    } = $props();

    let confirmationRate = $derived(Math.round((Number(data.verdictAccuracy.confirmedMalicious) / (Number(data.verdictAccuracy.verdictedMalicious) || 1)) * 100));
</script>

<ReportPage 
    pageNumber={4 + index} 
    {totalPages}
    reportPeriodLabel={data.reportPeriodLabel}
    branding={data.branding}
>
    {#if index === 0}
    <ReportSection title="Verdict Accuracy" isMain={true}>
        <div class="grid grid-cols-3 gap-8 mb-6">
            <!-- Confirmation Rate Chart -->
            <div class="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-3">
                    <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                </div>
                <div class="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            class="text-primary/5"
                            stroke-width="3"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            class="text-primary"
                            stroke-width="3"
                            stroke-dasharray="{confirmationRate}, 100"
                            stroke-linecap="round"
                        />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-xl font-black text-primary tracking-tighter">{confirmationRate}%</span>
                    </div>
                </div>
                <p class="text-[9px] font-black text-foreground/40 uppercase mt-4 tracking-[0.2em] text-center">Confirmation Rate</p>
            </div>

            <div class="col-span-2 grid grid-cols-1 gap-4">
                <div class="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex justify-between items-center relative overflow-hidden group">
                    <div class="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                        <svg class="w-20 h-20 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-emerald-700/60 text-[9px] uppercase font-black mb-1 tracking-[0.2em]">True Positives</p>
                        <p class="text-xl font-black text-emerald-800 tracking-tighter leading-none">{data.verdictAccuracy.truePositives}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-emerald-600 font-black text-xl tracking-tighter">{data.verdictAccuracy.truePositivesPercent}</p>
                        <div class="w-32 bg-emerald-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div class="bg-emerald-500 h-full rounded-full transition-all duration-1000" style="width: {data.verdictAccuracy.truePositivesPercent}"></div>
                        </div>
                    </div>
                </div>
                <div class="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl flex justify-between items-center relative overflow-hidden group">
                    <div class="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                        <svg class="w-20 h-20 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-amber-700/60 text-[9px] uppercase font-black mb-1 tracking-[0.2em]">False Positives</p>
                        <p class="text-xl font-black text-amber-800 tracking-tighter leading-none">{data.verdictAccuracy.falsePositives}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-amber-600 font-black text-xl tracking-tighter">{data.verdictAccuracy.falsePositivesPercent}</p>
                        <div class="w-32 bg-amber-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div class="bg-amber-500 h-full rounded-full transition-all duration-1000" style="width: {data.verdictAccuracy.falsePositivesPercent}"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ReportSection>
    {/if}

    <ReportSection 
        title={index === 0 ? "MDR Activity" : "MDR Activity (Continued)"}
        isMain={true}
        mt={index === 0 ? "mt-4" : "mt-8"}
    >
        <div class="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
            <table class="w-full text-left">
                <thead class="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                        <th class="py-3 px-4 text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] w-20">Ref ID</th>
                        <th class="py-3 px-4 text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] w-40">Incident</th>
                        <th class="py-3 px-4 text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] w-20">Severity</th>
                        <th class="py-3 px-4 text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em]">Summary</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    {#each chunk as item}
                        <tr class="hover:bg-gray-50/30 transition-colors align-top">
                            <td class="py-3 px-4">
                                <a 
                                    href="https://app.wirespeed.co/cases/{item.id}"
                                    target="_blank" 
                                    class="text-[10px] font-black text-primary hover:underline transition-colors no-underline tracking-tighter print:underline"
                                >
                                    #{item.sid}
                                </a>
                            </td>
                            <td class="py-3 px-4">
                                <p class="text-[11px] font-black text-foreground/80 leading-tight mb-1">{item.title}</p>
                                <p class="text-[8px] text-foreground/30 font-bold uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </td>
                            <td class="py-3 px-4">
                                <span class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest {
                                    item.severity === 'CRITICAL' ? 'text-red-600 bg-red-50' :
                                    item.severity === 'HIGH' ? 'text-orange-600 bg-orange-50' :
                                    item.severity === 'MEDIUM' ? 'text-amber-600 bg-amber-50' :
                                    'text-blue-600 bg-blue-50'
                                }">
                                    {item.severity}
                                </span>
                            </td>
                            <td class="py-3 px-4">
                                <div class="flex flex-col gap-2">
                                    <p class="text-[10px] text-foreground/60 leading-relaxed italic font-medium">
                                        "{item.response.length > 300 ? item.response.slice(0, 300) + '...' : item.response}"
                                    </p>
                                    {#if item.response.length > 300}
                                        <a 
                                            href="https://app.wirespeed.co/cases/{item.id}"
                                            target="_blank"
                                            class="text-[8px] font-black text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 uppercase tracking-[0.2em] no-underline"
                                        >
                                            Details
                                            <svg class="w-2.5 h-2.5 -mt-0.5 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {/each}
                    {#if data.escalatedCases.length === 0}
                        <tr>
                            <td colspan="4" class="py-8 text-center text-foreground/20 text-[9px] font-black uppercase tracking-[0.3em] italic">
                                No escalated incidents recorded
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>

        {#if index === totalCasePages - 1}
        <div class="mt-6 flex items-start gap-4 p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <p class="text-[10px] text-foreground/50 leading-relaxed font-medium">
                <span class="font-black text-primary uppercase tracking-[0.2em] mr-2">MDR Quality Assurance:</span>
                All verdicts undergo a secondary review process to ensure precision in detection logic and minimize organizational friction. Our current confirmation rate reflects Wirespeed's commitment to high-fidelity alerting and continuous improvement of automated response playbooks.
            </p>
        </div>
        {/if}
    </ReportSection>
</ReportPage>
