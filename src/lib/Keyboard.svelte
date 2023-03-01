<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { keyToStep } from './keyboard';
	import { KeysMode, Mode } from './state';
	import { isNumber } from './utils';

	export let mode: Mode;
	export let keysMode: KeysMode;
	export let helpMode: boolean;
	export let playing: boolean;
	export let scale: number;
	export let length: number;

	const dispatch = createEventDispatcher();

	let pressedKeys = new Set<string>();
	let lastPressedKey: string;
	let lastReleasedKey: string;
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
				case 'Escape':
					event.preventDefault();
					if (shiftKey && keysMode !== KeysMode.Keyboard)
						dispatch('keys-mode-push', KeysMode.Keyboard);
					else if (shiftKey && keysMode === KeysMode.Keyboard)
						dispatch('keys-mode-pop', KeysMode.Keyboard);
					return;
				case '`':
				case '~':
					if (shiftKey) {
						console.log({ lastReleasedKey, mode: keysMode });
						if (keysMode === KeysMode.TrackMutes) {
							dispatch('keys-mode-pop', KeysMode.TrackMutes);
							if (lastReleasedKey === '~') dispatch('keys-mode-push', KeysMode.PatternMutes);
						} else if (keysMode === KeysMode.PatternMutes) {
							dispatch('keys-mode-pop', KeysMode.PatternMutes);
							if (lastReleasedKey === '~') dispatch('keys-mode-push', KeysMode.TrackMutes);
						} else dispatch('keys-mode-push', KeysMode.TrackMutes);
					}
					return;
				case 'z':
				case 'Z':
					if (shiftKey && mode !== Mode.StepRec) dispatch('mode-set', Mode.StepRec);
					else if (altKey && mode !== Mode.LiveRec) dispatch('mode-set', Mode.LiveRec);
					else if (mode === Mode.Default) dispatch('mode-set', Mode.GridRec);
					else dispatch('mode-set', Mode.Default);
					return;
				case '?':
					if (helpMode) dispatch('help-disable');
					else dispatch('help-enable');
					return;
			}

			const step = keyToStep(key);
			if (step !== undefined) {
				switch (keysMode) {
					case KeysMode.Default:
						switch (mode) {
							case Mode.Default:
								dispatch('trigger-track', step);
								break;
							case Mode.GridRec:
								dispatch('step-toggle', step);
								break;
							case Mode.StepRec:
								// TODO
								break;
							case Mode.LiveRec:
								dispatch('rec-trigger-track', step);
								break;
						}
						break;
					case KeysMode.TrackChange:
						dispatch('track-change', step);
						break;
					case KeysMode.Keyboard:
						switch (mode) {
							case Mode.LiveRec:
								dispatch('rec-trigger-note', step);
								break;
							default:
								dispatch('trigger-note', step);
						}
						break;
					case KeysMode.TrackMutes:
						dispatch('track-mute-toggle', step);
						break;
					case KeysMode.PatternMutes:
						dispatch('pattern-mute-toggle', step);
						break;
				}
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

		lastReleasedKey = key;

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
