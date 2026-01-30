<script lang="ts">
    import type { ReportData } from '$lib/scripts/types/report.types.js';

    let { pageNumber, totalPages, showDetails = false, branding }: { 
        pageNumber?: number, 
        totalPages?: number, 
        showDetails?: boolean,
        branding?: ReportData['branding']
    } = $props();

    const spWebsite = $derived.by(() => {
        if (!branding?.supportEmail) return '';
        const domain = branding.supportEmail.split('@')[1];
        return domain ? `www.${domain}` : '';
    });
</script>

<footer class="mt-auto pt-6 border-t border-gray-100 flex justify-between items-end text-foreground/40 text-[9px] font-black uppercase tracking-[0.2em]">
    <div>
        <div class="flex items-center gap-3 mb-2">
            <p class="text-primary font-black text-xs tracking-tighter">
                {branding?.spName ? 'Powered by Wirespeed' : 'Wirespeed by Coalition'}
            </p>
        </div>
        {#if showDetails}
            <p class="text-foreground/30 text-[9px] lowercase font-bold tracking-widest">
                {#if branding?.spName && branding?.supportEmail}
                    <a href="https://{spWebsite}" class="hover:text-primary transition-colors no-underline">{spWebsite}</a> 
                    <span class="mx-2 opacity-30">|</span> 
                    <a href="mailto:{branding.supportEmail}" class="hover:text-primary transition-colors no-underline">{branding.supportEmail}</a>
                {:else}
                    <a href="https://wirespeed.co" class="hover:text-primary transition-colors no-underline">wirespeed.co</a> 
                    <span class="mx-2 opacity-30">|</span> 
                    <a href="mailto:support@wirespeed.co" class="hover:text-primary transition-colors no-underline">support@wirespeed.co</a>
                {/if}
            </p>
        {:else}
            <p class="opacity-50 font-bold">Confidential & Proprietary</p>
        {/if}
    </div>
    <div class="text-right flex flex-col items-end">
        {#if pageNumber}
            <div class="flex items-center gap-4">
                <div class="flex flex-col items-end">
                    <p class="text-foreground/40 text-[7px] font-black uppercase tracking-[0.4em] leading-none mb-1">Page</p>
                    <p class="text-primary font-black text-xl leading-none tracking-tighter">
                        {pageNumber.toString().padStart(2, '0')}
                        {#if totalPages}
                            <span class="text-foreground/20 mx-0.5 font-medium tracking-normal italic">/</span>
                            <span class="text-foreground/40 text-xs font-bold tracking-normal">{totalPages.toString().padStart(2, '0')}</span>
                        {/if}
                    </p>
                </div>
                <div class="w-px h-10 bg-gray-200"></div>
            </div>
        {:else if !showDetails}
            <p class="opacity-50 font-bold text-[9px] uppercase tracking-[0.2em]">Classified</p>
        {/if}
    </div>
</footer>
