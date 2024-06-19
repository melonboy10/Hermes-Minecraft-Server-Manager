<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import type { NotNull } from '$lib';
  import type { ActionResult } from '@sveltejs/kit';
  import type { ActionData } from './$types';

  type Success<T> = T extends { error?: undefined; value: infer V; action: infer A } ? { value: V; action: A } : never;
  type Failure<T> = T extends { value?: undefined; error: infer E; action: infer A } ? { error: E; action: A } : never;

  export let action: string;
  export let loading = false;
  export let text: string;
  export let disabled = false;
  export let invalidate = true;
  export let callback: (d: {
    formData: FormData;
    formElement: HTMLFormElement;
    action: URL;
    result: ActionResult<Success<NotNull<ActionData>>, Failure<NotNull<ActionData>>>;
    update(
      options?:
        | {
            reset?: boolean | undefined;
            invalidateAll?: boolean | undefined;
          }
        | undefined
    ): Promise<void>;
  }) => void = () => {};
  let clazz: string = '';
  export { clazz as class };
  export let buttonClass = '';
</script>

<form
  class={clazz}
  method="POST"
  {action}
  use:enhance={() => {
    loading = true;
    return async (data) => {
      if (invalidate) data.update();
      else applyAction(data.result);
      loading = false;
      // @ts-expect-error I made the type more specific
      if (callback) callback(data);
    };
  }}>
  <slot />
  <button class={`flex items-center rounded-md bg-gray-800 px-4 py-2 disabled:cursor-not-allowed disabled:bg-gray-900 ${buttonClass}`} disabled={disabled || loading} on:click|stopPropagation>
    {#if loading}
      <svg class="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    {text}
  </button>
</form>
