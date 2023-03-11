<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { codeToStep } from './keyboard';
	import { KeysMode, Mode } from './state';
	import { isNumber, type N16 } from './utils';

	export let mode: Mode;
	export let keysMode: KeysMode;
	export let keyboardMode: boolean;
	export let muteMode: KeysMode.TrackMutes | KeysMode.PatternMutes;
	export let helpMode: boolean;
	export let playing: boolean;
	export let selectedTrack: N16;
	export let patternLength: number;
	export let length: number;
	export let scale: number;

	const dispatch = createEventDispatcher();

	let pressedCodes = new Set<string>();
	let lastPressedCode: string;
	let lastReleasedCode: string;
	const pressTimes = new Map<string, number | undefined>();
	const consecutivePresses = new Map<string, number>();

	$: pressedSteps = new Set(Array.from(pressedCodes, codeToStep).filter(isNumber));

	// debug logging
	// $: console.debug(pressedCodes);

	let hold = false;

	function keydown(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, metaKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, metaKey, shiftKey });

		// immediate key presses, always triggered, retrigger when held
		switch (code) {
			case 'ArrowUp':
				if (altKey && (ctrlKey || metaKey)) dispatch('pattern-length-change', patternLength / 2);
				else if (altKey) dispatch('pattern-length-change', patternLength - 1);
				else if (ctrlKey || metaKey) dispatch('length-change', length / 2);
				else if (shiftKey) dispatch('scale-change', scale / 2);
				else dispatch('length-change', length - 1);
				event.preventDefault();
				return;
			case 'ArrowDown':
				if (altKey && (ctrlKey || metaKey)) dispatch('pattern-length-change', patternLength * 2);
				else if (altKey) dispatch('pattern-length-change', patternLength + 1);
				else if (ctrlKey || metaKey) dispatch('length-change', length * 2);
				else if (shiftKey) dispatch('scale-change', scale * 2);
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
			// case '/':
			// case '?':
			case 'Slash':
				event.preventDefault();
				break;
			// case '[':
			// case '{':
			case 'BracketLeft':
				if (mode === Mode.GridRec && keysMode === KeysMode.Default) dispatch('page-prev');
				break;
			// case ']':
			// case '}':
			case 'BracketRight':
				if (mode === Mode.GridRec && keysMode === KeysMode.Default) dispatch('page-next');
				break;
		}

		// debounced key presses, do not retrigger when held down
		if (!pressedCodes.has(code)) {
			pressedCodes.add(code);
			pressedCodes = pressedCodes;
			consecutivePresses.set(
				code,
				code === lastPressedCode ? (consecutivePresses.get(code) ?? 0) + 1 : 1,
			);
			lastPressedCode = code;
			pressTimes.set(code, performance.now());

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
						if ((consecutivePresses.get('Escape') as number) > 1) {
							hold = true;
							dispatch('keys-mode-pop', muteMode);
							dispatch(
								'keys-mode-push',
								muteMode === KeysMode.TrackMutes ? KeysMode.PatternMutes : KeysMode.TrackMutes,
							);
						} else hold = !hold;
					else {
						dispatch('keys-mode-push', KeysMode.BankChange);
					}
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
						if (keyboardMode) dispatch('keys-mode-pop', KeysMode.Keyboard);
						else dispatch('keys-mode-push', KeysMode.Keyboard);
					} else if (keysMode !== KeysMode.PatternChange)
						dispatch('keys-mode-push', KeysMode.PatternChange);
					return;
				// case 'z':
				// case 'Z':
				case 'KeyZ':
					// if (shiftKey && mode !== Mode.StepRec) dispatch('mode-set', Mode.StepRec);
					// else if (altKey && mode !== Mode.LiveRec) dispatch('mode-set', Mode.LiveRec);
					if (altKey && mode !== Mode.LiveRec) dispatch('mode-set', Mode.LiveRec);
					else if (!shiftKey && !altKey && mode !== Mode.GridRec)
						dispatch('mode-set', Mode.GridRec);
					else dispatch('mode-set', Mode.Default);
					return;
				// case 'x':
				// case 'X':
				case 'KeyX':
					if (pressedCodes.has('KeyZ')) dispatch('mode-set', Mode.LiveRec);
					else if (!playing) dispatch('play');
					else dispatch('pause');
					return;
				// case 'c':
				// case 'C':
				case 'KeyC':
					// if (pressedCodes.has('KeyZ')) dispatch('mode-set', Mode.StepRec);
					// else dispatch('stop');
					dispatch('stop');
					return;
				// case '/':
				// case '?':
				case 'Slash':
					if (shiftKey)
						if (helpMode) dispatch('help-disable');
						else dispatch('help-enable');
					return;
			}

			const step = codeToStep(code);
			if (!(ctrlKey || metaKey) && step !== undefined) {
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
							// case Mode.StepRec:
							// TODO
							// break;
							case Mode.LiveRec:
								dispatch('rec-trigger-track', step);
								break;
						}
						break;
					case KeysMode.TrackChange:
						dispatch('track-change', step);
						break;
					case KeysMode.PatternChange:
						dispatch('pattern-change', step);
						break;
					case KeysMode.BankChange:
						dispatch('bank-change', step);
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

		if (pressedCodes.has(code)) {
			// pressed.delete(key);
			// pressed = pressed;
		}
	}

	function keyup(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		lastReleasedCode = code;

		if (pressedCodes.has(code)) {
			pressedCodes.delete(code);
			pressedCodes = pressedCodes;

			switch (code) {
				case 'Tab':
					const pressTime = pressTimes.get('Tab');
					if (
						lastPressedCode === 'Tab' &&
						pressTime !== undefined &&
						performance.now() - pressTime < 200
					)
						if (shiftKey) dispatch('track-prev');
						else dispatch('track-next');
					dispatch('keys-mode-pop', KeysMode.TrackChange);
					break;
				// case 'Shift':
				case 'ShiftLeft':
				case 'ShiftRight':
					if (!hold) dispatch('keys-mode-pop', muteMode);
					break;
				// case '`':
				// case '~':
				case 'Backquote':
				case 'IntlBackslash':
					if (keysMode === KeysMode.PatternChange)
						dispatch('keys-mode-pop', KeysMode.PatternChange);
					break;
				case 'Escape':
					if (keysMode === KeysMode.BankChange) dispatch('keys-mode-pop', KeysMode.BankChange);
					break;
			}
		}
	}
</script>

<div on:keydown={keydown} on:keypress={keypress} on:keyup={keyup} style:display="contents">
	<slot {pressedCodes} {pressedSteps} />
</div>
