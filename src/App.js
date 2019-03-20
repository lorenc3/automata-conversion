import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import nfa from './ε-nfa3.json';

class App extends Component {
	sortIds = (a, b) => {
		return a - b;
	};
	eClose = (id, idArr) => {
		//arr with all the state ids that we get from eClose-ing the param id
		const eCloseArr = idArr;
		nfa.map(item => {
			if (item.id === id) {
				item.transitions.map(item => {
					if (
						item.with.includes('eps') &&
						!eCloseArr.includes(item.to)
					) {
						eCloseArr.push(item.to);
						this.eClose(item.to, eCloseArr);
					}
					return null;
				});
			}
			return null;
		});
		return eCloseArr;
	};

	getInputs = () => {
		const inputs = [];
		nfa.map(item => {
			if (item.transitions.length !== 0) {
				item.transitions.map(item => {
					item.with.map(input => {
						if (input !== 'eps' && !inputs.includes(input)) {
							inputs.push(input);
						}
						return null;
					});
					return null;
				});
			}
			return null;
		});
		return inputs.sort(this.sortIds);
	};

	isFinal(finalStates, state) {
		var final = false;
		finalStates.map(item => {
			if (state.includes(item.id)) {
				final = true;
			}
			return null;
		});

		return final;
	}

	getDfaState = (state, inputs, id, initial, final) => {
		var transitions = [];
		var dfaState = {
			id,
			label: state.label,
			initial,
			final,
			transitions
		};
		const newStates = [];

		inputs.map(input => {
			//new state that might form
			var newState = [];
			//map over each state id in the initial state
			state.states.map(stateId => {
				//find where each state goes with the current input and eClose it
				nfa.map(state => {
					if (state.id === stateId) {
						state.transitions.map(item => {
							if (item.with.includes(input)) {
								var eClosed = this.eClose(item.to, [item.to]);
								eClosed.map(id => {
									if (!newState.includes(id)) {
										newState.push(id);
									}
									return null;
								});
							}
							return null;
						});
					}
					return null;
				});
				return null;
			});

			var stateObj = {
				states: newState.sort(this.sortIds),
				input,
				label:
					newState.length !== 0
						? `{${newState.sort(this.sortIds).join(', ')}}`
						: `{Ø}`
			};

			var transitionObj = {
				to: stateObj.label,
				with: stateObj.input
			};

			//Find all new states and store them in newStates arr

			var same = newStates.filter(item => item.label === stateObj.label);
			if (same.length === 0 && stateObj.label !== state.label) {
				newStates.push({
					states: stateObj.states,
					label: stateObj.label
				});
			}

			//Add each state to transition
			transitions.push(transitionObj);

			console.log(`New State Set with input: ${input} -->`, stateObj);

			return null;
		});

		console.log('New States: -->', newStates);
		console.log('Transitions', transitions);
		console.log('Generated State', dfaState);

		return { dfaState, newStates };
	};

	getNewDfaStates = (newStates, ignored, inputs, final, id, callback) => {
		const ignoredStates = ignored;
		var states = [];
		newStates.map(item => {
			if (!ignoredStates.includes(item.label)) {
				console.log(`~~~~~~~~~~PROCESSING ${item.label}~~~~~~~~~~`);
				id++;
				var result = this.getDfaState(
					item,
					inputs,
					id,
					false,
					this.isFinal(final, item.states)
				);
				callback(result.dfaState);
				// if (item.label !== '{Ø}') {
				// 	ignoredStates.push(item.label);
				// }
				ignoredStates.push(item.label);
				states = states.concat(result.newStates);
			}

			return null;
		});

		var formatedStates = states.filter(
			item => !ignoredStates.includes(item.label)
		);

		console.log('Ignored States -->', ignoredStates);
		console.log('Formated States -->', formatedStates);

		if (formatedStates.length !== 0) {
			this.getNewDfaStates(
				formatedStates,
				ignoredStates,
				inputs,
				final,
				id,
				callback
			);
		} else {
			console.log('~~~~~~~~~~~~~~~~~END~~~~~~~~~~~~~~~~~');
		}
	};

	getDfa = nfa => {
		console.log(`~~~~~~~~~~GETTING NFA INFO & INITIAL STATE~~~~~~~~~~`);
		//Get initial state
		const initial = nfa.filter(item => item.initial)[0];
		console.log('Initial State', initial);

		//Get final state/s
		const final = nfa.filter(item => item.final);
		console.log('Final States', final);

		//Get inputs
		const inputs = this.getInputs();
		console.log('Inputs', inputs);

		//eClose initial state
		const dfaInitial = {
			states: this.eClose(initial.id, [initial.id]),
			label: `{${this.eClose(initial.id, [initial.id]).join(', ')}}`
		};
		console.log('DFA initial state set', dfaInitial);

		const dfaStates = [];

		//Get the initial state obj of dfa and push it to dfaStates
		console.log(`~~~~~~~~~~PROCESSING ${dfaInitial.label}~~~~~~~~~~`);
		var res = this.getDfaState(
			dfaInitial,
			inputs,
			0,
			true,
			this.isFinal(final, dfaInitial.states)
		);
		dfaStates.push(res.dfaState);

		//Get all other state objects from new states
		this.getNewDfaStates(
			res.newStates,
			[res.dfaState.label],
			inputs,
			final,
			0,
			stateObj => {
				dfaStates.push(stateObj);
			}
		);

		//log all states of dfa
		console.log('All states -->', dfaStates);

		//return res in JSON
		return dfaStates;
	};

	render() {
		this.getDfa(nfa);
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<p>
						Edit <code>src/App.js</code> and save to reload.
					</p>
					<p className="App-link">Learn React</p>
				</header>
			</div>
		);
	}
}

export default App;
