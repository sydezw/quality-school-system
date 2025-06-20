import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { UserPermissions } from '@/hooks/usePermissions';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Usuario = Tables<'usuarios'>;

interface PermissionToggleProps {
  user: Usuario;
  onPermissionChange?: () => void;
  disabled?: boolean;
}

interface PermissionGroup {
  title: string;
  permissions: {
    key: keyof UserPermissions;
    dbKey: keyof Usuario;
    label: string;
    description?: string;
  }[];
}

const permissionGroups: PermissionGroup[] = [
  {
    title: 'Gestão de Alunos',
    permissions: [
      { key: 'criarAlunos', dbKey: 'perm_criar_alunos', label: 'Criar Alunos', description: 'Permite cadastrar novos alunos' },
      { key: 'editarAlunos', dbKey: 'perm_editar_alunos', label: 'Editar Alunos', description: 'Permite editar dados dos alunos' },
      { key: 'removerAlunos', dbKey: 'perm_remover_alunos', label: 'Remover Alunos', description: 'Permite excluir alunos do sistema' },
    ],
  },
  {
    title: 'Gestão de Turmas',
    permissions: [
      { key: 'criarTurmas', dbKey: 'perm_criar_turmas', label: 'Criar Turmas', description: 'Permite criar novas turmas' },
      { key: 'editarTurmas', dbKey: 'perm_editar_turmas', label: 'Editar Turmas', description: 'Permite editar informações das turmas' },
      { key: 'removerTurmas', dbKey: 'perm_remover_turmas', label: 'Remover Turmas', description: 'Permite excluir turmas' },
    ],
  },
  {
    title: 'Gestão de Aulas',
    permissions: [
      { key: 'criarAulas', dbKey: 'perm_criar_aulas', label: 'Criar Aulas', description: 'Permite criar novas aulas' },
      { key: 'editarAulas', dbKey: 'perm_editar_aulas', label: 'Editar Aulas', description: 'Permite editar aulas existentes' },
      { key: 'removerAulas', dbKey: 'perm_remover_aulas', label: 'Remover Aulas', description: 'Permite excluir aulas' },
    ],
  },
  {
    title: 'Gestão de Avaliações',
    permissions: [
      { key: 'criarAvaliacoes', dbKey: 'perm_criar_avaliacoes', label: 'Criar Avaliações', description: 'Permite criar avaliações' },
      { key: 'editarAvaliacoes', dbKey: 'perm_editar_avaliacoes', label: 'Editar Avaliações', description: 'Permite editar avaliações' },
      { key: 'removerAvaliacoes', dbKey: 'perm_remover_avaliacoes', label: 'Remover Avaliações', description: 'Permite excluir avaliações' },
    ],
  },
  {
    title: 'Gestão de Contratos',
    permissions: [
      { key: 'criarContratos', dbKey: 'perm_criar_contratos', label: 'Criar Contratos', description: 'Permite criar contratos' },
      { key: 'editarContratos', dbKey: 'perm_editar_contratos', label: 'Editar Contratos', description: 'Permite editar contratos' },
      { key: 'removerContratos', dbKey: 'perm_remover_contratos', label: 'Remover Contratos', description: 'Permite excluir contratos' },
      { key: 'aprovarContratos', dbKey: 'perm_aprovar_contratos', label: 'Aprovar Contratos', description: 'Permite aprovar contratos' },
    ],
  },
  {
    title: 'Gestão Financeira',
    permissions: [
      { key: 'gerenciarBoletos', dbKey: 'perm_gerenciar_boletos', label: 'Gerenciar Boletos', description: 'Permite gerenciar boletos' },
      { key: 'gerenciarDespesas', dbKey: 'perm_gerenciar_despesas', label: 'Gerenciar Despesas', description: 'Permite gerenciar despesas' },
      { key: 'gerenciarFolha', dbKey: 'perm_gerenciar_folha', label: 'Gerenciar Folha', description: 'Permite gerenciar folha de pagamento' },
    ],
  },
  {
    title: 'Gestão de Presenças',
    permissions: [
      { key: 'gerenciarPresencas', dbKey: 'perm_gerenciar_presencas', label: 'Gerenciar Presenças', description: 'Permite gerenciar presenças' },
    ],
  },
  {
    title: 'Administração',
    permissions: [
      { key: 'gerenciarUsuarios', dbKey: 'perm_gerenciar_usuarios', label: 'Gerenciar Usuários', description: 'Permite gerenciar usuários e permissões' },
    ],
  },
];

export const PermissionToggle: React.FC<PermissionToggleProps> = ({
  user,
  onPermissionChange,
  disabled = false,
}) => {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handlePermissionChange = async (dbKey: keyof Usuario, value: boolean) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ [dbKey]: value })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar permissão:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar permissão do usuário",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Permissão atualizada com sucesso",
      });

      if (onPermissionChange) {
        onPermissionChange();
      }
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissão do usuário",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (user.cargo === 'Admin') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 font-medium">👑 Proprietário (Admin)</p>
        <p className="text-blue-600 text-sm mt-1">
          Este usuário tem acesso total a todas as funcionalidades do sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {permissionGroups.map((group) => (
        <Card key={group.title} className="w-full">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">{group.title}</h3>
            <div className="space-y-3">
              {group.permissions.map((permission) => (
                <div key={permission.key} className="flex items-center justify-between space-x-3">
                  <div className="flex-1">
                    <Label 
                      htmlFor={permission.key} 
                      className="text-sm font-medium cursor-pointer"
                    >
                      {permission.label}
                    </Label>
                    {permission.description && (
                      <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                    )}
                  </div>
                  <Switch
                    id={permission.key}
                    checked={Boolean(user[permission.dbKey])}
                    onCheckedChange={(checked) => handlePermissionChange(permission.dbKey, checked)}
                    disabled={disabled || updating}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PermissionToggle;