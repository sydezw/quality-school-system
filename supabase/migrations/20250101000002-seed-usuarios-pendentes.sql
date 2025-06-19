-- Inserir dados de teste na tabela usuarios_pendentes
INSERT INTO public.usuarios_pendentes (nome, email, senha, cargo, permissoes, status) VALUES
('Maria Silva Santos', 'maria.silva@email.com', '$2b$10$example_hash_password_1', 'Secretária', 'user', 'pendente'),
('João Pedro Oliveira', 'joao.pedro@email.com', '$2b$10$example_hash_password_2', 'Admin', 'admin', 'pendente'),
('Ana Carolina Ferreira', 'ana.carolina@email.com', '$2b$10$example_hash_password_3', 'Gerente', 'manager', 'pendente'),
('Carlos Eduardo Lima', 'carlos.eduardo@email.com', '$2b$10$example_hash_password_4', 'Secretária', 'user', 'pendente');

-- Comentário: Estes são dados de teste para demonstrar a funcionalidade de aprovação de logins
-- As senhas são hashes de exemplo e devem ser substituídas por senhas reais em produção