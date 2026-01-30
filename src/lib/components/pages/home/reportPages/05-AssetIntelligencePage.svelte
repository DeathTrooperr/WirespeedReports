<script lang="ts">
    import type { ReportData } from '$lib/scripts/types/report.types.js';
    import ReportPage from '../layout/ReportPage.svelte';
    import ReportSection from '../layout/ReportSection.svelte';

    let { data, pageNumber, totalPages }: { data: ReportData, pageNumber: number, totalPages: number } = $props();
</script>

<ReportPage 
    {pageNumber} 
    {totalPages}
    reportPeriodLabel={data.reportPeriodLabel}
    branding={data.branding}
>
    <ReportSection 
        title="Asset Analysis" 
        isMain={true}
        flexGrow={true}
    >
    <!-- DEVICE OVERVIEW -->
    <div class="grid grid-cols-5 gap-6 mb-6">
        <div class="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden group">
            <div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg fill="currentColor" class="w-6 h-6" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1863.53 1016.437c31.171 0 56.47 25.299 56.47 56.47v790.589c0 16.376-7.115 31.849-19.313 42.465-10.39 9.149-23.605 14.005-37.158 14.005-2.484 0-5.082-.113-7.567-.452l-903.53-123.331c-28.008-3.84-48.903-27.784-48.903-56.02v-667.256c0-31.171 25.3-56.47 56.471-56.47Zm-1129.412 0c31.171 0 56.47 25.299 56.47 56.47v634.504c0 16.376-7.115 31.85-19.426 42.579-10.39 9.035-23.491 13.891-37.044 13.891-2.485 0-5.196-.113-7.68-.564L48.79 1669.35C20.78 1665.51 0 1641.68 0 1613.444v-540.537c0-31.171 25.299-56.47 56.47-56.47Zm-7.726-859.855c16.151-2.372 32.415 2.597 44.725 13.327 12.424 10.73 19.426 26.315 19.426 42.579V846.99c0 31.285-25.186 56.47-56.47 56.47H56.424c-31.171 0-56.47-25.185-56.47-56.47V306.455c0-28.123 20.781-52.066 48.79-55.906ZM1855.974.474c16.15-2.033 32.414 2.71 44.724 13.44 12.198 10.73 19.313 26.203 19.313 42.466v790.588c0 31.285-25.299 56.471-56.47 56.471H960.01c-31.171 0-56.47-25.186-56.47-56.47V179.711c0-28.235 20.78-52.066 48.903-55.906Z" fill-rule="evenodd"/>
                </svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Windows</p>
            <p class="text-2xl font-black text-primary tracking-tighter">{data.endpointsByOS.windows}</p>
        </div>

        <div class="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden group">
            <div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7" viewBox="-1.5 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="Dribbble-Light-Preview" transform="translate(-102.000000, -7439.000000)" fill="currentColor">
                            <g id="icons" transform="translate(56.000000, 160.000000)">
                                <path d="M57.5708873,7282.19296 C58.2999598,7281.34797 58.7914012,7280.17098 58.6569121,7279 C57.6062792,7279.04 56.3352055,7279.67099 55.5818643,7280.51498 C54.905374,7281.26397 54.3148354,7282.46095 54.4735932,7283.60894 C55.6455696,7283.69593 56.8418148,7283.03894 57.5708873,7282.19296 M60.1989864,7289.62485 C60.2283111,7292.65181 62.9696641,7293.65879 63,7293.67179 C62.9777537,7293.74279 62.562152,7295.10677 61.5560117,7296.51675 C60.6853718,7297.73474 59.7823735,7298.94772 58.3596204,7298.97372 C56.9621472,7298.99872 56.5121648,7298.17973 54.9134635,7298.17973 C53.3157735,7298.17973 52.8162425,7298.94772 51.4935978,7298.99872 C50.1203933,7299.04772 49.0738052,7297.68074 48.197098,7296.46676 C46.4032359,7293.98379 45.0330649,7289.44985 46.8734421,7286.3899 C47.7875635,7284.87092 49.4206455,7283.90793 51.1942837,7283.88393 C52.5422083,7283.85893 53.8153044,7284.75292 54.6394294,7284.75292 C55.4635543,7284.75292 57.0106846,7283.67793 58.6366882,7283.83593 C59.3172232,7283.86293 61.2283842,7284.09893 62.4549652,7285.8199 C62.355868,7285.8789 60.1747177,7287.09489 60.1989864,7289.62485" id="apple-[#173]">
                                </path>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">macOS</p>
            <p class="text-2xl font-black text-primary tracking-tighter">{data.endpointsByOS.macos}</p>
        </div>

        <div class="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden group">
            <div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="currentColor" d="M8.294 1c-.09 0-.184.005-.28.012-2.465.194-1.811 2.804-1.85 3.674-.043.637-.174 1.14-.612 1.762-.516.613-1.24 1.604-1.584 2.637-.162.485-.24.982-.167 1.452a.247.247 0 00-.064.079c-.152.156-.263.35-.387.49-.116.115-.283.155-.465.232-.183.08-.384.157-.504.397a.78.78 0 00-.077.351c0 .116.016.234.032.313.034.233.068.425.023.566-.145.396-.163.668-.062.865.102.195.313.275.549.351.472.117 1.114.079 1.618.35.54.272 1.088.39 1.526.274.307-.067.566-.27.705-.552.342-.001.717-.157 1.318-.194.408-.034.918.155 1.503.116.015.078.037.116.067.194l.001.002c.229.454.65.66 1.1.625.45-.035.928-.313 1.316-.762.368-.446.982-.632 1.387-.877.203-.116.367-.273.379-.497.013-.234-.117-.473-.417-.803v-.056l-.002-.002c-.099-.117-.145-.312-.197-.54-.05-.234-.106-.459-.287-.61h-.001c-.035-.032-.072-.04-.11-.08a.208.208 0 00-.11-.037c.25-.745.153-1.487-.102-2.154-.31-.823-.854-1.54-1.269-2.032-.464-.587-.919-1.142-.91-1.965.016-1.255.138-3.578-2.067-3.581zm.309 1.986h.007c.125 0 .231.036.34.116a.89.89 0 01.256.31c.062.152.093.268.097.423 0-.012.004-.023.004-.035v.061a.05.05 0 01-.003-.012l-.002-.014c-.001.142-.03.282-.087.412a.556.556 0 01-.125.195.415.415 0 00-.051-.024c-.06-.027-.115-.038-.166-.078a.765.765 0 00-.128-.038c.03-.035.085-.078.107-.116a.69.69 0 00.051-.234V3.94a.706.706 0 00-.035-.233c-.027-.079-.06-.117-.107-.195-.05-.038-.098-.077-.156-.077h-.01c-.054 0-.102.018-.152.077a.467.467 0 00-.12.195.688.688 0 00-.052.234v.01c0 .053.004.105.011.156-.112-.039-.255-.078-.354-.117a.954.954 0 01-.01-.117V3.86a1.034 1.034 0 01.087-.448.63.63 0 01.251-.31.575.575 0 01.347-.117zm-1.728.035h.02c.084 0 .158.028.234.078a.806.806 0 01.2.272c.053.116.082.233.09.389v.002a.856.856 0 01-.002.155v.047l-.048.014c-.089.032-.16.079-.23.117a.633.633 0 00.002-.156V3.93c-.007-.078-.023-.117-.047-.194a.358.358 0 00-.097-.156.145.145 0 00-.107-.037h-.012c-.042.003-.076.023-.109.077a.322.322 0 00-.07.157.55.55 0 00-.013.193v.008c.007.08.021.117.047.195a.363.363 0 00.096.157c.006.005.012.01.02.014-.04.033-.068.04-.102.079a.177.177 0 01-.077.04 1.53 1.53 0 01-.16-.235 1.034 1.034 0 01-.09-.389c-.01-.132.005-.264.046-.39a.834.834 0 01.165-.312c.075-.077.152-.116.244-.116zm.799.995c.194 0 .428.038.71.233.17.116.304.157.613.273h.002c.149.079.236.155.279.232v-.076a.333.333 0 01.009.274c-.072.18-.301.375-.62.491v.001c-.156.08-.292.195-.452.272-.161.078-.343.17-.59.155a.664.664 0 01-.262-.039 2.077 2.077 0 01-.188-.115c-.113-.079-.211-.194-.357-.271v-.003h-.003c-.233-.144-.359-.299-.4-.414-.04-.157-.003-.275.113-.35.13-.08.221-.159.282-.197.06-.043.083-.059.102-.076h.001v-.002c.099-.117.255-.274.49-.35.08-.021.171-.038.272-.038h-.001zm1.633 1.25c.21.826.698 2.026 1.012 2.609.167.311.5.967.643 1.764.091-.003.193.01.3.037.376-.975-.319-2.022-.636-2.314-.128-.116-.135-.195-.071-.195.344.312.796.917.96 1.608.075.312.093.644.012.974.039.017.079.035.12.04.601.311.824.547.717.896v-.025c-.035-.002-.07 0-.105 0h-.01c.089-.272-.106-.481-.62-.714-.534-.233-.96-.196-1.033.271-.005.025-.008.039-.01.079-.04.013-.082.03-.123.037-.25.157-.386.39-.462.693-.076.31-.1.674-.12 1.09v.002c-.011.195-.099.489-.186.787-.875.626-2.088.897-3.12.195a1.543 1.543 0 00-.234-.31.846.846 0 00-.16-.195.963.963 0 00.27-.04.359.359 0 00.184-.194c.063-.156 0-.407-.201-.678-.201-.273-.543-.58-1.043-.888-.368-.233-.575-.507-.671-.814-.096-.312-.083-.633-.009-.96.143-.624.51-1.23.743-1.611.063-.038.022.078-.238.568-.23.438-.665 1.456-.07 2.248.022-.578.15-1.146.377-1.678.329-.745 1.016-2.044 1.07-3.073.029.021.127.08.17.118.126.078.22.194.343.271a.694.694 0 00.511.196l.065.003c.24 0 .425-.078.581-.156.17-.078.304-.195.432-.233h.003c.272-.08.487-.235.609-.409zm1.275 5.225c.021.35.2.726.514.803.343.078.837-.194 1.045-.446l.123-.006c.184-.004.337.006.494.156l.002.002c.121.116.178.31.228.511.05.233.09.455.239.622.283.307.376.528.37.665l.003-.004v.01l-.002-.007c-.009.153-.108.231-.29.347-.368.234-1.02.416-1.434.916-.36.43-.8.665-1.188.695-.387.03-.721-.117-.918-.524l-.003-.002c-.122-.233-.07-.597.033-.985.103-.39.25-.784.27-1.107.022-.417.044-.779.114-1.058.07-.271.18-.465.374-.574l.026-.013v-.001zm-6.308.028h.006a.53.53 0 01.091.009c.22.032.412.194.597.438l.53.97.003.003c.141.31.44.62.693.955.253.348.45.66.425.915v.004c-.033.434-.28.67-.656.755-.376.079-.887 0-1.397-.27-.565-.314-1.235-.274-1.667-.352-.215-.039-.355-.117-.421-.233-.064-.117-.066-.352.071-.718v-.002l.002-.002c.068-.195.017-.439-.016-.652-.032-.234-.049-.414.025-.549.093-.194.23-.233.402-.31.172-.08.374-.118.534-.275h.001c.15-.157.26-.351.39-.49.11-.117.222-.196.387-.196zM8.45 5.226c-.254.117-.551.312-.868.312-.316 0-.566-.155-.747-.272-.09-.078-.163-.156-.217-.195-.096-.078-.084-.194-.044-.194.064.01.076.078.117.117.056.038.125.116.21.194.17.116.396.272.68.272.283 0 .615-.156.816-.272.114-.078.26-.194.378-.272.09-.08.087-.156.163-.156.074.01.02.078-.086.194-.13.098-.264.189-.403.273zm-.631-.923V4.29c-.004-.012.007-.024.017-.03.043-.024.105-.015.151.003.037 0 .094.04.088.079-.004.029-.05.038-.079.038-.032 0-.054-.025-.082-.04-.03-.01-.085-.004-.095-.037zm-.322 0c-.011.034-.066.028-.097.038-.027.015-.05.04-.081.04-.03 0-.076-.012-.08-.04-.005-.038.052-.077.088-.077.047-.018.107-.028.151-.003.011.005.021.017.018.029v.012h.001z"/></svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Linux</p>
            <p class="text-2xl font-black text-primary tracking-tighter">{data.endpointsByOS.linux}</p>
        </div>

        <div class="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden group">
            <div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg fill="currentColor" class="w-9 h-9" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M20.629 5h-9.257a1.6 1.6 0 0 0-1.601 1.603V25.4a1.6 1.6 0 0 0 1.601 1.601h9.257c.883 0 1.6-.718 1.6-1.601V6.603c0-.885-.717-1.603-1.6-1.603zm-6.247 1.023h3.302v.768h-3.302v-.768zm1.619 19.395a1.024 1.024 0 0 1-1.023-1.021 1.023 1.023 0 0 1 2.044 0c-.001.494-.46 1.021-1.021 1.021zm5.028-3.501H10.971V7.704h10.058v14.213z"/></svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Mobile</p>
            <p class="text-2xl font-black text-primary tracking-tighter">{data.endpointsByOS.mobile}</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden group">
            <div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg fill="currentColor" class="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23 3H3a1.001 1.001 0 0 0-1 1v2h1V4h20v13H9v1h2v1h-1v1h6v-1h-1v-1h8a1.001 1.001 0 0 0 1-1V4a1.001 1.001 0 0 0-1-1zm-9 16h-2v-1h2zM7.25 7H.75a.751.751 0 0 0-.75.75v13.5a.751.751 0 0 0 .75.75h6.5a.751.751 0 0 0 .75-.75V7.75A.751.751 0 0 0 7.25 7zM7 21H1V8h6zM6 10H2V9h4zm0 2H2v-1h4zm0 2H2v-1h4zm-1 1h1v1H5z"/><path fill="none" d="M0 0h24v24H0z"/></svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Other</p>
            <p class="text-2xl font-black text-primary tracking-tighter">{data.endpointsByOS.other}</p>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-8 mb-6">
        <!-- MOST ATTACKED ENDPOINTS -->
        <section>
            <h3 class="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <span class="w-8 h-px bg-primary/30"></span>
                <svg class="w-3.5 h-3.5 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Most Attacked Endpoints
            </h3>
            <div class="space-y-2">
                {#each data.mostAttackedEndpoints as item}
                    <div class="group relative bg-white px-4 py-3 rounded-xl border border-gray-100 transition-all shadow-sm hover:shadow-md flex items-center gap-4 overflow-hidden">
                        <div class="absolute inset-y-0 left-0 w-1 bg-primary/20 group-hover:w-1.5 transition-all"></div>
                        <div class="relative z-10 flex-grow">
                            <div class="flex justify-between items-center mb-0">
                                <span class="text-[11px] font-black text-foreground/80 leading-tight truncate pr-4">{item.name}</span>
                                <span class="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded-md border border-primary/10">{item.count}</span>
                            </div>
                        </div>
                    </div>
                {/each}
                {#if data.mostAttackedEndpoints.length === 0}
                    <div class="py-3 text-center bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
                        <p class="text-[10px] font-black text-foreground/30 px-2 py-0.5 uppercase tracking-[0.2em] italic">No endpoint attacks detected</p>
                    </div>
                {/if}
            </div>
        </section>

        <!-- MOST ATTACKED IDENTITIES -->
        <section>
            <h3 class="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <span class="w-8 h-px bg-primary/30"></span>
                <svg class="w-3.5 h-3.5 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Most Attacked Identities
            </h3>
            <div class="space-y-2">
                {#each data.mostAttackedIdentities as item}
                    <div class="group relative bg-white px-4 py-3 rounded-xl border border-gray-100 transition-all shadow-sm hover:shadow-md flex items-center gap-4 overflow-hidden">
                        <div class="absolute inset-y-0 left-0 w-1 bg-primary/20 group-hover:w-1.5 transition-all"></div>
                        <div class="relative z-10 flex-grow">
                            <div class="flex justify-between items-center mb-0">
                                <span class="text-[11px] font-black text-foreground/80 leading-tight truncate pr-4">{item.name}</span>
                                <span class="text-[10px] font-black text-primary px-2 py-0.5 bg-primary/5 rounded-md border border-primary/10">{item.count}</span>
                            </div>
                        </div>
                    </div>
                {/each}
                {#if data.mostAttackedIdentities.length === 0}
                    <div class="py-3 text-center bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
                        <p class="text-[10px] font-black text-foreground/30 px-2 py-0.5 uppercase tracking-[0.2em] italic">No identity attacks detected</p>
                    </div>
                {/if}
            </div>
        </section>
    </div>

    <!-- SUSPICIOUS LOGIN LOCATIONS -->
    <section>
        <h3 class="text-foreground/40 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
            <span class="w-8 h-px bg-primary/30"></span>
            <svg class="w-3.5 h-3.5 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Suspicious Login Locations
        </h3>
        <div class="grid grid-cols-2 gap-4">
            {#each data.suspiciousLoginLocations as item}
                <div class="group relative bg-white px-4 py-3 rounded-xl border border-gray-100 transition-all shadow-sm hover:shadow-md flex items-center gap-4 overflow-hidden">
                    <div class="absolute inset-y-0 left-0 w-1 bg-red-500/20 group-hover:w-1.5 transition-all"></div>
                    <div class="relative z-10 flex-grow">
                        <div class="flex justify-between items-center">
                            <span class="text-[11px] font-black text-foreground/80 leading-tight">{item.country}</span>
                            <span class="text-[10px] font-black text-red-600 px-2 py-0.5 bg-red-50 rounded-md border border-red-100">{item.count}</span>
                        </div>
                    </div>
                </div>
            {/each}
            {#if data.suspiciousLoginLocations.length === 0}
                <div class="col-span-2 py-12 text-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                    <p class="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] italic">No suspicious login activity detected</p>
                </div>
            {/if}
        </div>
    </section>
    </ReportSection>
</ReportPage>
