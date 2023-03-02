<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { keyToStep } from './keyboard';
	import { KeysMode, Mode } from './state';
	import { isNumber, type N16 } from './utils';

	export let mode: Mode;
	export let keysMode: KeysMode;
	export let prevKeysMode: KeysMode | null = null;
	export let muteMode: KeysMode.TrackMutes | KeysMode.PatternMutes;
	export let helpMode: boolean;
	export let playing: boolean;
	export let selectedTrack: N16;
	export let scale: number;
	export let length: number;

	const dispatch = createEventDispatcher();

	let pressedKeys = new Set<string>();
	let lastPressedKey: string;
	let lastReleasedKey: string;
	const pressTimes = new Map<string, number | undefined>();
	const consecutivePresses = new Map<string, number>();

	$: pressedSteps = new Set(Array.from(pressedKeys, keyToStep).filter(isNumber));

	// debug logging
	// $: console.debug(pressedKeys);

	let hold = false;

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
			case '/':
				event.preventDefault();
				break;
		}

		// debounced key presses, do not retrigger when held down
		if (!pressedKeys.has(key)) {
			pressedKeys.add(key);
			pressedKeys = pressedKeys;
			consecutivePresses.set(
				key,
				key === lastPressedKey ? (consecutivePresses.get(key) ?? 0) + 1 : 1,
			);
			lastPressedKey = key;
			pressTimes.set(key, performance.now());

			switch (code) {
				// case ' ':
				case 'Space':
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
					dispatch('track-change', 15);
					event.preventDefault();
					return;
				case 'Home':
					dispatch('track-change', 0);
					event.preventDefault();
					return;
				case 'PageDown': {
					const next = selectedTrack < 4 ? 4 : selectedTrack < 8 ? 8 : selectedTrack < 12 ? 12 : 15;
					dispatch('track-change', next);
					event.preventDefault();
					return;
				}
				case 'PageUp': {
					const prev = selectedTrack > 12 ? 12 : selectedTrack > 8 ? 8 : selectedTrack > 4 ? 4 : 0;
					dispatch('track-change', prev);
					event.preventDefault();
					return;
				}
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
					if (shiftKey)
						if (keysMode !== KeysMode.Keyboard && prevKeysMode !== KeysMode.Keyboard)
							dispatch('keys-mode-push', KeysMode.Keyboard);
						else if (keysMode === KeysMode.Keyboard || prevKeysMode === KeysMode.Keyboard)
							dispatch('keys-mode-pop', KeysMode.Keyboard);
					return;
				// case 'Shift':
				case 'ShiftLeft':
				case 'ShiftRight':
					if (keysMode !== KeysMode.TrackMutes && keysMode !== KeysMode.PatternMutes) {
						dispatch('keys-mode-push', muteMode);
					}
					return;
				// case '`':
				// case '~':
				case 'Backquote':
				case 'IntlBackslash':
					if (shiftKey) {
						if ((consecutivePresses.get('~') as number) > 1) {
							hold = true;
							dispatch('keys-mode-pop', muteMode);
							dispatch(
								'keys-mode-push',
								muteMode === KeysMode.TrackMutes ? KeysMode.PatternMutes : KeysMode.TrackMutes,
							);
						} else hold = !hold;
					}
					return;
				// case 'z':
				// case 'Z':
				case 'KeyZ':
					if (shiftKey && mode !== Mode.StepRec) dispatch('mode-set', Mode.StepRec);
					else if (altKey && mode !== Mode.LiveRec) dispatch('mode-set', Mode.LiveRec);
					else if (mode === Mode.Default) dispatch('mode-set', Mode.GridRec);
					else dispatch('mode-set', Mode.Default);
					return;
				// case 'x':
				// case 'X':
				case 'KeyX':
					if (!playing) dispatch('play');
					else dispatch('pause');
					return;
				// case 'c':
				// case 'C':
				case 'KeyC':
					dispatch('stop');
					return;
				// case '?':
				case 'Slash':
					if (shiftKey)
						if (helpMode) dispatch('help-disable');
						else dispatch('help-enable');
					return;
			}

			const step = keyToStep(key);
			if (step !== undefined) {
				// TODO: revisit, currently needs to be kept in sync with Keys.svelte
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
				case 'Shift':
					if (!hold) dispatch('keys-mode-pop', muteMode);
					break;
			}
		}
	}
</script>

<div on:keydown={keydown} on:keypress={keypress} on:keyup={keyup} style:display="contents">
	<slot {pressedKeys} {pressedSteps} />
</div>
