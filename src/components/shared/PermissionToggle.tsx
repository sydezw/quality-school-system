import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPermissions } from '@/hooks/usePermissions';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, Settings, UserCheck } from 'lucide-react';

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
        { key: 'visualizarAlunos', dbKey: 'perm_visualizar_alunos', label: 'Visualizar Alunos', description: 'Permite visualizar informações dos alunos' },
        { key: 'gerenciarAlunos', dbKey: 'perm_gerenciar_alunos', label: 'Gerenciar Alunos', description: 'Permite criar, editar e excluir alunos' },
      ],
    },
  {
      title: 'Gestão de Turmas',
      permissions: [
        { key: 'visualizarTurmas', dbKey: 'perm_visualizar_turmas', label: 'Visualizar Turmas', description: 'Permite visualizar informações das turmas' },
        { key: 'gerenciarTurmas', dbKey: 'perm_gerenciar_turmas', label: 'Gerenciar Turmas', description: 'Permite criar, editar e excluir turmas' },
      ],
    },
  {
      title: 'Gestão de Aulas',
      permissions: [
        { key: 'visualizarAulas', dbKey: 'perm_visualizar_aulas', label: 'Visualizar Aulas', description: 'Permite visualizar informações das aulas' },
        { key: 'gerenciarAulas', dbKey: 'perm_gerenciar_aulas', label: 'Gerenciar Aulas', description: 'Permite criar, editar e excluir aulas' },
      ],
    },
  {
      title: 'Gestão de Avaliações',
      permissions: [
        { key: 'visualizarAvaliacoes', dbKey: 'perm_visualizar_avaliacoes', label: 'Visualizar Avaliações', description: 'Permite visualizar avaliações' },
        { key: 'gerenciarAvaliacoes', dbKey: 'perm_gerenciar_avaliacoes', label: 'Gerenciar Avaliações', description: 'Permite criar, editar e excluir avaliações' },
      ],
    },
  {
    title: 'Gestão de Contratos',
    permissions: [
      { key: 'visualizarContratos', dbKey: 'perm_visualizar_contratos', label: 'Visualizar Contratos', description: 'Permite visualizar contratos' },
      { key: 'gerenciarContratos', dbKey: 'perm_gerenciar_contratos', label: 'Gerenciar Contratos', description: 'Permite criar, editar e excluir contratos' },
    ],
  },
  {
    title: 'Gerador de Contratos',
    permissions: [
      { key: 'visualizarGeradorContratos', dbKey: 'perm_visualizar_gerador_contratos', label: 'Visualizar Gerador de Contratos', description: 'Permite acessar o gerador de contratos' },
      { key: 'gerenciarGeradorContratos', dbKey: 'perm_gerenciar_gerador_contratos', label: 'Gerenciar Gerador de Contratos', description: 'Permite gerar e imprimir contratos' },
    ],
  },
  {
      title: 'Gestão Financeira',
      permissions: [
        { key: 'visualizarFinanceiro', dbKey: 'perm_visualizar_financeiro', label: 'Visualizar Financeiro', description: 'Permite visualizar informações financeiras' },
        { key: 'gerenciarFinanceiro', dbKey: 'perm_gerenciar_financeiro', label: 'Gerenciar Financeiro', description: 'Permite criar, editar e excluir registros financeiros' },
      ],
    },
    {
      title: 'Gestão de Professores',
      permissions: [
        { key: 'visualizarProfessores', dbKey: 'perm_visualizar_professores', label: 'Visualizar Professores', description: 'Permite visualizar informações dos professores' },
        { key: 'gerenciarProfessores', dbKey: 'perm_gerenciar_professores', label: 'Gerenciar Professores', description: 'Permite criar, editar e excluir professores' },
      ],
    },
    {
      title: 'Gestão de Salas',
      permissions: [
        { key: 'visualizarSalas', dbKey: 'perm_visualizar_salas', label: 'Visualizar Salas', description: 'Permite visualizar informações das salas' },
        { key: 'gerenciarSalas', dbKey: 'perm_gerenciar_salas', label: 'Gerenciar Salas', description: 'Permite criar, editar e excluir salas' },
      ],
    },
    {
      title: 'Gestão de Presenças',
      permissions: [
        { key: 'gerenciarPresencas', dbKey: 'perm_gerenciar_presencas', label: 'Gerenciar Presenças', description: 'Permite gerenciar presenças' },
      ],
    },
];

export const PermissionToggle: React.FC<PermissionToggleProps> = ({
  user,
  onPermissionChange,
  disabled = false,
}) => {
  const [updating, setUpdating] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  // Atualizar o estado local quando o prop user mudar
  React.useEffect(() => {
    setLocalUser(user);
  }, [user]);

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

      // Atualizar o estado local imediatamente para refletir a mudança na UI
      const updatedUser = { ...localUser, [dbKey]: value };
      setLocalUser(updatedUser);
      
      // Não chamar onPermissionChange para evitar re-fetch desnecessário
      // if (onPermissionChange) {
      //   onPermissionChange();
      // }
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

  if (localUser.cargo === 'Admin') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-red-600" />
          <p className="text-red-800 font-medium">Proprietário (Admin)</p>
        </div>
        <p className="text-red-600 text-sm mt-1">
          Este usuário tem acesso total a todas as funcionalidades do sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Botão Toggle */}
      <Button
         variant="outline"
         onClick={() => setIsExpanded(!isExpanded)}
         className="w-full flex items-center justify-between p-3 h-auto hover:bg-gray-50 transition-colors"
         disabled={disabled}
       >
         <div className="flex items-center gap-2">
           <Settings className="h-4 w-4 text-gray-600" />
           <span className="font-medium text-gray-700">
             Gerenciar Permissões
           </span>
         </div>
         <div className="flex items-center gap-2">
           <span className="text-xs text-gray-500">
             {isExpanded ? 'Ocultar' : 'Mostrar'}
           </span>
           {isExpanded ? (
             <ChevronUp className="h-4 w-4 text-gray-500" />
           ) : (
             <ChevronDown className="h-4 w-4 text-gray-500" />
           )}
        </div>
      </Button>

      {/* Painel de Permissões */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="space-y-4 pt-2">
          {permissionGroups.map((group) => (
            <Card key={group.title} className="w-full border-gray-200">
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
                        checked={Boolean(localUser[permission.dbKey])}
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
      </div>
    </div>
  );
};

export default PermissionToggle;