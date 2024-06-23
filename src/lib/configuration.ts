import { BMTScalar, BMTSuperscalar, EscalarSimulator, IMTScalar, IMTSuperScalar, Pentium1Simulator, SMTScalar, SMTSuperscalar } from './component';

export interface Configuration {
	multithreading: 'no' | 'imt' | 'bmt' | 'smt';
	scalar: 'scalar' | 'super-scalar';
	numPipelines: number;
	pause: boolean;
}

export const configToArchitectureMatrix = {
	no: { scalar: EscalarSimulator, 'super-scalar': Pentium1Simulator },
	imt: { scalar: IMTScalar, 'super-scalar': IMTSuperScalar },
	bmt: { scalar: BMTScalar, 'super-scalar': BMTSuperscalar },
	smt: { scalar: SMTScalar, 'super-scalar': SMTSuperscalar }
};

