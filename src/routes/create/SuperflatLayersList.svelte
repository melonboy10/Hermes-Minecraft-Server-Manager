<script lang="ts">
  export let list = [
    { block: 'foo', height: 0, id: 0 },
    { block: 'bar', height: 0, id: 1 },
    { block: 'bob', height: 0, id: 2 },
    { block: 'jean', height: 0, id: 3 }
  ];
  let hovering: number | null = null;
  let nextId = list.length;

  const drop = (
    event: DragEvent & {
      currentTarget: EventTarget & HTMLDivElement;
    },
    target: number
  ) => {
    if (!event.dataTransfer) return;

    event.dataTransfer.dropEffect = 'move';
    const start = parseInt(event.dataTransfer.getData('text/plain'));
    const newTracklist = list;

    if (start < target) {
      newTracklist.splice(target + 1, 0, newTracklist[start]);
      newTracklist.splice(start, 1);
    } else {
      newTracklist.splice(target, 0, newTracklist[start]);
      newTracklist.splice(start + 1, 1);
    }
    list = newTracklist;
    hovering = null;
  };

  const dragstart = (
    event: DragEvent & {
      currentTarget: EventTarget & HTMLDivElement;
    },
    i: number
  ) => {
    if (!event.dataTransfer) return;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    const start = i;
    event.dataTransfer.setData('text/plain', String(start));
  };
</script>

<div class="flex flex-col items-stretch rounded-md bg-gray-800 p-2">
  {#each list as n, index (n.id)}
    <!-- ondragover="return false" -->
    <div on:dragover={(event) => event.preventDefault()} role="listitem" class="flex gap-2 rounded-md p-2 before:text-2xl before:content-['≡']" draggable={true} on:dragstart={(event) => dragstart(event, index)} on:drop|preventDefault={(event) => drop(event, index)} on:dragenter={() => (hovering = index)} class:is-active={hovering === index}>
      <input class="w-full rounded-md bg-gray-700 px-4 py-2" bind:value={n.block} placeholder="Layer Block" />
      <input class="w-20 rounded-md bg-gray-700 py-2 pl-4 pr-2 text-center hover:pr-[0.4rem]" min="1" max="1000" type="number" bind:value={n.height} />
      <button on:click={() => (list = list.filter((_, i) => i !== index))}>
        <svg xmlns="http://www.w3.org/2000/svg" class="fill-red-500/80" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
      </button>
    </div>
  {/each}
  <button on:click={() => (list = [...list, { block: 'minecraft:dirt', height: 1, id: nextId++ }])} type="button" class="mt-4 rounded-md bg-gray-700 p-1 px-4">Add layer</button>
</div>

<style>
  .is-active {
    background-color: #3273dc;
    color: #fff;
  }
</style>
