<script lang="ts">
  export let list = [
    { name: 'foo', id: 0 },
    { name: 'bar', id: 1 },
    { name: 'bob', id: 2 },
    { name: 'jean', id: 3 }
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

<div class="flex flex-col items-stretch gap-4 rounded-md bg-gray-800 p-2">
  {#each list as n, index (n.id)}
    <div role="listitem" class="flex gap-2 rounded-md" draggable={true} on:dragstart={(event) => dragstart(event, index)} on:drop|preventDefault={(event) => drop(event, index)} on:dragover={() => false} on:dragenter={() => (hovering = index)} class:is-active={hovering === index}>
      <input class="w-full rounded-md bg-gray-700 px-4 py-2" bind:value={n.name} placeholder="Username" />
      <button on:click={() => (list = list.filter((_, i) => i !== index))}>
        <svg xmlns="http://www.w3.org/2000/svg" class="fill-red-500/80" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
      </button>
    </div>
  {/each}
  <button on:click={() => (list = [...list, { name: '', id: nextId++ }])} type="button" class="rounded-md bg-gray-700 p-1 px-4">Add Player</button>
</div>

<style>
  .is-active {
    background-color: #3273dc;
    color: #fff;
  }
</style>
