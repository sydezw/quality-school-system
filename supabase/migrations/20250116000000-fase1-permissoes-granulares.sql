-- Fase 1: Migração para Sistema de Permissões Granulares
-- Adiciona 'Administrador' ao enum cargo_usuario e cria estrutura de permissões

-- 1. Adicionar 'Administrador' ao enum cargo_usuario
ALTER TYPE public.cargo_usuario ADD VALUE 'Administrador';

-- 2. Criar tabela de permissões para definir todas as permissões disponíveis
CREATE TABLE public.permissoes_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL, -- 'global', 'estudantes', 'professores', 'turmas', 'salas', 'contratos', 'financeiro', 'relatorios', 'agenda', 'materiais', 'documentos', 'aniversarios'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Inserir todas as permissões definidas no sistema
INSERT INTO public.permissoes_sistema (codigo, nome, descricao, categoria) VALUES
-- Permissões Globais (visíveis para todos)
('dashboard_view', 'Ver Dashboard', 'Acesso à página principal do dashboard', 'global'),
('profile_view', 'Ver Perfil', 'Acesso às informações do próprio perfil', 'global'),

-- Permissões de Estudantes
('students_create', 'Criar Estudantes', 'Permissão para cadastrar novos estudantes', 'estudantes'),
('students_edit', 'Editar Estudantes', 'Permissão para editar informações de estudantes', 'estudantes'),
('students_remove', 'Remover Estudantes', 'Permissão para remover estudantes do sistema', 'estudantes'),

-- Permissões de Professores
('teachers_create', 'Criar Professores', 'Permissão para cadastrar novos professores', 'professores'),
('teachers_edit', 'Editar Professores', 'Permissão para editar informações de professores', 'professores'),
('teachers_remove', 'Remover Professores', 'Permissão para remover professores do sistema', 'professores'),

-- Permissões de Turmas
('classes_create', 'Criar Turmas', 'Permissão para criar novas turmas', 'turmas'),
('classes_edit', 'Editar Turmas', 'Permissão para editar informações de turmas', 'turmas'),
('classes_remove', 'Remover Turmas', 'Permissão para remover turmas do sistema', 'turmas'),

-- Permissões de Salas
('rooms_create', 'Criar Salas', 'Permissão para cadastrar novas salas', 'salas'),
('rooms_edit', 'Editar Salas', 'Permissão para editar informações de salas', 'salas'),
('rooms_remove', 'Remover Salas', 'Permissão para remover salas do sistema', 'salas'),

-- Permissões de Contratos
('contracts_create', 'Criar Contratos', 'Permissão para criar novos contratos', 'contratos'),
('contracts_edit', 'Editar Contratos', 'Permissão para editar contratos existentes', 'contratos'),
('contracts_remove', 'Remover Contratos', 'Permissão para remover contratos do sistema', 'contratos'),

-- Permissões Financeiras
('financial_create', 'Criar Registros Financeiros', 'Permissão para criar boletos e despesas', 'financeiro'),
('financial_edit', 'Editar Registros Financeiros', 'Permissão para editar boletos e despesas', 'financeiro'),
('financial_remove', 'Remover Registros Financeiros', 'Permissão para remover registros financeiros', 'financeiro'),

-- Permissões de Relatórios
('reports_view', 'Ver Relatórios', 'Permissão para visualizar relatórios do sistema', 'relatorios'),

-- Permissões de Agenda
('agenda_create', 'Criar Eventos na Agenda', 'Permissão para criar novos eventos', 'agenda'),
('agenda_edit', 'Editar Eventos na Agenda', 'Permissão para editar eventos existentes', 'agenda'),
('agenda_remove', 'Remover Eventos da Agenda', 'Permissão para remover eventos', 'agenda'),

-- Permissões de Materiais
('materials_create', 'Criar Materiais', 'Permissão para adicionar novos materiais', 'materiais'),
('materials_edit', 'Editar Materiais', 'Permissão para editar materiais existentes', 'materiais'),
('materials_remove', 'Remover Materiais', 'Permissão para remover materiais', 'materiais'),

