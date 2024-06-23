export class Metrics{
    public ipc: number;
    //adicionar outras metricas que forem necessarias
    constructor(){
        this.ipc = 0;
    }
    setIpc(ipc: number){
        this.ipc = ipc;
    }
}