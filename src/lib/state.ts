import { createMachine, interpret } from 'xstate';

export const promiseMachine = createMachine({
	id: 'promise',
	initial: 'pending',
	states: {
		pending: {
			on: {
				RESOLVE: { target: 'resolved' },
				REJECT: { target: 'rejected' },
			},
		},
		resolved: {
			type: 'final',
		},
		rejected: {
			type: 'final',
		},
	},
	predictableActionArguments: true,
});

const promiseService = interpret(promiseMachine).onTransition(state => {
	console.log(state.value);
});

promiseService.start();

promiseService.send({ type: 'RESOLVE' });
