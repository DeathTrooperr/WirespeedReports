<script lang="ts">
    import { fade } from 'svelte/transition';

    let { message = "This application is optimized for desktop use. Please switch to a larger screen for the best experience." } = $props();
</script>

<div 
    class="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
    transition:fade
>
    <div class="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 text-center space-y-6">
        <div class="flex justify-center items-center gap-4 text-primary/20">
            <!-- Smartphone -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            
            <!-- Tablet -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>
            
            <!-- Monitor -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16 text-primary"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        </div>
        
        <div class="space-y-2">
            <h2 class="text-2xl font-black text-foreground tracking-tighter uppercase">Incompatible Device</h2>
            <div class="h-1 w-12 bg-primary/20 rounded-full mx-auto"></div>
        </div>

        <p class="text-foreground/60 text-sm leading-relaxed font-medium italic">
            {message}
        </p>

        <div class="pt-4">
            <button 
                onclick={() => window.location.reload()}
                class="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity"
            >
                Retry Connection
            </button>
        </div>
        
        <p class="text-[8px] text-foreground/30 uppercase font-black tracking-[0.2em]">Wirespeed Security Operations</p>
    </div>
</div>
