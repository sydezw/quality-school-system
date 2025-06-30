-- Garantir que usuários Admin tenham todas as permissões necessárias
-- Incluindo permissões para gerenciar planos

-- Atualizar usuários existentes com cargo 'Admin' para ter todas as permissões
UPDATE public.usuarios 
SET 
  perm_visualizar_planos = true,
  perm_gerenciar_planos = true,
  perm_visualizar_salas = true,
  perm_gerenciar_salas = true,
  perm_visualizar_alunos = true,
  perm_gerenciar_alunos = true,
  perm_visualizar_professores = true,
  perm_gerenciar_professores = true,
  perm_visualizar_responsaveis = true,
  perm_gerenciar_responsaveis = true,
  perm_visualizar_turmas = true,
  perm_gerenciar_turmas = true,
  perm_visualizar_agenda = true,
  perm_gerenciar_agenda = true,
  perm_visualizar_financeiro = true,
  perm_gerenciar_financeiro = true,
  perm_visualizar_relatorios = true,
  perm_gerenciar_relatorios = true,
  perm_visualizar_contratos = true,
  perm_gerenciar_contratos = true,
  perm_visualizar_documentos = true,
  perm_gerenciar_documentos = true,
  perm_visualizar_materiais = true,
  perm_gerenciar_materiais = true,
  perm_aprovar_logins = true,
  perm_gerenciar_permissoes = true
WHERE cargo = 'Admin';

-- Inserir usuário admin se não existir
INSERT INTO public.usuarios (
  nome, 
  email, 
  senha, 
  cargo,
  perm_visualizar_planos,
  perm_gerenciar_planos,
  perm_visualizar_salas,
  perm_gerenciar_salas,
  perm_visualizar_alunos,
  perm_gerenciar_alunos,
  perm_visualizar_professores,
  perm_gerenciar_professores,
  perm_visualizar_responsaveis,
  perm_gerenciar_responsaveis,
  perm_visualizar_turmas,
  perm_gerenciar_turmas,
  perm_visualizar_agenda,
  perm_gerenciar_agenda,
  perm_visualizar_financeiro,
  perm_gerenciar_financeiro,
  perm_visualizar_relatorios,
  perm_gerenciar_relatorios,
  perm_visualizar_contratos,
  perm_gerenciar_contratos,
  perm_visualizar_documentos,
  perm_gerenciar_documentos,
  perm_visualizar_materiais,
  perm_gerenciar_materiais,
  perm_aprovar_logins,
  perm_gerenciar_permissoes
) 
SELECT 
  'Admin Sistema',
  'admin@escola.com',
  '123456',
  'Admin',
  true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios WHERE email = 'admin@escola.com'
);