<script lang="ts">
    import { fade, scale, slide } from 'svelte/transition';
    import type { AppError } from '$lib/scripts/types/report.types.js';

    let { error, onDismiss }: { error: AppError, onDismiss: () => void } = $props();

    let showDetails = $state(false);
    let copied = $state(false);

    function copyErrorDetails() {
        const text = `Error: ${error.message}
Code: ${error.code || 'N/A'}
Timestamp: ${error.timestamp}
Details: ${error.details || 'None'}`;
        
        navigator.clipboard.writeText(text);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }
</script>

<div 
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden"
>
    <div 
        transition:scale={{ duration: 300, start: 0.95 }}
        class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-100"
    >
        <!-- Header -->
        <div class="bg-red-500 p-6 text-white relative">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div class="relative z-10 flex items-center gap-4">
                <div class="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div>
                    <h3 class="text-xl font-black uppercase tracking-tight">System Exception</h3>
                    <p class="text-white/80 text-[10px] font-bold uppercase tracking-widest">{error.code || 'Error'}</p>
                </div>
                <button 
                    onclick={onDismiss}
                    class="ml-auto hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                    aria-label="Dismiss error"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>
        
        <div class="p-8 space-y-6">
            <div class="space-y-2">
                <p class="text-gray-900 text-lg font-bold leading-tight">
                    {error.message}
                </p>
                {#if error.retryable}
                    <p class="text-gray-500 text-sm italic font-medium">
                        This issue may be temporary. Please verify your settings and try again.
                    </p>
                {/if}
            </div>

            <div class="flex items-center gap-3">
                <button 
                    onclick={() => showDetails = !showDetails}
                    class="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                >
                    {showDetails ? 'Hide' : 'View'} Technical Details
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 transition-transform {showDetails ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="h-px flex-grow bg-gray-100"></div>
            </div>

            {#if showDetails}
                <div transition:slide={{ duration: 200 }} class="space-y-4">
                    <div class="bg-gray-50 rounded-xl p-4 font-mono text-[11px] text-gray-600 border border-gray-100 relative group">
                        <div class="flex justify-between items-center mb-2">
                            <div class="flex items-center gap-2">
                                <span class="text-[9px] font-black uppercase tracking-widest text-gray-400">Error Context</span>
                                <button 
                                    onclick={copyErrorDetails}
                                    class="text-gray-400 hover:text-red-500 transition-all active:scale-90 flex items-center justify-center p-0.5"
                                    title={copied ? "Copied" : "Copy details"}
                                >
                                    {#if copied}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    {:else}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    {/if}
                                </button>
                            </div>
                            <span class="text-[9px] font-medium text-gray-400">{error.timestamp}</span>
                        </div>
                        <p class="break-words mb-2 leading-relaxed">{error.details || 'No additional details available.'}</p>
                    </div>
                </div>
            {/if}
            
            <div class="flex gap-3">
                <button 
                    onclick={onDismiss}
                    class="flex-1 bg-gray-900 text-white font-black py-4 rounded-xl hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                >
                    Dismiss
                </button>
                {#if error.retryable}
                    <button 
                        onclick={() => { onDismiss(); }} 
                        class="flex-1 bg-red-500 text-white font-black py-4 rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                    >
                        Try Again
                    </button>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Ensure slide transition works correctly */
</style>
