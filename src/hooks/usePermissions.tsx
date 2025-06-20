import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Tables } from '../integrations/supabase/types';
import { supabase } from '../integrations/supabase/client';

type Usuario = Tables<'usuarios'>;

export interface UserPermissions {
  // Alunos
  visualizarAlunos: boolean;
  gerenciarAlunos: boolean;
  
  // Turmas
  visualizarTurmas: boolean;
  gerenciarTurmas: boolean;
  
  // Aulas
  visualizarAulas: boolean;
  gerenciarAulas: boolean;
  
  // Avaliações
  visualizarAvaliacoes: boolean;
  gerenciarAvaliacoes: boolean;
  
  // Agenda
  visualizarAgenda: boolean;
  gerenciarAgenda: boolean;
  
  // Contratos
  visualizarContratos: boolean;
  gerenciarContratos: boolean;
  aprovarContratos: boolean;
  
  // Financeiro
  gerenciarBoletos: boolean;
  gerenciarDespesas: boolean;
  gerenciarFolha: boolean;
  
  // Presenças
  gerenciarPresencas: boolean;
  
  // Administração
  gerenciarUsuarios: boolean;
  
  // Professores
  visualizarProfessores: boolean;
  gerenciarProfessores: boolean;
  
  // Salas
  visualizarSalas: boolean;
  gerenciarSalas: boolean;
  
  // Materiais
  visualizarMateriais: boolean;
  gerenciarMateriais: boolean;
}

export const usePermissions = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.email) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', authUser.email)
          .single();

        if (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setUser(null);
        } else {
          setUser(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser?.email]);

  const getPermissions = (usuario: Usuario | null): UserPermissions => {
    if (!usuario) {
       return {
         visualizarAlunos: false,
         gerenciarAlunos: false,
         visualizarTurmas: false,
         gerenciarTurmas: false,
         visualizarAulas: false,
         gerenciarAulas: false,
         visualizarAvaliacoes: false,
         gerenciarAvaliacoes: false,
         visualizarAgenda: false,
         gerenciarAgenda: false,
         visualizarContratos: false,
         gerenciarContratos: false,
         aprovarContratos: false,
         gerenciarBoletos: false,
         gerenciarDespesas: false,
         gerenciarFolha: false,
         gerenciarPresencas: false,
         gerenciarUsuarios: false,
         visualizarProfessores: false,
         gerenciarProfessores: false,
         visualizarSalas: false,
         gerenciarSalas: false,
         visualizarMateriais: false,
         gerenciarMateriais: false,
       };
     }

    // Admin tem todas as permissões
    if (usuario.cargo === 'Admin') {
      return {
        visualizarAlunos: true,
        gerenciarAlunos: true,
        visualizarTurmas: true,
        gerenciarTurmas: true,
        visualizarAulas: true,
        gerenciarAulas: true,
        visualizarAvaliacoes: true,
        gerenciarAvaliacoes: true,
        visualizarAgenda: true,
        gerenciarAgenda: true,
        visualizarContratos: true,
        gerenciarContratos: true,
        aprovarContratos: true,
        gerenciarBoletos: true,
        gerenciarDespesas: true,
        gerenciarFolha: true,
        gerenciarPresencas: true,
        gerenciarUsuarios: true,
        visualizarProfessores: true,
        gerenciarProfessores: true,
        visualizarSalas: true,
        gerenciarSalas: true,
        visualizarMateriais: true,
        gerenciarMateriais: true,
      };
    }

    // Para outros usuários, usar as permissões granulares
    return {
      visualizarAlunos: usuario.perm_visualizar_alunos ?? false,
      gerenciarAlunos: usuario.perm_gerenciar_alunos ?? false,
      visualizarTurmas: usuario.perm_visualizar_turmas ?? false,
      gerenciarTurmas: usuario.perm_gerenciar_turmas ?? false,
      visualizarAulas: usuario.perm_visualizar_aulas ?? false,
      gerenciarAulas: usuario.perm_gerenciar_aulas ?? false,
      visualizarAvaliacoes: usuario.perm_visualizar_avaliacoes ?? false,
      gerenciarAvaliacoes: usuario.perm_gerenciar_avaliacoes ?? false,
      visualizarAgenda: usuario.perm_visualizar_agenda ?? false,
      gerenciarAgenda: usuario.perm_gerenciar_agenda ?? false,
      visualizarContratos: usuario.perm_visualizar_contratos ?? false,
      gerenciarContratos: usuario.perm_gerenciar_contratos ?? false,
      aprovarContratos: usuario.perm_aprovar_contratos ?? false,
      gerenciarBoletos: usuario.perm_gerenciar_boletos ?? false,
      gerenciarDespesas: usuario.perm_gerenciar_despesas ?? false,
      gerenciarFolha: usuario.perm_gerenciar_folha ?? false,
      gerenciarPresencas: usuario.perm_gerenciar_presencas ?? false,
      gerenciarUsuarios: usuario.perm_gerenciar_usuarios ?? false,
      visualizarProfessores: usuario.perm_visualizar_professores ?? false,
      gerenciarProfessores: usuario.perm_gerenciar_professores ?? false,
      visualizarSalas: usuario.perm_visualizar_salas ?? false,
      gerenciarSalas: usuario.perm_gerenciar_salas ?? false,
      visualizarMateriais: usuario.perm_visualizar_materiais ?? false,
      gerenciarMateriais: usuario.perm_gerenciar_materiais ?? false,
    };
  };

  const permissions = getPermissions(user);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions[permission];
  };

  const hasAnyPermission = (permissionList: (keyof UserPermissions)[]): boolean => {
    return permissionList.some(permission => permissions[permission]);
  };

  const hasAllPermissions = (permissionList: (keyof UserPermissions)[]): boolean => {
    return permissionList.every(permission => permissions[permission]);
  };

  const isOwner = (): boolean => {
    return user?.cargo === 'Admin';
  };

  return {
    user,
    loading,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner,
    getPermissions,
  };
};

export default usePermissions;