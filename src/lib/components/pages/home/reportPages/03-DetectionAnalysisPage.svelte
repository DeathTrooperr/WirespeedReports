<script lang="ts">
    import type { ReportData } from '$lib/scripts/types/report.types.js';
    import ReportPage from '../layout/ReportPage.svelte';
    import ReportSection from '../layout/ReportSection.svelte';

    let { data, totalPages }: { data: ReportData, totalPages: number } = $props();
</script>

<ReportPage 
    pageNumber={3} 
    {totalPages}
    reportPeriodLabel={data.reportPeriodLabel}
    branding={data.branding}
>
    <ReportSection title="Detection Analysis" isMain={true}>
        <div class="grid grid-cols-3 gap-6 mb-6">
                <div class="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl"></div>
                    <p class="text-foreground/40 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Total Detections</p>
                    <p class="text-2xl font-black text-primary tracking-tighter">{data.detections.total}</p>
                    <p class="text-foreground/50 text-[10px] mt-4 font-medium italic">Current reporting period</p>
                </div>
                <div class="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl"></div>
                    <p class="text-foreground/40 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Historic Avg</p>
                    <p class="text-2xl font-black text-foreground tracking-tighter">{data.detections.historic}</p>
                    <p class="text-foreground/50 text-[10px] mt-4 font-medium italic">90-day rolling average</p>
                </div>
                <div class="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-3xl"></div>
                    <p class="text-emerald-700/60 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Auto-Closed</p>
                    <p class="text-2xl font-black text-emerald-700 tracking-tighter">{data.detections.autoClosed}</p>
                    <p class="text-emerald-600/60 text-[10px] mt-4 font-medium italic">Mitigated via automated playbooks</p>
                </div>
            </div>

            <div class="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 text-primary relative overflow-hidden">
                <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
                <h3 class="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span class="w-8 h-px bg-primary/30"></span>
                    Alert Processing Pipeline
                </h3>
                
                <div class="flex items-center justify-between gap-8 relative">
                    <!-- Tile-based Funnel Visualization -->
                    <div class="flex-[1.4] relative h-64 flex flex-col items-center">
                        <svg viewBox="0 0 260 280" class="w-full h-full">
                            <defs>
                                <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                                    <feOffset dx="0" dy="1" result="offsetblur" />
                                    <feComponentTransfer>
                                        <feFuncA type="linear" slope="0.1" />
                                    </feComponentTransfer>
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            
                            <!-- Ingested Tile -->
                            <path 
                                d="M 5,10 L 255,10 L 237,70 L 23,70 Z" 
                                class="fill-primary/10 stroke-primary/20"
                                stroke-width="1"
                                filter="url(#tileShadow)"
                            />
                            
                            <!-- Detections Tile -->
                            <path 
                                d="M 24.5,75 L 235.5,75 L 217.5,135 L 42.5,135 Z" 
                                class="fill-primary/30 stroke-primary/40"
                                stroke-width="1"
                                filter="url(#tileShadow)"
                            />
                            
                            <!-- Cases Tile -->
                            <path 
                                d="M 44,140 L 216,140 L 198,200 L 62,200 Z" 
                                class="fill-primary/60 stroke-primary/70"
                                stroke-width="1"
                                filter="url(#tileShadow)"
                            />
                            
                            <!-- Responded Tile -->
                            <path 
                                d="M 63.5,205 L 196.5,205 L 178.5,265 L 81.5,265 Z" 
                                class="fill-primary stroke-primary"
                                stroke-width="1"
                                filter="url(#tileShadow)"
                            />

                            <!-- Data Labels & Values -->
                            <!-- Ingested -->
                            <g transform="translate(130, 40)">
                                <text y="-10" text-anchor="middle" class="fill-foreground/60 text-[9px] font-black uppercase tracking-[0.2em]">Ingested</text>
                                <text y="18" text-anchor="middle" class="fill-primary text-[24px] font-black tracking-tighter">{data.funnelData.total.toLocaleString()}</text>
                            </g>

                            <!-- Detections -->
                            <g transform="translate(130, 105)">
                                <text y="-10" text-anchor="middle" class="fill-foreground/60 text-[9px] font-black uppercase tracking-[0.2em]">Detections</text>
                                <text y="18" text-anchor="middle" class="fill-primary text-[24px] font-black tracking-tighter">{data.funnelData.detections}</text>
                            </g>

                            <!-- Cases -->
                            <g transform="translate(130, 170)">
                                <text y="-10" text-anchor="middle" class="fill-white/80 text-[9px] font-black uppercase tracking-[0.2em]">Cases</text>
                                <text y="18" text-anchor="middle" class="fill-white text-[24px] font-black tracking-tighter">{data.funnelData.cases}</text>
                            </g>

                            <!-- Responded -->
                            <g transform="translate(130, 235)">
                                <text y="-10" text-anchor="middle" class="fill-white/80 text-[9px] font-black uppercase tracking-[0.2em]">Responded</text>
                                <text y="18" text-anchor="middle" class="fill-white text-[24px] font-black tracking-tighter">{data.funnelData.responded}</text>
                            </g>
                        </svg>
                    </div>

                    <div class="flex-1 space-y-3">
                        <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
                            <p class="text-[10px] uppercase font-black text-foreground/40 mb-2 tracking-widest">Escalated</p>
                            <div class="flex items-baseline gap-4">
                                <p class="text-2xl font-black text-primary tracking-tighter">{data.detections.escalated}</p>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                    <p class="text-primary text-sm font-black tracking-tighter">{data.detections.escalatedPercent}</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
                            <p class="text-[10px] uppercase font-black text-foreground/40 mb-2 tracking-widest">Chat Ops</p>
                            <div class="flex items-baseline gap-4">
                                <p class="text-2xl font-black text-primary tracking-tighter">{data.detections.chatOps}</p>
                                <p class="text-primary text-sm font-black tracking-tighter">{data.detections.chatOpsPercent}</p>
                            </div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-1 h-full bg-primary/20"></div>
                            <p class="text-[10px] uppercase font-black text-foreground/40 mb-2 tracking-widest">Containment</p>
                            <div class="flex items-baseline gap-4">
                                <p class="text-2xl font-black text-primary tracking-tighter">{data.detections.containment}</p>
                                <p class="text-primary text-sm font-black tracking-tighter">{data.detections.containmentPercent}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ReportSection>

        <ReportSection title="Historical Simulation (Test Mode)" mt="mt-6">
            <div class="grid grid-cols-3 gap-6">
                <div class="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl transition-transform group-hover:scale-110"></div>
                    <p class="text-foreground/40 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Would Escalate</p>
                    <p class="text-2xl font-black text-primary tracking-tighter">{data.potentialActions.wouldEscalate}</p>
                    <p class="text-foreground/50 text-[10px] mt-4 font-medium italic">Historic detections that would have been escalated</p>
                </div>
                <div class="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl transition-transform group-hover:scale-110"></div>
                    <p class="text-foreground/40 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Would Chat Ops</p>
                    <p class="text-2xl font-black text-primary tracking-tighter">{data.potentialActions.wouldChatOps}</p>
                    <p class="text-foreground/50 text-[10px] mt-4 font-medium italic">Historic detections that would have resulted in chat ops</p>
                </div>
                <div class="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-3xl transition-transform group-hover:scale-110"></div>
                    <p class="text-foreground/40 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Would Contain</p>
                    <p class="text-2xl font-black text-primary tracking-tighter">{data.potentialActions.wouldContain}</p>
                    <p class="text-foreground/50 text-[10px] mt-4 font-medium italic">Historic detections that would have resulted in containment</p>
                </div>
            </div>
        </ReportSection>
</ReportPage>
