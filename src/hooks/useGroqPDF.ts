import { Groq } from 'groq-sdk';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const useGroqPDF = () => {
  const gerarRelatorioPDF = async (dados: any) => {
    try {
      // 1. Usar Groq para gerar análise inteligente
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em análise financeira educacional. Gere insights e recomendações baseados nos dados fornecidos."
          },
          {
            role: "user",
            content: `Analise estes dados financeiros e forneça insights: ${JSON.stringify(dados.resumoExecutivo, null, 2)}. 
            
Forneça:
            - Análise da situação atual
            - Principais riscos identificados
            - Recomendações específicas
            - Tendências observadas
            
Resposta em português brasileiro, formato texto simples.`
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.3,
        max_tokens: 1000
      });

      const analiseIA = completion.choices[0]?.message?.content || 'Análise não disponível.';
      
      // 2. Criar HTML estruturado com o novo design
      const htmlCompleto = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: 'Segoe UI', 'Roboto', Arial, sans-serif; 
              line-height: 1.6;
              color: #2c3e50;
              background: #ffffff;
            }
            
            .container {
              max-width: 210mm;
              margin: 0 auto;
              padding: 20px;
            }
            
            /* Cabeçalho */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 25px;
              border-bottom: 3px solid #D32F2F;
              margin-bottom: 30px;
              background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            }
            
            .title h1 {
              font-size: 28px;
              font-weight: 700;
              color: #D32F2F;
              margin-bottom: 8px;
            }
            
            .title p {
              font-size: 14px;
              color: #6c757d;
              font-weight: 500;
            }
            
            .logo {
              width: 80px;
              height: 80px;
              background: #D32F2F;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 18px;
            }
            
            /* Resumo Executivo */
            .resumo {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 35px;
            }
            
            .card {
              background: #ffffff;
              border: 1px solid #e9ecef;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              transition: transform 0.2s ease;
            }
            
            .card:hover {
              transform: translateY(-2px);
            }
            
            .card.destaque {
              border-left: 4px solid #28a745;
              background: linear-gradient(135deg, #ffffff 0%, #f8fff9 100%);
            }
            
            .card.alerta {
              border-left: 4px solid #D32F2F;
              background: linear-gradient(135deg, #ffffff 0%, #fff8f8 100%);
            }
            
            .card strong {
              display: block;
              font-size: 24px;
              font-weight: 700;
              color: #2c3e50;
              margin-top: 8px;
            }
            
            .card.destaque strong {
              color: #28a745;
            }
            
            .card.alerta strong {
              color: #D32F2F;
            }
            
            /* Seções */
            .section {
              margin-bottom: 35px;
              page-break-inside: avoid;
            }
            
            .section h2 {
              font-size: 20px;
              font-weight: 600;
              color: #D32F2F;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #f1f3f4;
            }
            
            /* Tabela Financeira */
            .tabela-financeira {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            
            .tabela-financeira thead {
              background: #D32F2F;
            }
            
            .tabela-financeira th {
              padding: 15px 12px;
              text-align: left;
              font-weight: 600;
              color: #ffffff;
              font-size: 14px;
            }
            
            .tabela-financeira td {
              padding: 12px;
              border-bottom: 1px solid #f1f3f4;
              font-size: 13px;
            }
            
            .tabela-financeira tbody tr:nth-child(even) {
              background: #f8f9fa;
            }
            
            .tabela-financeira tbody tr:hover {
              background: #e3f2fd;
            }
            
            /* Alertas */
            .alertas {
              background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
              border: 1px solid #ffc107;
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
            }
            
            .alertas h2 {
              color: #856404;
              margin-bottom: 15px;
              border: none;
            }
            
            .alertas ul {
              list-style: none;
              padding: 0;
            }
            
            .alertas li {
              padding: 8px 0;
              font-weight: 500;
              color: #856404;
            }
            
            /* Indicadores */
            .indicadores {
              background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
              border: 1px solid #2196f3;
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
            }
            
            .indicadores h2 {
              color: #1565c0;
              margin-bottom: 15px;
              border: none;
            }
            
            .indicadores p {
              margin: 10px 0;
              font-weight: 500;
              color: #1565c0;
            }
            
            .indicadores strong {
              color: #0d47a1;
            }
            
            /* Conclusão */
            .conclusao {
              background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
              border: 1px solid #4caf50;
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
            }
            
            .conclusao h2 {
              color: #2e7d32;
              margin-bottom: 15px;
              border: none;
            }
            
            .conclusao p {
              color: #2e7d32;
              font-weight: 500;
              line-height: 1.8;
            }
            
            /* Rodapé */
            .footer {
              margin-top: 40px;
              padding: 20px;
              text-align: center;
              border-top: 2px solid #f1f3f4;
              color: #6c757d;
              font-size: 12px;
            }
            
            /* Utilitários */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .text-success { color: #28a745; }
            .text-danger { color: #D32F2F; }
            .text-warning { color: #ffc107; }
            
            @media print {
              .container { padding: 10px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Cabeçalho -->
            <div class="header">
              <div class="title">
                <h1>Relatório Financeiro - TS School</h1>
                <p>Gerado em: ${dados.cabecalho?.dataGeracao || new Date().toLocaleString('pt-BR')}</p>
              </div>
              <div class="logo">TS</div>
            </div>
            
            <!-- Resumo Executivo -->
            <div class="section">
              <h2>📊 Resumo Executivo</h2>
              <div class="resumo">
                <div class="card">
                  Total de parcelas: <strong>${dados.resumoExecutivo?.totalParcelas || 0}</strong>
                </div>
                <div class="card destaque">
                  Pagas: <strong>${dados.resumoExecutivo?.parcelasPagas || 0} (${dados.resumoExecutivo?.percentualPago || '0'}%)</strong>
                </div>
                <div class="card alerta">
                  Vencidas: <strong>${dados.resumoExecutivo?.parcelasVencidas || 0} (${dados.resumoExecutivo?.percentualVencido || '0'}%)</strong>
                </div>
                <div class="card">
                  Pendentes: <strong>${dados.resumoExecutivo?.parcelasPendentes || 0} (${dados.resumoExecutivo?.percentualPendente || '0'}%)</strong>
                </div>
                <div class="card">
                  Valor total pago: <strong>${dados.resumoExecutivo?.valorTotalPago || 'R$ 0,00'}</strong>
                </div>
                <div class="card">
                  Valor total restante: <strong>${dados.resumoExecutivo?.valorTotalRestante || 'R$ 0,00'}</strong>
                </div>
                <div class="card alerta">
                  Valor total vencido: <strong>${dados.resumoExecutivo?.valorTotalVencido || 'R$ 0,00'}</strong>
                </div>
                <div class="card">
                  Saldo líquido: <strong>${dados.resumoExecutivo?.saldoLiquido || 'R$ 0,00'}</strong>
                </div>
              </div>
            </div>
            
            <!-- Próximos Vencimentos -->
            ${dados.proximosVencimentos && dados.proximosVencimentos.length > 0 ? `
            <div class="section">
              <h2>📅 Próximos Vencimentos (30 dias)</h2>
              <table class="tabela-financeira">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Valor</th>
                    <th>Data Vencimento</th>
                    <th>Dias Restantes</th>
                    <th>Tipo</th>
                    <th>Parcela Nº</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${dados.proximosVencimentos.slice(0, 10).map(v => `
                    <tr ${v.urgente ? 'style="background: #ffebee;"' : ''}>
                      <td class="font-bold">${v.aluno}</td>
                      <td class="font-bold">${v.valor}</td>
                      <td>${v.dataVencimento}</td>
                      <td class="${v.diasRestantes <= 7 ? 'text-danger font-bold' : ''}">${v.diasRestantes} dias</td>
                      <td>${v.tipo}</td>
                      <td class="text-center">${v.parcela}</td>
                      <td>${v.status}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
            
            <!-- Despesas Recentes -->
            ${dados.despesasRecentes && dados.despesasRecentes.length > 0 ? `
            <div class="section">
              <h2>💳 Despesas Recentes</h2>
              <table class="tabela-financeira">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Valor</th>
                    <th>Data</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${dados.despesasRecentes.slice(0, 10).map(d => `
                    <tr>
                      <td class="font-bold">${d.descricao}</td>
                      <td>${d.categoria}</td>
                      <td class="font-bold">${d.valor}</td>
                      <td>${d.data}</td>
                      <td class="${d.status === 'pago' ? 'text-success' : 'text-warning'}">${d.status}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}
            
            <!-- Alertas Importantes -->
            ${dados.alertasImportantes && dados.alertasImportantes.length > 0 ? `
            <div class="alertas">
              <h2>🔔 Alertas Importantes</h2>
              <ul>
                ${dados.alertasImportantes.map(alerta => `<li>${alerta}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <!-- Indicadores de Desempenho -->
            <div class="indicadores">
              <h2>📊 Indicadores de Desempenho</h2>
              <p>Percentual de pagamento: <strong>${dados.indicadoresPerformance?.percentualPagamento || '0%'}</strong></p>
              <p>Valor médio por parcela: <strong>${dados.indicadoresPerformance?.valorMedioParcela || 'R$ 0,00'}</strong></p>
              <p>Taxa de inadimplência: <strong>${dados.indicadoresPerformance?.inadimplencia || '0%'}</strong></p>
              <p>Tendência de pagamento: <strong>${dados.indicadoresPerformance?.tendenciaPagamento || 'Regular'}</strong></p>
              <p>Status geral: <strong>${dados.indicadoresPerformance?.statusGeral || 'Estável'}</strong></p>
            </div>
            
            <!-- Análise Inteligente -->
            <div class="section">
              <h2>🤖 Análise Inteligente</h2>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
                <p style="white-space: pre-line; line-height: 1.8;">${analiseIA}</p>
              </div>
            </div>
            
            <!-- Conclusão -->
            <div class="conclusao">
              <h2>✅ Conclusão e Recomendações</h2>
              <p>${dados.conclusao?.recomendacao || 'Manter acompanhamento regular dos indicadores financeiros.'}</p>
              ${dados.conclusao?.alunosRisco && dados.conclusao.alunosRisco.length > 0 ? `
              <p><strong>Alunos que requerem atenção:</strong> ${dados.conclusao.alunosRisco.join(', ')}</p>
              ` : ''}
            </div>
            
            <!-- Rodapé -->
            <div class="footer">
              <p><strong>TS School - Sistema de Gestão Educacional</strong></p>
              <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
              <p>© ${new Date().getFullYear()} TS School. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // 3. Converter HTML para PDF
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlCompleto;
      tempDiv.style.width = '210mm';
      tempDiv.style.background = 'white';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);
      
      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Limpar elemento temporário
      document.body.removeChild(tempDiv);
      
      // Download do PDF
      const fileName = `relatorio-financeiro-ts-school-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      return { success: true, fileName };
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return { success: false, error: error.message };
    }
  };
  
  return { gerarRelatorioPDF };
};