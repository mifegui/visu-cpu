import { writable, type Writable } from "svelte/store";

export class Metrics{
    public ipc = writable(0) as Writable<number>
    public ciclos = writable(0) as Writable<number>
    //adicionar outras metricas que forem necessarias
    constructor(){
        this.ipc.set(0);
        this.ciclos.set(0);
    }
    setIpc(ipc: number){
        this.ipc.set(ipc);
    }
    setCiclos(ciclos: number){
        this.ciclos.set(ciclos);
    }
}