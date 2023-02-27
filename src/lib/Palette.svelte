{#each ['w', 'r', 'g', 'b', 'c', 'm', 'y'] as color}
	<ul>
		{#each { length: 8 } as _, i}
			{@const css_var = `--${color}${(2 * i + 1).toString(16)}`}
			<li style:background-color="var({css_var})">{css_var}</li>
		{/each}
	</ul>
{/each}

<ul>
	{#each { length: 12 } as _, i}
		{@const css_var = `--i${(i + 1).toString(16)}`}
		<li style:background-color="var({css_var})">{css_var}</li>
	{/each}
</ul>

{#each { length: 12 } as _, j}
	<ul>
		{#each { length: 8 } as _, i}
			{@const css_var = `--i${(j + 1).toString(16)}${(2 * i + 1).toString(16)}`}
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
		color: #fff;
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

		/* 12-bit rainbow */
		--i1: #817;
		--i2: #a35;
		--i3: #c66;
		--i4: #e94;
		--i5: #ed0;
		--i6: #9d5;
		--i7: #4d8;
		--i8: #2cb;
		--i9: #0bc;
		--ia: #09c;
		--ib: #36b;
		--ic: #639;

		/* 12-bit rainbow demux */
		--i11: #110;
		--i13: #211;
		--i15: #312;
		--i17: #413;
		--i19: #514;
		--i1b: #615;
		--i1d: #716;
		--i1f: #817;

		--i21: #311;
		--i23: #411;
		--i25: #511;
		--i27: #611;
		--i29: #712;
		--i2b: #813;
		--i2d: #924;
		--i2f: #a35;

		--i31: #511;
		--i33: #611;
		--i35: #711;
		--i37: #822;
		--i39: #933;
		--i3b: #a44;
		--i3d: #b55;
		--i3f: #c66;

		--i41: #721;
		--i43: #831;
		--i45: #941;
		--i47: #a51;
		--i49: #b61;
		--i4b: #c72;
		--i4d: #d83;
		--i4f: #e94;

		--i51: #760;
		--i53: #870;
		--i55: #980;
		--i57: #a90;
		--i59: #ba0;
		--i5b: #cb0;
		--i5d: #dc0;
		--i5f: #ed0;

		--i61: #261;
		--i63: #371;
		--i65: #481;
		--i67: #591;
		--i69: #6a2;
		--i6b: #7b3;
		--i6d: #8c4;
		--i6f: #9d5;

		--i71: #151;
		--i73: #162;
		--i75: #173;
		--i77: #184;
		--i79: #195;
		--i7b: #2a6;
		--i7d: #3c7;
		--i7f: #4d8;

		--i81: #154;
		--i83: #165;
		--i85: #176;
		--i87: #187;
		--i89: #198;
		--i8b: #1a9;
		--i8d: #1ba;
		--i8f: #2cb;

		--i91: #045;
		--i93: #056;
		--i95: #067;
		--i97: #078;
		--i99: #089;
		--i9b: #09a;
		--i9d: #0ab;
		--i9f: #0bc;

		--ia1: #025;
		--ia3: #036;
		--ia5: #047;
		--ia7: #058;
		--ia9: #069;
		--iab: #07a;
		--iad: #08b;
		--iaf: #09c;

		--ib1: #114;
		--ib3: #115;
		--ib5: #116;
		--ib7: #127;
		--ib9: #138;
		--ibb: #149;
		--ibd: #25a;
		--ibf: #36b;

		--ic1: #112;
		--ic3: #113;
		--ic5: #114;
		--ic7: #215;
		--ic9: #316;
		--icb: #417;
		--icd: #528;
		--icf: #639;
	}
</style>
