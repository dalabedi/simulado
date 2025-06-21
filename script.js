function formatarInput(input) {
  let valor = input.value.replace(/\D/g, '');
  if (valor.length < 3) valor = valor.padStart(3, '0');
  const centavos = valor.slice(-2);
  let reais = valor.slice(0, -2);
  reais = reais.replace(/^0+(?!$)/, '') || '0';
  reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  input.value = `${reais},${centavos}`;
}

function limparCampos() {
  document.querySelectorAll("input, select").forEach(el => el.value = '');
  document.getElementById("resultado").innerHTML = '';
}

function calcular() {
  const valorImovel = parseFloat(document.getElementById("valor").value.replace(/\./g, '').replace(',', '.'));
  const entrada = parseFloat(document.getElementById("entrada").value.replace(/\./g, '').replace(',', '.')) || 0;
  const jurosAnual = parseFloat(document.getElementById("juros").value);
  const prazo = parseInt(document.getElementById("prazo").value);
  const salario = parseFloat(document.getElementById("salario").value.replace(/\./g, '').replace(',', '.'));
  const sistema = document.getElementById("sistema").value;

  const resultado = document.getElementById("resultado");
  resultado.innerHTML = '';

  if (!sistema) {
    resultado.innerHTML = `<p style="color:red"><strong>⚠️ Selecione o sistema de amortização.</strong></p>`;
    return;
  }

  if (entrada > valorImovel) {
    resultado.innerHTML = `<p style="color:red"><strong>🚫 A entrada não pode ser maior que o valor do imóvel.</strong></p>`;
    return;
  }

  const limiteRenda = salario * 0.3;
  const jurosMensal = jurosAnual / 100 / 12;

  let entradaMinima = 0;
  let financiamentoMaximo = 0;

  if (sistema === 'SAC') {
    entradaMinima = valorImovel * 0.3;
    financiamentoMaximo = valorImovel * 0.7;
  } else if (sistema === 'PRICE') {
    entradaMinima = valorImovel * 0.5;
    financiamentoMaximo = valorImovel * 0.5;
  } else if (sistema === 'MCMV') {
    entradaMinima = valorImovel * 0.2;
    financiamentoMaximo = valorImovel * 0.8;
  }

  const financiado = valorImovel - entrada;
  const financiamentoOk = financiado <= financiamentoMaximo;

  let parcelaCalculada = 0;
  if (sistema === 'SAC') {
    const amortizacao = financiado / prazo;
    parcelaCalculada = amortizacao + financiado * jurosMensal;
  } else {
    parcelaCalculada = (financiado * jurosMensal) / (1 - Math.pow(1 + jurosMensal, -prazo));
  }

  const parcelaOk = parcelaCalculada <= limiteRenda;

  if (!financiamentoOk || !parcelaOk) {
    let html = `<h3 style="color:red">❌ Financiamento Reprovado</h3><ul>`;
    html += `<li>⚠️ Entrada recomendada: R$ ${entradaMinima.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>`;
    html += `<li>Financiamento máximo: ${financiamentoOk ? '✅ Ok' : `❌ R$ ${financiamentoMaximo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</li>`;
    html += `<li>Parcela mensal: ${parcelaOk ? '✅ Ok' : `❌ R$ ${parcelaCalculada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (limite: R$ ${limiteRenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`}</li>`;
    html += `</ul><p>Revise os valores ou tente outro cenário.</p>`;
    resultado.innerHTML = html;
    return;
  }

  if (entrada < entradaMinima) {
    resultado.innerHTML += `<p style="color:orange">⚠️ A entrada está abaixo do valor recomendado de R$ ${entradaMinima.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, mas o financiamento foi aprovado.</p>`;
  }

  if (sistema === 'SAC') {
    const amortizacao = financiado / prazo;
    let saldo = financiado;
    let html = `<p><strong>Sistema: SAC</strong></p><hr/><table><tr><th>Parcela</th><th>Valor</th></tr>`;
    for (let i = 1; i <= prazo; i++) {
      const parcela = amortizacao + saldo * jurosMensal;
      saldo -= amortizacao;
      html += `<tr><td>${i}</td><td>R$ ${parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`;
    }
    html += `</table>`;
    resultado.innerHTML += html;
  } else {
    const nomeSistema = sistema === 'MCMV' ? 'Minha Casa Minha Vida' : 'PRICE';
    resultado.innerHTML += `
      <p><strong>Sistema:</strong> ${nomeSistema}</p>
      <p><strong>Parcela fixa:</strong> R$ ${parcelaCalculada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    `;
  }
}