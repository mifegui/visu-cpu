import { EscalarSimulator, Pentium1Simulator, type Component } from './component';

export interface Configuration {
	multithreading: 'no' | 'imt' | 'bmt' | 'smt';
	scalar: 'scalar' | 'super-scalar';
	pause: boolean;
}

export const configToArchitectureMatrix = {
	no: { scalar: EscalarSimulator, 'super-scalar': Pentium1Simulator },
	imt: { scalar: EscalarSimulator, 'super-scalar': Pentium1Simulator },
	bmt: { scalar: EscalarSimulator, 'super-scalar': Pentium1Simulator },
	smt: { scalar: EscalarSimulator, 'super-scalar': Pentium1Simulator }
};

export function copyArchitecture(arch: Component[]) {
	return arch.map((component) => {
		return {
			...component,
			instructionsInside: [...component.instructionsInside],
			goingTo: [...component.goingTo]
		};
	});
}
