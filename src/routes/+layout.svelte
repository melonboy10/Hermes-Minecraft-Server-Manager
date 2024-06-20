<script lang="ts">
  import '../app.css';
  import type { LayoutServerData } from './$types';

  export let data: LayoutServerData;
</script>

<div class="flex w-full flex-col items-center gap-4 p-8 max-sm:p-2">
  <div class="flex w-full items-center justify-between gap-4">
    <a href="/" class="flex items-center gap-1">
      <img src="/wing.png" alt="Logo" class="h-10 w-10" />
      <div class="text-3xl font-black">Hermes</div>
    </a>
    <div>
      {#await data.allowCreate then allowCreate}
        {#if allowCreate}
          <a data-sveltekit-preload-data="off" href="/create" class="rounded-md border-2 border-primary bg-transparent p-2 px-4 text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-black">Create</a>
        {/if}
      {/await}
      <a href="/backups" class="rounded-md border-2 border-primary bg-transparent p-2 px-4 text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-black">Backups</a>
    </div>
  </div>
  <slot />
  <a class="text-sm text-gray-400" href="/update-results">Version: 0.6.0</a>
</div>
