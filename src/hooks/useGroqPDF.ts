import { Groq } from 'groq-sdk';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const useGroqPDF = () => {
  const gerarRelatorioPDF = async (dados: any) => {
    try {
      console.log('🚀 Iniciando geração do PDF...');
      console.log('📊 Dados recebidos:', dados);
      
      // Verificar se a chave da API existe
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('GROQ API key não encontrada no arquivo .env');
      }
      
      console.log('🔑 API Key encontrada');
      
      // Inicializar Groq
      const groq = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true
      });
      
      console.log('🤖 Groq inicializado, gerando análise...');
      
      // Gerar análise com Groq
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
      console.log('✅ Análise IA gerada:', analiseIA.substring(0, 100) + '...');
      
      // HTML com design padronizado e logo TS - margem 0,5cm
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
              color: hsl(240, 10%, 3.9%);
              background: hsl(240, 10%, 99%);
              padding: 0.5cm;
              margin: 0;
            }
            
            .container {
              max-width: 100%;
              margin: 0 auto;
              background: white;
              min-height: calc(100vh - 1cm);
            }
            
            /* Cabeçalho com Logo TS */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 20px;
              border-bottom: 3px solid hsl(352, 70%, 50%);
              margin-bottom: 30px;
              background: linear-gradient(135deg, hsl(0, 0%, 100%) 0%, hsl(240, 4.8%, 95.9%) 100%);
            }
            
            .title-section h1 {
              font-size: 28px;
              font-weight: 700;
              color: hsl(352, 70%, 50%);
              margin-bottom: 6px;
              letter-spacing: -0.5px;
            }
            
            .title-section p {
              font-size: 14px;
              color: hsl(240, 3.8%, 46.1%);
              font-weight: 500;
            }
            
            .logo-ts {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, hsl(352, 70%, 50%) 0%, hsl(352, 70%, 45%) 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 900;
              font-size: 24px;
              letter-spacing: 2px;
              box-shadow: 0 6px 20px rgba(220, 38, 127, 0.3);
              position: relative;
              overflow: hidden;
            }
            
            .logo-ts::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
              transform: rotate(45deg);
              animation: shine 3s infinite;
            }
            
            @keyframes shine {
              0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
              50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
              100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            }
            
            /* Resumo Executivo */
            .resumo {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 30px;
            }
            
            .card {
              background: hsl(0, 0%, 100%);
              border: 1px solid hsl(240, 5.9%, 90%);
              border-radius: 10px;
              padding: 18px;
              text-align: center;
              box-shadow: 0 3px 10px rgba(0,0,0,0.05);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
              overflow: hidden;
            }
            
            .card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, hsl(352, 70%, 50%), hsl(352, 70%, 45%));
            }
            
            .card:hover {
              transform: translateY(-3px);
              box-shadow: 0 6px 20px rgba(0,0,0,0.1);
            }
            
            .card.destaque::before {
              background: linear-gradient(90deg, hsl(142, 76%, 36%), hsl(142, 76%, 31%));
            }
            
            .card.alerta::before {
              background: linear-gradient(90deg, hsl(0, 84%, 60%), hsl(0, 84%, 55%));
            }
            
            .card-label {
              font-size: 12px;
              color: hsl(240, 3.8%, 46.1%);
              font-weight: 500;
              margin-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .card strong {
              display: block;
              font-size: 22px;
              font-weight: 700;
              color: hsl(240, 10%, 3.9%);
              margin-top: 6px;
            }
            
            .card.destaque strong {
              color: hsl(142, 76%, 36%);
            }
            
            .card.alerta strong {
              color: hsl(0, 84%, 60%);
            }
            
            /* Seções */
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            
            .section h2 {
              font-size: 20px;
              font-weight: 600;
              color: hsl(352, 70%, 50%);
              margin-bottom: 18px;
              padding-bottom: 8px;
              border-bottom: 2px solid hsl(240, 4.8%, 95.9%);
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .section-icon {
              font-size: 22px;
            }
            
            /* Tabela Financeira */
            .tabela-financeira {
              width: 100%;
              border-collapse: collapse;
              margin: 18px 0;
              background: hsl(0, 0%, 100%);
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 3px 10px rgba(0,0,0,0.05);
            }
            
            .tabela-financeira thead {
              background: linear-gradient(135deg, hsl(352, 70%, 50%) 0%, hsl(352, 70%, 45%) 100%);
            }
            
            .tabela-financeira th {
              padding: 14px 12px;
              text-align: left;
              font-weight: 600;
              color: hsl(0, 0%, 100%);
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .tabela-financeira td {
              padding: 12px;
              border-bottom: 1px solid hsl(240, 4.8%, 95.9%);
              font-size: 12px;
            }
            
            .tabela-financeira tbody tr:nth-child(even) {
              background: hsl(240, 4.8%, 95.9%);
            }
            
            .tabela-financeira tbody tr:hover {
              background: hsl(210, 40%, 95%);
            }
            
            /* Alertas */
            .alertas {
              background: linear-gradient(135deg, hsl(45, 93%, 89%) 0%, hsl(45, 93%, 85%) 100%);
              border: 1px solid hsl(45, 93%, 47%);
              border-left: 4px solid hsl(45, 93%, 47%);
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            
            .alertas h2 {
              color: hsl(45, 93%, 20%);
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
              color: hsl(45, 93%, 20%);
              position: relative;
              padding-left: 20px;
              font-size: 13px;
            }
            
            .alertas li::before {
              content: '⚠️';
              position: absolute;
              left: 0;
              top: 8px;
            }
            
            /* Indicadores */
            .indicadores {
              background: linear-gradient(135deg, hsl(210, 40%, 95%) 0%, hsl(210, 40%, 90%) 100%);
              border: 1px solid hsl(210, 40%, 60%);
              border-left: 4px solid hsl(210, 40%, 60%);
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            
            .indicadores h2 {
              color: hsl(210, 40%, 30%);
              margin-bottom: 15px;
              border: none;
            }
            
            .indicadores p {
              margin: 8px 0;
              font-weight: 500;
              color: hsl(210, 40%, 30%);
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 13px;
            }
            
            .indicadores strong {
              color: hsl(210, 40%, 20%);
              font-weight: 700;
            }
            
            /* Análise IA */
            .analise-ia {
              background: linear-gradient(135deg, hsl(240, 4.8%, 95.9%) 0%, hsl(240, 4.8%, 90%) 100%);
              border: 1px solid hsl(240, 5.9%, 90%);
              border-left: 4px solid hsl(352, 70%, 50%);
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            
            .analise-ia h2 {
              color: hsl(352, 70%, 50%);
              margin-bottom: 15px;
              border: none;
            }
            
            .analise-ia p {
              color: hsl(240, 10%, 3.9%);
              font-weight: 500;
              line-height: 1.7;
              white-space: pre-line;
              font-size: 13px;
            }
            
            /* Conclusão */
            .conclusao {
              background: linear-gradient(135deg, hsl(142, 76%, 95%) 0%, hsl(142, 76%, 90%) 100%);
              border: 1px solid hsl(142, 76%, 36%);
              border-left: 4px solid hsl(142, 76%, 36%);
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            
            .conclusao h2 {
              color: hsl(142, 76%, 25%);
              margin-bottom: 15px;
              border: none;
            }
            
            .conclusao p {
              color: hsl(142, 76%, 25%);
              font-weight: 500;
              line-height: 1.7;
              font-size: 13px;
            }
            
            /* Rodapé */
            .footer {
              margin-top: 30px;
              padding: 20px;
              text-align: center;
              border-top: 2px solid hsl(240, 4.8%, 95.9%);
              color: hsl(240, 3.8%, 46.1%);
              font-size: 12px;
              background: hsl(240, 4.8%, 95.9%);
            }
            
            .footer-logo {
              font-size: 16px;
              font-weight: 700;
              color: hsl(352, 70%, 50%);
              margin-bottom: 6px;
            }
            
            /* Utilitários */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .text-success { color: hsl(142, 76%, 36%); }
            .text-danger { color: hsl(0, 84%, 60%); }
            .text-warning { color: hsl(45, 93%, 47%); }
            
            @media print {
              body { padding: 0.5cm; }
              .container { box-shadow: none; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Cabeçalho com Logo TS -->
            <div class="header">
              <div class="title-section">
                <h1>Relatório Financeiro</h1>
                <p>TS School - Sistema de Gestão Educacional</p>
                <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
              </div>
              <div class="logo-ts">TS</div>
            </div>
            
            <!-- Resumo Executivo -->
            <div class="section">
              <h2><span class="section-icon">📊</span>Resumo Executivo</h2>
              <div class="resumo">
                <div class="card">
                  <div class="card-label">Total de Parcelas</div>
                  <strong>${dados.resumoExecutivo?.totalParcelas || 0}</strong>
                </div>
                <div class="card destaque">
                  <div class="card-label">Parcelas Pagas</div>
                  <strong>${dados.resumoExecutivo?.parcelasPagas || 0} (${dados.resumoExecutivo?.percentualPago || '0'}%)</strong>
                </div>
                <div class="card alerta">
                  <div class="card-label">Parcelas Vencidas</div>
                  <strong>${dados.resumoExecutivo?.parcelasVencidas || 0} (${dados.resumoExecutivo?.percentualVencido || '0'}%)</strong>
                </div>
                <div class="card">
                  <div class="card-label">Parcelas Pendentes</div>
                  <strong>${dados.resumoExecutivo?.parcelasPendentes || 0} (${dados.resumoExecutivo?.percentualPendente || '0'}%)</strong>
                </div>
                <div class="card destaque">
                  <div class="card-label">Valor Total Pago</div>
                  <strong>${dados.resumoExecutivo?.valorTotalPago || 'R$ 0,00'}</strong>
                </div>
                <div class="card">
                  <div class="card-label">Valor Total Restante</div>
                  <strong>${dados.resumoExecutivo?.valorTotalRestante || 'R$ 0,00'}</strong>
                </div>
                <div class="card alerta">
                  <div class="card-label">Valor Total Vencido</div>
                  <strong>${dados.resumoExecutivo?.valorTotalVencido || 'R$ 0,00'}</strong>
                </div>
                <div class="card">
                  <div class="card-label">Saldo Líquido</div>
                  <strong>${dados.resumoExecutivo?.saldoLiquido || 'R$ 0,00'}</strong>
                </div>
              </div>
            </div>
            
            <!-- Próximos Vencimentos -->
            ${dados.proximosVencimentos && dados.proximosVencimentos.length > 0 ? `
            <div class="section">
              <h2><span class="section-icon">📅</span>Próximos Vencimentos (30 dias)</h2>
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
                    <tr ${v.urgente ? 'style="background: hsl(0, 84%, 95%);"' : ''}>
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
              <h2><span class="section-icon">💳</span>Despesas Recentes</h2>
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
              <h2><span class="section-icon">🔔</span>Alertas Importantes</h2>
              <ul>
                ${dados.alertasImportantes.map(alerta => `<li>${alerta}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <!-- Indicadores de Desempenho -->
            <div class="indicadores">
              <h2><span class="section-icon">📊</span>Indicadores de Desempenho</h2>
              <p>Percentual de pagamento: <strong>${dados.indicadoresPerformance?.percentualPagamento || '0%'}</strong></p>
              <p>Valor médio por parcela: <strong>${dados.indicadoresPerformance?.valorMedioParcela || 'R$ 0,00'}</strong></p>
              <p>Taxa de inadimplência: <strong>${dados.indicadoresPerformance?.inadimplencia || '0%'}</strong></p>
              <p>Tendência de pagamento: <strong>${dados.indicadoresPerformance?.tendenciaPagamento || 'Regular'}</strong></p>
              <p>Status geral: <strong>${dados.indicadoresPerformance?.statusGeral || 'Estável'}</strong></p>
            </div>
            
            <!-- Análise Inteligente -->
            <div class="analise-ia">
              <h2><span class="section-icon">🤖</span>Análise Inteligente</h2>
              <p>${analiseIA}</p>
            </div>
            
            <!-- Conclusão -->
            <div class="conclusao">
              <h2><span class="section-icon">✅</span>Conclusão e Recomendações</h2>
              <p>${dados.conclusao?.recomendacao || 'Manter acompanhamento regular dos indicadores financeiros.'}</p>
              ${dados.conclusao?.alunosRisco && dados.conclusao.alunosRisco.length > 0 ? `
              <p><strong>Alunos que requerem atenção:</strong> ${dados.conclusao.alunosRisco.join(', ')}</p>
              ` : ''}
            </div>
            
            <!-- Rodapé -->
            <div class="footer">
              <div class="footer-logo">TS School</div>
              <p>Sistema de Gestão Educacional</p>
              <p>Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
              <p>© ${new Date().getFullYear()} TS School. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      console.log('📄 HTML gerado, convertendo para PDF...');
      
      // Criar elemento temporário
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlCompleto;
      tempDiv.style.width = 'calc(210mm - 1cm)'; // A4 width minus 0.5cm margins on each side
      tempDiv.style.background = 'white';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);
      
      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('🖼️ Capturando canvas...');
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight
      });
      
      console.log('📋 Canvas capturado, gerando PDF...');
      
      const imgData = canvas.toDataURL('image/png', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Configurações com margens de 0,5cm
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 5; // 0.5cm in mm
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = margin;
      
      // Primeira página
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;
      
      // Páginas adicionais se necessário
      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }
      
      // Limpar elemento temporário
      document.body.removeChild(tempDiv);
      
      console.log('💾 Salvando PDF...');
      
      // Download do PDF
      const fileName = `relatorio-financeiro-ts-school-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF gerado com sucesso!');
      
      return { success: true, fileName };
      
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      console.error('Stack trace:', error.stack);
      return { 
        success: false, 
        error: error.message || 'Erro desconhecido ao gerar PDF'
      };
    }
  };
  
  return { gerarRelatorioPDF };
};