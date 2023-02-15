<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { keyToStep } from './keyboard';
	import { isNumber } from './utils';

	export let playing: boolean;
	export let scale: number;
	export let length: number;

	const dispatch = createEventDispatcher();

	let activeKeys = new Set<string>();
	let pressedKeys = new Set<string>();

	$: pressedSteps = Array.from(pressedKeys.keys(), keyToStep).filter(isNumber);

	function keydown(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, metaKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, metaKey, shiftKey });

		// immediate key presses, always triggered, retrigger when held
		switch (key) {
			case 'ArrowUp':
				if (shiftKey) dispatch('scale-change', scale / 2);
				else if (ctrlKey || metaKey) dispatch('length-change', length / 2);
				else dispatch('length-change', length - 1);
				event.preventDefault();
				return;
			case 'ArrowDown':
				if (shiftKey) dispatch('scale-change', scale * 2);
				else if (ctrlKey || metaKey) dispatch('length-change', length * 2);
				else dispatch('length-change', length + 1);
				event.preventDefault();
				return;
			case 'ArrowLeft':
				dispatch('track-prev');
				return;
			case 'ArrowRight':
				dispatch('track-next');
				return;
			case 'Tab':
				if (shiftKey) dispatch('track-prev');
				else dispatch('track-next');
				event.preventDefault();
				return;
		}

		// debounced key presses, do not retrigger when held down
		if (!pressedKeys.has(key)) {
			pressedKeys.add(key);
			pressedKeys = pressedKeys;

			switch (key) {
				case ' ':
					if (shiftKey) {
						dispatch('stop');
						if (!playing) dispatch('play');
					} else {
						if (!playing) dispatch('play');
						else dispatch('pause');
					}
					event.preventDefault();
					return;
				case 'End':
				case 'PageDown':
					dispatch('track-change', 15);
					event.preventDefault();
					return;
				case 'Home':
				case 'PageUp':
					dispatch('track-change', 0);
					event.preventDefault();
					return;
				case 'Delete':
				case 'Backspace':
					// delete all tracks sequence, length and scale data
					if ((ctrlKey || metaKey) && shiftKey) dispatch('pattern-clear');
					// delete all tracks sequence data
					else if (shiftKey) dispatch('tracks-clear');
					// delete currente track sequence
					else dispatch('track-clear');
					return;
			}

			const step = keyToStep(key);
			if (step !== undefined) {
				dispatch('step-toggle', step);
				return;
			}
			if (activeKeys.has(key)) {
				activeKeys.delete(key);
				if (key === '?') dispatch('help-disable');
			} else {
				activeKeys.add(key);
				if (key === '?') dispatch('help-enable');
			}
			activeKeys = activeKeys;
		}
	}

	function keypress(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		if (pressedKeys.has(key)) {
			// pressed.delete(key);
			// pressed = pressed;
		}
	}

	function keyup(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		if (pressedKeys.has(key)) {
			pressedKeys.delete(key);
			pressedKeys = pressedKeys;
		}
	}
</script>

<div on:keydown={keydown} on:keypress={keypress} on:keyup={keyup} style:display="contents">
	<slot {pressedSteps} />
</div>