-- Permissões de Documentos
('documents_create', 'Criar Documentos', 'Permissão para adicionar novos documentos', 'documentos'),
('documents_edit', 'Editar Documentos', 'Permissão para editar documentos existentes', 'documentos'),
('documents_remove', 'Remover Documentos', 'Permissão para remover documentos', 'documentos'),

-- Permissões de Aniversários
('birthdays_view', 'Ver Aniversários', 'Permissão para visualizar lista de aniversários', 'aniversarios'),

-- Permissões de Aprovação de Logins
('approve_logins_view', 'Ver Aprovação de Logins', 'Permissão para visualizar usuários pendentes de aprovação', 'aprovacao'),
('approve_logins_approve', 'Aprovar Logins', 'Permissão para aprovar novos usuários', 'aprovacao');

-- 4. Criar tabela de relacionamento usuário-permissões
CREATE TABLE public.usuario_permissoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  permissao_codigo TEXT NOT NULL REFERENCES public.permissoes_sistema(codigo) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id, permissao_codigo)
);

-- 5. Criar índices para melhor performance
CREATE INDEX idx_usuario_permissoes_usuario_id ON public.usuario_permissoes(usuario_id);
CREATE INDEX idx_usuario_permissoes_permissao_codigo ON public.usuario_permissoes(permissao_codigo);
CREATE INDEX idx_permissoes_sistema_categoria ON public.permissoes_sistema(categoria);
CREATE INDEX idx_permissoes_sistema_codigo ON public.permissoes_sistema(codigo);

-- 6. Habilitar RLS nas novas tabelas
ALTER TABLE public.permissoes_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS
CREATE POLICY "Todos podem ver permissões do sistema" ON public.permissoes_sistema
  FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem modificar permissões do sistema" ON public.permissoes_sistema
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem ver suas próprias permissões" ON public.usuario_permissoes
  FOR SELECT USING (true);

CREATE POLICY "Apenas administradores podem modificar permissões de usuários" ON public.usuario_permissoes
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. Migrar dados existentes: dar todas as permissões para usuários Admin
-- e apenas permissões globais para outros usuários
INSERT INTO public.usuario_permissoes (usuario_id, permissao_codigo)
SELECT 
  u.id,
  p.codigo
FROM public.usuarios u
CROSS JOIN public.permissoes_sistema p
WHERE u.cargo = 'Admin';

-- Dar apenas permissões globais para usuários não-Admin
INSERT INTO public.usuario_permissoes (usuario_id, permissao_codigo)
SELECT 
  u.id,
  p.codigo
FROM public.usuarios u
CROSS JOIN public.permissoes_sistema p
WHERE u.cargo != 'Admin' AND p.categoria = 'global';

-- 9. Criar função para verificar se usuário tem permissão específica
CREATE OR REPLACE FUNCTION public.usuario_tem_permissao(usuario_uuid UUID, permissao_codigo_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.usuario_permissoes up
    WHERE up.usuario_id = usuario_uuid 
    AND up.permissao_codigo = permissao_codigo_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Criar função para obter todas as permissões de um usuário
CREATE OR REPLACE FUNCTION public.obter_permissoes_usuario(usuario_uuid UUID)
RETURNS TABLE(codigo TEXT, nome TEXT, categoria TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.codigo,
    ps.nome,
    ps.categoria
  FROM public.usuario_permissoes up
  JOIN public.permissoes_sistema ps ON up.permissao_codigo = ps.codigo
  WHERE up.usuario_id = usuario_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Comentários para documentação
COMMENT ON TABLE public.permissoes_sistema IS 'Tabela que define todas as permissões disponíveis no sistema';
COMMENT ON TABLE public.usuario_permissoes IS 'Tabela de relacionamento entre usuários e suas permissões específicas';
COMMENT ON FUNCTION public.usuario_tem_permissao IS 'Função para verificar se um usuário possui uma permissão específica';
COMMENT ON FUNCTION public.obter_permissoes_usuario IS 'Função para obter todas as permissões de um usuário específico';