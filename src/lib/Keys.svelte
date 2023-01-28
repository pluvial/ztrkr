<script lang="ts">
	export let active: number[] = [];
	export let highlighted: number[] = [];
	export let pressed: number[] = [];
</script>

<ol>
	{#each { length: 16 } as _, step}
		<li
			class:active={active.includes(step)}
			class:highlighted={highlighted.includes(step)}
			class:pressed={pressed.includes(step)}
		>
			{step + 1}
		</li>
	{/each}
</ol>

<style>
	ol {
		width: 20em;
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		column-gap: 0.5em;
		row-gap: 0.5em;
		list-style: none;
		font-size: 2em;
	}

	li {
		width: 2em;
		border: 1px solid black;
		border-radius: 0.2em;
		text-align: center;
	}

	li:nth-child(4n + 1) {
		text-decoration: underline;
	}

	li.active {
		color: red;
		border-color: red;
	}

	li.highlighted {
		color: #eee;
	}

	li.pressed {
		color: #fff;
	}
</style>
