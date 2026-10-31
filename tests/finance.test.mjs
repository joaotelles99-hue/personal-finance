import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const output = await build({entryPoints:['src/utils.js'], bundle:true, platform:'node', format:'esm', write:false});
const u = await import(`data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString('base64')}`);
test('dupla: pagamento parcial não quita a outra pessoa',()=>{
 const aluno={dupla:true,valor:900,pago1:true,pago2:false};
 assert.equal(u.valorRecebido(aluno),450); assert.equal(u.valorPendente(aluno),450); assert.equal(u.totalmentePago(aluno),false);
});
test('vencimento futuro não é atraso, vencido é atraso e pago está em dia',()=>{
 assert.equal(u.getAlunoStatus({valor:300,vencimento:20,pago:false},10),'em-dia');
 assert.equal(u.getAlunoStatus({valor:300,vencimento:9,pago:false},10),'atrasado');
 assert.equal(u.getAlunoStatus({valor:300,vencimento:9,pago:true},10),'em-dia');
});
test('virada mensal preserva fixas, avança parcelas e encerra última parcela',()=>{
 assert.deepEqual(u.resetarDespesasParaMes([{tipo:'avulsa'},{tipo:'fixa',pago:true},{tipo:'parcelada',parcelaAtual:1,totalParcelas:2,pago:true},{tipo:'parcelada',parcelaAtual:2,totalParcelas:2}]),[{tipo:'fixa',pago:false},{tipo:'parcelada',parcelaAtual:2,totalParcelas:2,pago:false}]);
});
test('projeção exclui inativo e saída confirmada; cenário pessimista exclui em risco',()=>{
 const r=u.calcularProjecao([{valor:100},{valor:200,statusSaida:'inativo'},{valor:300,statusSaida:'sai-proximo-mes'},{valor:400,statusSaida:'em-risco'}],[{valor:90,tipo:'fixa'},{valor:50,tipo:'avulsa'}]);
 assert.equal(r.receitaProjetada,500);assert.equal(r.receitaPessimista,100);assert.equal(r.saldoEstimado,410);
});
