<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { keyToStep } from './keyboard';
	import { KeysMode, Mode } from './state';
	import { isNumber } from './utils';

	export let mode: Mode;
	export let keysMode: KeysMode;
	export let playing: boolean;
	export let scale: number;
	export let length: number;

	const dispatch = createEventDispatcher();

	const activeKeys = new Set<string>();

	let pressedKeys = new Set<string>();
	let lastPressedKey: string;
	const pressTimes = new Map<string, number | undefined>();

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
				event.preventDefault();
				break;
			// case 'Tab':
			// 	if (shiftKey) dispatch('track-prev');
			// 	else dispatch('track-next');
			// 	event.preventDefault();
			// 	return;
		}

		// debounced key presses, do not retrigger when held down
		if (!pressedKeys.has(key)) {
			pressedKeys.add(key);
			pressedKeys = pressedKeys;

			lastPressedKey = key;
			pressTimes.set(key, performance.now());

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
				case 'Tab':
					dispatch('keys-mode-push', KeysMode.TrackChange);
					return;
			}

			const step = keyToStep(key);
			if (step !== undefined) {
				switch (keysMode) {
					case KeysMode.Default:
						switch (mode) {
							case Mode.Default:
								// TODO
								break;
							case Mode.GridRec:
								dispatch('step-toggle', step);
								break;
							case Mode.StepRec:
								// TODO
								break;
							case Mode.LiveRec:
								// TODO
								break;
						}
						break;
					case KeysMode.TrackChange:
						dispatch('track-change', step);
						break;
					case KeysMode.Keyboard:
						// TODO
						break;
				}
			}
			if (activeKeys.has(key)) {
				activeKeys.delete(key);
				if (key === '?') dispatch('help-disable');
			} else {
				activeKeys.add(key);
				if (key === '?') dispatch('help-enable');
			}
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

			switch (key) {
				case 'Tab':
					const pressTime = pressTimes.get('Tab');
					if (
						lastPressedKey === 'Tab' &&
						pressTime !== undefined &&
						performance.now() - pressTime < 200
					)
						if (shiftKey) dispatch('track-prev');
						else dispatch('track-next');
					dispatch('keys-mode-pop', KeysMode.TrackChange);
					break;
			}
		}
	}
</script>

<div on:keydown={keydown} on:keypress={keypress} on:keyup={keyup} style:display="contents">
	<slot {pressedSteps} />
</div>
