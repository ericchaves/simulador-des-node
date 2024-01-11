import { Simulador } from "../src/";
import { Pessoas, Sala } from "./entidades/";

const sala = new Sala("sala", 2);
const pessoas = new Pessoas("pessoas");

const dataInicioSimulacao = new Date('2020-01-01T00:00:00');
const simulador = new Simulador([sala, pessoas], dataInicioSimulacao);
(async () => {
    console.log(`modelo: preparando simulação`);
    if (await simulador.preparar()) {
        console.log(`modelo: iniciando simulação`);
        for await (const marco of simulador.simular()) {
            console.log(`modelo: momento ${marco.momentoAtual} simulado às ${marco.timestampAtual.toISOString()}`);
        }
    }
    else {
        console.error("Falha ao iniciar a simulação.");
    }
})();