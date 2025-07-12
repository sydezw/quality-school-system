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
      // 1. Usar Groq para gerar conteúdo estruturado
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Você é um assistente especializado em gerar relatórios financeiros educacionais em português brasileiro. Crie um relatório profissional e bem estruturado em HTML."
          },
          {
            role: "user",
            content: `Gere um relatório financeiro detalhado baseado nestes dados: ${JSON.stringify(dados, null, 2)}.
            
Inclua:
            - Cabeçalho com título e data
            - Resumo executivo dos números principais
            - Análise detalhada de pendências e vencimentos
            - Próximos vencimentos com alertas de urgência
            - Indicadores de performance e tendências
            - Conclusões e recomendações práticas
            
Formato: HTML bem estruturado com CSS inline para conversão em PDF. Use cores profissionais (azul, verde, vermelho para alertas). Mantenha layout limpo e legível.`
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.3,
        max_tokens: 4000
      });

      const htmlContent = completion.choices[0]?.message?.content || '';
      
      // 2. Criar HTML estruturado para PDF
      const htmlCompleto = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              border-left: 4px solid #2563eb;
              padding-left: 15px;
              margin-bottom: 15px;
            }
            .metric-card {
              display: inline-block;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              margin: 10px;
              min-width: 200px;
              text-align: center;
            }
            .metric-value {
              font-size: 24px;
              font-weight: bold;
              color: #1e40af;
            }
            .metric-label {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
            }
            .alert {
              background: #fef2f2;
              border-left: 4px solid #ef4444;
              padding: 15px;
              margin: 10px 0;
            }
            .success {
              background: #f0fdf4;
              border-left: 4px solid #22c55e;
              padding: 15px;
              margin: 10px 0;
            }
            .warning {
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 10px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 12px;
              text-align: left;
            }
            th {
              background: #f1f5f9;
              font-weight: bold;
              color: #1e40af;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TS School - Sistema de Gestão</div>
            <h1>Relatório Financeiro Inteligente</h1>
            <p>Gerado em: ${dados.dataGeracao}</p>
            <p>Período: ${dados.periodo}</p>
          </div>
          ${htmlContent}
          <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema TS School</p>
            <p>© ${new Date().getFullYear()} TS School. Todos os direitos reservados.</p>
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
      document.body.appendChild(tempDiv);
      
      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
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
      const fileName = `relatorio-financeiro-inteligente-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      return { success: true, fileName };
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return { success: false, error: error.message };
    }
  };
  
  return { gerarRelatorioPDF };
};