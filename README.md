# Sistema Escolar TS School

Um sistema completo de gestão escolar desenvolvido com tecnologias modernas para facilitar a administração de instituições de ensino.

## 📋 Sobre o Projeto

O TS School é uma plataforma web robusta e intuitiva que oferece ferramentas essenciais para a gestão completa de escolas e cursos de idiomas. O sistema foi desenvolvido com foco na experiência do usuário e na eficiência operacional.

## ✨ Funcionalidades Principais

### 👥 Gestão de Pessoas
- **Alunos**: Cadastro completo com informações pessoais, responsáveis e histórico acadêmico
- **Professores**: Gerenciamento de docentes e suas especialidades
- **Usuários**: Sistema de permissões granulares e controle de acesso

### 📚 Gestão Acadêmica
- **Turmas**: Criação e organização de classes por níveis e idiomas
- **Materiais**: Biblioteca digital de recursos didáticos
- **Agenda**: Calendário integrado para eventos e atividades
- **Aniversariantes**: Painel especial para celebrações mensais

### 💰 Gestão Financeira
- **Boletos**: Geração e controle de cobranças
- **Receitas e Despesas**: Controle financeiro completo
- **Relatórios**: Dashboards e análises financeiras

### 📊 Relatórios e Analytics
- **Dashboard**: Visão geral com métricas importantes
- **Relatórios Personalizados**: Análises detalhadas por período
- **Gráficos Interativos**: Visualização de dados em tempo real

### 🏢 Gestão Administrativa
- **Salas**: Controle de ocupação e disponibilidade
- **Contratos**: Geração automática de documentos
- **Documentos**: Biblioteca de arquivos institucionais

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form
- **Notificações**: Sonner + React Hot Toast
- **Ícones**: Lucide React
- **Animações**: CSS3 + Tailwind Animations

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase

### Passos para instalação

1. **Clone o repositório**
```bash
git clone <URL_DO_REPOSITORIO>
cd quality-school-system
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```
Edite o arquivo `.env.local` com suas credenciais do Supabase:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. **Execute as migrações do banco de dados**
```bash
npx supabase db reset
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter
- `npm run type-check` - Verifica os tipos TypeScript

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza PostgreSQL via Supabase com as seguintes tabelas principais:

- `usuarios` - Dados dos usuários do sistema
- `alunos` - Informações dos estudantes
- `responsaveis` - Dados dos responsáveis pelos alunos
- `professores` - Cadastro de docentes
- `turmas` - Classes e grupos de estudo
- `financeiro` - Transações financeiras
- `agenda` - Eventos e compromissos
- `materiais` - Recursos didáticos
- `salas` - Espaços físicos da instituição

## 🔐 Sistema de Permissões

O TS School implementa um sistema granular de permissões:

- **Proprietário**: Acesso total ao sistema
- **Administrador**: Gestão completa exceto configurações críticas
- **Professor**: Acesso a turmas e materiais
- **Secretário**: Gestão administrativa e financeira
- **Visualizador**: Apenas consulta de dados

## 🎨 Design System

O sistema segue um design consistente baseado em:

- **Cores Primárias**: Vermelho da marca (#D72638) e tons neutros
- **Tipografia**: Inter (sistema) com hierarquia clara
- **Componentes**: Biblioteca shadcn/ui customizada
- **Responsividade**: Mobile-first approach
- **Acessibilidade**: Conformidade com WCAG 2.1

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- 📱 Dispositivos móveis (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Telas grandes (1440px+)

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Todos os direitos reservados para Sistema Escolar TS School  
©Flution 2025

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato através dos canais oficiais da Flution.

---

**Desenvolvido com ❤️ pela equipe Flution**
