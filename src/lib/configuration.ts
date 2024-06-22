export interface Configuration {
	multithreading: 'no' | 'imt' | 'bmt' | 'smt';
	scalar: 'scalar' | 'super-scalar';
	pipelines: number;
	pause: boolean;
}
