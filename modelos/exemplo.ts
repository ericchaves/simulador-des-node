import { Simulador } from "../src/";
import { Pessoas, Sala } from "./entidades/";

const sala = new Sala("sala", 2);
const pessoas = new Pessoas("pessoas");
const simulador = new Simulador([sala, pessoas], 0, 10);
(async () => {
    console.log(`modelo: preparando simulação`);
    if (await simulador.preparar()) {
        console.log(`modelo: iniciando simulação`);
        for await (const momento of simulador.simular()) {
            console.log(`modelo: momento ${momento} simulado`);
        }
    }
    else {
        console.error("Falha ao iniciar a simulação.");
    }
})();