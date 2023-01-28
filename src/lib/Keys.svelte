<script lang="ts">
	export let highlighted: string[] = [];
	export let pressed: string[] = [];

	const blocks = [
		['a', 's', 'd', 'f'],
		['g', 'h', 'j', 'k'],
		['z', 'x', 'c', 'v'],
		['b', 'n', 'm', ','],
	];

	const row1 = [...blocks[0], ...blocks[1]];
	const row2 = [...blocks[2], ...blocks[3]];
	const rows = [row1, row2];
</script>

{#each rows as row, r}
	<ol>
		{#each row as key, c}
			<li class:highlighted={highlighted.includes(key)} class:pressed={pressed.includes(key)}>
				{r * 8 + c + 1}
			</li>
		{/each}
	</ol>
{/each}

<style>
	ol {
		display: flex;
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

	li.highlighted {
		color: #eee;
	}

	li.pressed {
		color: red;
		border-color: red;
	}
</style>
