<script lang="ts">
  // Variable for the error code
  export let errorCode: number = 404;
</script>

<div class="flex flex-col items-center gap-5 py-20">
  <div class="text-8xl font-bold text-red-400">{errorCode}</div>
  <div class="text-lg text-gray-200">Oops! The page you're looking for doesn't exist.</div>
  <a href="/" class="rounded-md border-2 border-primary bg-transparent p-2 px-4 text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-black">Go back to Home</a>
</div>
