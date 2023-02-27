{#each ['w', 'r', 'g', 'b', 'c', 'm', 'y'] as color}
	<ul>
		{#each { length: 8 } as _, i}
			{@const css_var = `--${color}${(2 * i + 1).toString(16)}`}
			<li style:background-color="var({css_var})">{css_var}</li>
		{/each}
	</ul>
{/each}

<style>
	ul {
		display: flex;
	}

	li {
		flex: 1;
		height: 5em;
		text-align: center;
		line-height: 5em;
	}

	:root {
		/* white */
		--w1: #111;
		--w3: #333;
		--w5: #555;
		--w7: #777;
		--w9: #999;
		--wb: #bbb;
		--wd: #ddd;
		--wf: #fff;

		/* red */
		--r1: #100;
		--r3: #300;
		--r5: #500;
		--r7: #700;
		--r9: #900;
		--rb: #b00;
		--rd: #d00;
		--rf: #f00;

		/* green */
		--g1: #010;
		--g3: #030;
		--g5: #050;
		--g7: #070;
		--g9: #090;
		--gb: #0b0;
		--gd: #0d0;
		--gf: #0f0;

		/* blue */
		--b1: #001;
		--b3: #003;
		--b5: #005;
		--b7: #007;
		--b9: #009;
		--bb: #00b;
		--bd: #00d;
		--bf: #00f;

		/* cyan */
		--c1: #011;
		--c3: #033;
		--c5: #055;
		--c7: #077;
		--c9: #099;
		--cb: #0bb;
		--cd: #0dd;
		--cf: #0ff;

		/* magenta */
		--m1: #101;
		--m3: #303;
		--m5: #505;
		--m7: #707;
		--m9: #909;
		--mb: #b0b;
		--md: #d0d;
		--mf: #f0f;

		/* yellow */
		--y1: #110;
		--y3: #330;
		--y5: #550;
		--y7: #770;
		--y9: #990;
		--yb: #bb0;
		--yd: #dd0;
		--yf: #ff0;
	}
</style>
