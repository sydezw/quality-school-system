export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agenda: {
        Row: {
          created_at: string
          criado_por: string
          data: string
          descricao: string | null
          hora: string
          id: string
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por: string
          data: string
          descricao?: string | null
          hora: string
          id?: string
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string
          data?: string
          descricao?: string | null
          hora?: string
          id?: string
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos: {
        Row: {
          cpf: string | null
          created_at: string
          data_cancelamento: string | null
          data_conclusao: string | null
          data_exclusao: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          id: string
          idioma: Database["public"]["Enums"]["idioma"] | null
          nome: string
          numero_endereco: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_aluno"]
          telefone: string | null
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_cancelamento?: string | null
          data_conclusao?: string | null
          data_exclusao?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"] | null
          nome: string
          numero_endereco?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_aluno"]
          telefone?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_cancelamento?: string | null
          data_conclusao?: string | null
          data_exclusao?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"] | null
          nome?: string
          numero_endereco?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_aluno"]
          telefone?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "responsaveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas: {
        Row: {
          conteudo: string | null
          created_at: string
          data: string
          id: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          data: string
          id?: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          data?: string
          id?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          id: string
          nota: number | null
          observacao: string | null
          turma_id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data: string
          id?: string
          nota?: number | null
          observacao?: string | null
          turma_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          id?: string
          nota?: number | null
          observacao?: string | null
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_competencia: {
        Row: {
          aluno_id: string
          competencia: Database["public"]["Enums"]["competencia"]
          created_at: string
          data: string
          id: string
          nota: number
          observacao: string | null
          turma_id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          competencia: Database["public"]["Enums"]["competencia"]
          created_at?: string
          data: string
          id?: string
          nota: number
          observacao?: string | null
          turma_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          competencia?: Database["public"]["Enums"]["competencia"]
          created_at?: string
          data?: string
          id?: string
          nota?: number
          observacao?: string | null
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_competencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      boletos: {
        Row: {
          aluno_id: string | null
          contrato_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          id: string
          juros: number | null
          link_pagamento: string | null
          metodo_pagamento: string | null
          multa: number | null
          numero_parcela: number | null
          observacoes: string | null
          status: Database["public"]["Enums"]["status_boleto"]
          updated_at: string
          valor: number
        }
        Insert: {
          aluno_id?: string | null
          contrato_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          juros?: number | null
          link_pagamento?: string | null
          metodo_pagamento?: string | null
          multa?: number | null
          numero_parcela?: number | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_boleto"]
          updated_at?: string
          valor: number
        }
        Update: {
          aluno_id?: string | null
          contrato_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          juros?: number | null
          link_pagamento?: string | null
          metodo_pagamento?: string | null
          multa?: number | null
          numero_parcela?: number | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_boleto"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "boletos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boletos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boletos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_vencendo"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          chave: string
          created_at: string
          id: string
          updated_at: string
          valor: Json | null
        }
        Insert: {
          chave: string
          created_at?: string
          id?: string
          updated_at?: string
          valor?: Json | null
        }
        Update: {
          chave?: string
          created_at?: string
          id?: string
          updated_at?: string
          valor?: Json | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          aluno_id: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          idioma_contrato: Database["public"]["Enums"]["idioma"] | null
          observacao: string | null
          plano_id: string | null
          status_contrato: Database["public"]["Enums"]["status_contrato"]
          updated_at: string
          valor_mensalidade: number
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          id?: string
          idioma_contrato?: Database["public"]["Enums"]["idioma"] | null
          observacao?: string | null
          plano_id?: string | null
          status_contrato?: Database["public"]["Enums"]["status_contrato"]
          updated_at?: string
          valor_mensalidade: number
        }
        Update: {
          aluno_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          idioma_contrato?: Database["public"]["Enums"]["idioma"] | null
          observacao?: string | null
          plano_id?: string | null
          status_contrato?: Database["public"]["Enums"]["status_contrato"]
          updated_at?: string
          valor_mensalidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_despesa"]
          created_at: string
          data: string
          descricao: string
          id: string
          status: Database["public"]["Enums"]["status_despesa"]
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: Database["public"]["Enums"]["categoria_despesa"]
          created_at?: string
          data: string
          descricao: string
          id?: string
          status?: Database["public"]["Enums"]["status_despesa"]
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_despesa"]
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          status?: Database["public"]["Enums"]["status_despesa"]
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      documentos: {
        Row: {
          aluno_id: string | null
          arquivo_link: string | null
          created_at: string
          data: string
          id: string
          professor_id: string | null
          status: Database["public"]["Enums"]["status_documento"]
          tipo: Database["public"]["Enums"]["tipo_documento"]
          updated_at: string
        }
        Insert: {
          aluno_id?: string | null
          arquivo_link?: string | null
          created_at?: string
          data: string
          id?: string
          professor_id?: string | null
          status?: Database["public"]["Enums"]["status_documento"]
          tipo: Database["public"]["Enums"]["tipo_documento"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string | null
          arquivo_link?: string | null
          created_at?: string
          data?: string
          id?: string
          professor_id?: string | null
          status?: Database["public"]["Enums"]["status_documento"]
          tipo?: Database["public"]["Enums"]["tipo_documento"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_alunos: {
        Row: {
          aluno_id: string | null
          ativo_ou_encerrado: Database["public"]["Enums"]["ativo_ou_encerrado"]
          created_at: string | null
          data_primeiro_vencimento: string
          desconto_total: number
          forma_pagamento_material: string | null
          forma_pagamento_matricula: string | null
          forma_pagamento_plano: string | null
          id: string
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          numero_parcelas_material: number | null
          numero_parcelas_matricula: number | null
          numero_parcelas_plano: number | null
          plano_id: string
          porcentagem_progresso: number | null
          porcentagem_total: number | null
          status_geral: string
          updated_at: string | null
          valor_material: number
          valor_matricula: number
          valor_plano: number
          valor_total: number
        }
        Insert: {
          aluno_id?: string | null
          ativo_ou_encerrado?: Database["public"]["Enums"]["ativo_ou_encerrado"]
          created_at?: string | null
          data_primeiro_vencimento: string
          desconto_total?: number
          forma_pagamento_material?: string | null
          forma_pagamento_matricula?: string | null
          forma_pagamento_plano?: string | null
          id?: string
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          numero_parcelas_material?: number | null
          numero_parcelas_matricula?: number | null
          numero_parcelas_plano?: number | null
          plano_id: string
          porcentagem_progresso?: number | null
          porcentagem_total?: number | null
          status_geral?: string
          updated_at?: string | null
          valor_material?: number
          valor_matricula?: number
          valor_plano?: number
          valor_total: number
        }
        Update: {
          aluno_id?: string | null
          ativo_ou_encerrado?: Database["public"]["Enums"]["ativo_ou_encerrado"]
          created_at?: string | null
          data_primeiro_vencimento?: string
          desconto_total?: number
          forma_pagamento_material?: string | null
          forma_pagamento_matricula?: string | null
          forma_pagamento_plano?: string | null
          id?: string
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          numero_parcelas_material?: number | null
          numero_parcelas_matricula?: number | null
          numero_parcelas_plano?: number | null
          plano_id?: string
          porcentagem_progresso?: number | null
          porcentagem_total?: number | null
          status_geral?: string
          updated_at?: string | null
          valor_material?: number
          valor_matricula?: number
          valor_plano?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_alunos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      folha_pagamento: {
        Row: {
          ano: number
          created_at: string
          id: string
          mes: number
          professor_id: string
          status: Database["public"]["Enums"]["status_folha"]
          updated_at: string
          valor: number
        }
        Insert: {
          ano: number
          created_at?: string
          id?: string
          mes: number
          professor_id: string
          status?: Database["public"]["Enums"]["status_folha"]
          updated_at?: string
          valor: number
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          mes?: number
          professor_id?: string
          status?: Database["public"]["Enums"]["status_folha"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "folha_pagamento_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_pagamentos: {
        Row: {
          aluno_id: string | null
          boleto_id: string | null
          contrato_id: string | null
          created_at: string
          data_pagamento: string
          data_vencimento_original: string
          desconto: number | null
          id: string
          juros: number | null
          metodo_pagamento: string
          multa: number | null
          observacoes: string | null
          status_anterior: string | null
          status_novo: string | null
          tipo_transacao: string
          updated_at: string
          usuario_id: string | null
          valor_original: number
          valor_pago: number
        }
        Insert: {
          aluno_id?: string | null
          boleto_id?: string | null
          contrato_id?: string | null
          created_at?: string
          data_pagamento: string
          data_vencimento_original: string
          desconto?: number | null
          id?: string
          juros?: number | null
          metodo_pagamento: string
          multa?: number | null
          observacoes?: string | null
          status_anterior?: string | null
          status_novo?: string | null
          tipo_transacao: string
          updated_at?: string
          usuario_id?: string | null
          valor_original: number
          valor_pago: number
        }
        Update: {
          aluno_id?: string | null
          boleto_id?: string | null
          contrato_id?: string | null
          created_at?: string
          data_pagamento?: string
          data_vencimento_original?: string
          desconto?: number | null
          id?: string
          juros?: number | null
          metodo_pagamento?: string
          multa?: number | null
          observacoes?: string | null
          status_anterior?: string | null
          status_novo?: string | null
          tipo_transacao?: string
          updated_at?: string
          usuario_id?: string | null
          valor_original?: number
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "historico_pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_pagamentos_boleto_id_fkey"
            columns: ["boleto_id"]
            isOneToOne: false
            referencedRelation: "boletos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_pagamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_pagamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_vencendo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_pagamentos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_parcelas: {
        Row: {
          aluno_id: string | null
          atualizado_em: string | null
          comprovante: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string
          id: number
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          numero_parcela: number
          observacoes: string | null
          registro_financeiro_id: string | null
          status_pagamento:
            | Database["public"]["Enums"]["status_pagamento"]
            | null
          tipo_arquivamento:
            | Database["public"]["Enums"]["tipo_arquivamento"]
            | null
          tipo_item: Database["public"]["Enums"]["tipo_item"]
          valor: number
        }
        Insert: {
          aluno_id?: string | null
          atualizado_em?: string | null
          comprovante?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          id?: number
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          numero_parcela: number
          observacoes?: string | null
          registro_financeiro_id?: string | null
          status_pagamento?:
            | Database["public"]["Enums"]["status_pagamento"]
            | null
          tipo_arquivamento?:
            | Database["public"]["Enums"]["tipo_arquivamento"]
            | null
          tipo_item: Database["public"]["Enums"]["tipo_item"]
          valor: number
        }
        Update: {
          aluno_id?: string | null
          atualizado_em?: string | null
          comprovante?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          id?: number
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          numero_parcela?: number
          observacoes?: string | null
          registro_financeiro_id?: string | null
          status_pagamento?:
            | Database["public"]["Enums"]["status_pagamento"]
            | null
          tipo_arquivamento?:
            | Database["public"]["Enums"]["tipo_arquivamento"]
            | null
          tipo_item?: Database["public"]["Enums"]["tipo_item"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "historico_parcelas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_parcelas_registro_financeiro_id_fkey"
            columns: ["registro_financeiro_id"]
            isOneToOne: false
            referencedRelation: "financeiro_alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          acao: string
          created_at: string
          data: string
          descricao: string | null
          id: string
          registro_id: string | null
          tabela_afetada: string
          usuario_id: string
        }
        Insert: {
          acao: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          registro_id?: string | null
          tabela_afetada: string
          usuario_id: string
        }
        Update: {
          acao?: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          registro_id?: string | null
          tabela_afetada?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          idioma: Database["public"]["Enums"]["idioma"]
          nivel: Database["public"]["Enums"]["nivel"]
          nome: string
          status: Database["public"]["Enums"]["status_material"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          idioma: Database["public"]["Enums"]["idioma"]
          nivel: Database["public"]["Enums"]["nivel"]
          nome: string
          status?: Database["public"]["Enums"]["status_material"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"]
          nivel?: Database["public"]["Enums"]["nivel"]
          nome?: string
          status?: Database["public"]["Enums"]["status_material"]
          updated_at?: string
        }
        Relationships: []
      }
      materiais_entregues: {
        Row: {
          aluno_id: string | null
          created_at: string
          data_entrega: string
          id: string
          material_id: string
          updated_at: string
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string
          data_entrega: string
          id?: string
          material_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string | null
          created_at?: string
          data_entrega?: string
          id?: string
          material_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_entregues_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_entregues_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          data_envio: string
          destinatario_id: string
          id: string
          mensagem: string
          status: Database["public"]["Enums"]["status_notificacao"]
          tipo: Database["public"]["Enums"]["tipo_notificacao"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_envio?: string
          destinatario_id: string
          id?: string
          mensagem: string
          status?: Database["public"]["Enums"]["status_notificacao"]
          tipo: Database["public"]["Enums"]["tipo_notificacao"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_envio?: string
          destinatario_id?: string
          id?: string
          mensagem?: string
          status?: Database["public"]["Enums"]["status_notificacao"]
          tipo?: Database["public"]["Enums"]["tipo_notificacao"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      parcelas_alunos: {
        Row: {
          atualizado_em: string | null
          comprovante: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string
          id: number
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          numero_parcela: number
          observacoes: string | null
          registro_financeiro_id: string
          status_pagamento: Database["public"]["Enums"]["status_pagamento"]
          tipo_item: Database["public"]["Enums"]["tipo_item"]
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          comprovante?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          id?: number
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          numero_parcela: number
          observacoes?: string | null
          registro_financeiro_id: string
          status_pagamento?: Database["public"]["Enums"]["status_pagamento"]
          tipo_item: Database["public"]["Enums"]["tipo_item"]
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          comprovante?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          id?: number
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          numero_parcela?: number
          observacoes?: string | null
          registro_financeiro_id?: string
          status_pagamento?: Database["public"]["Enums"]["status_pagamento"]
          tipo_item?: Database["public"]["Enums"]["tipo_item"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_registro_financeiro_id_fkey"
            columns: ["registro_financeiro_id"]
            isOneToOne: false
            referencedRelation: "financeiro_alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      pesquisas_satisfacao: {
        Row: {
          aluno_id: string
          comentario: string | null
          created_at: string
          data: string
          id: string
          nota: number
          turma_id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          comentario?: string | null
          created_at?: string
          data: string
          id?: string
          nota: number
          turma_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          comentario?: string | null
          created_at?: string
          data?: string
          id?: string
          nota?: number
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pesquisas_satisfacao_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisas_satisfacao_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          ativo: boolean | null
          carga_horaria_total: number | null
          created_at: string
          descricao: string
          frequencia_aulas: Json
          horario_por_aula: number | null
          id: string
          idioma: Database["public"]["Enums"]["idioma"]
          nome: string
          numero_aulas: number
          observacoes: string | null
          permite_cancelamento: boolean | null
          permite_parcelamento: boolean | null
          updated_at: string
          valor_por_aula: number | null
          valor_total: number | null
        }
        Insert: {
          ativo?: boolean | null
          carga_horaria_total?: number | null
          created_at?: string
          descricao: string
          frequencia_aulas: Json
          horario_por_aula?: number | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"]
          nome: string
          numero_aulas: number
          observacoes?: string | null
          permite_cancelamento?: boolean | null
          permite_parcelamento?: boolean | null
          updated_at?: string
          valor_por_aula?: number | null
          valor_total?: number | null
        }
        Update: {
          ativo?: boolean | null
          carga_horaria_total?: number | null
          created_at?: string
          descricao?: string
          frequencia_aulas?: Json
          horario_por_aula?: number | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"]
          nome?: string
          numero_aulas?: number
          observacoes?: string | null
          permite_cancelamento?: boolean | null
          permite_parcelamento?: boolean | null
          updated_at?: string
          valor_por_aula?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      planos_aula: {
        Row: {
          conteudo: string
          created_at: string
          data: string
          id: string
          professor_id: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          data: string
          id?: string
          professor_id: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          data?: string
          id?: string
          professor_id?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_aula_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_aula_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          aluno_id: string | null
          aula_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["status_presenca"]
          updated_at: string
        }
        Insert: {
          aluno_id?: string | null
          aula_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["status_presenca"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string | null
          aula_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["status_presenca"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "presencas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          cpf: string | null
          created_at: string
          data_exclusao: string | null
          email: string | null
          excluido: boolean | null
          id: string
          idiomas: string
          nome: string
          salario: number | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          data_exclusao?: string | null
          email?: string | null
          excluido?: boolean | null
          id?: string
          idiomas: string
          nome: string
          salario?: number | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          data_exclusao?: string | null
          email?: string | null
          excluido?: boolean | null
          id?: string
          idiomas?: string
          nome?: string
          salario?: number | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ranking: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          id: string
          pontuacao: number
          turma_id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data: string
          id?: string
          pontuacao: number
          turma_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          id?: string
          pontuacao?: number
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      recibos: {
        Row: {
          aluno_id: string
          arquivo_link: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          updated_at: string
          valor: number
        }
        Insert: {
          aluno_id: string
          arquivo_link?: string | null
          created_at?: string
          data: string
          descricao: string
          id?: string
          updated_at?: string
          valor: number
        }
        Update: {
          aluno_id?: string
          arquivo_link?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "recibos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      responsaveis: {
        Row: {
          cpf: string | null
          created_at: string
          endereco: string | null
          id: string
          nome: string
          numero_endereco: string | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome: string
          numero_endereco?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome?: string
          numero_endereco?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      salas: {
        Row: {
          capacidade: number
          created_at: string
          id: string
          nome: string
          status_salas: string
          tipo: string
          updated_at: string
        }
        Insert: {
          capacidade?: number
          created_at?: string
          id?: string
          nome: string
          status_salas?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          capacidade?: number
          created_at?: string
          id?: string
          nome?: string
          status_salas?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          created_at: string
          dias_da_semana: string
          horario: string
          id: string
          idioma: Database["public"]["Enums"]["idioma"]
          materiais_ids: Json | null
          nivel: Database["public"]["Enums"]["nivel"]
          nome: string
          professor_id: string | null
          sala_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dias_da_semana: string
          horario: string
          id?: string
          idioma: Database["public"]["Enums"]["idioma"]
          materiais_ids?: Json | null
          nivel: Database["public"]["Enums"]["nivel"]
          nome: string
          professor_id?: string | null
          sala_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dias_da_semana?: string
          horario?: string
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"]
          materiais_ids?: Json | null
          nivel?: Database["public"]["Enums"]["nivel"]
          nome?: string
          professor_id?: string | null
          sala_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          created_at: string
          email: string
          funcao: string | null
          id: string
          nome: string
          permissoes: string | null
          senha: string
          status: string
          updated_at: string
        }
        Insert: {
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          created_at?: string
          email: string
          funcao?: string | null
          id?: string
          nome: string
          permissoes?: string | null
          senha: string
          status?: string
          updated_at?: string
        }
        Update: {
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          created_at?: string
          email?: string
          funcao?: string | null
          id?: string
          nome?: string
          permissoes?: string | null
          senha?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuarios_pendentes: {
        Row: {
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          created_at: string
          email: string
          funcao: string | null
          id: string
          nome: string
          permissoes: string | null
          senha: string
          status: string
          updated_at: string
        }
        Insert: {
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          created_at?: string
          email: string
          funcao?: string | null
          id?: string
          nome: string
          permissoes?: string | null
          senha: string
          status?: string
          updated_at?: string
        }
        Update: {
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          created_at?: string
          email?: string
          funcao?: string | null
          id?: string
          nome?: string
          permissoes?: string | null
          senha?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      contratos_vencendo: {
        Row: {
          aluno_id: string | null
          aluno_nome: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          dias_restantes: number | null
          id: string | null
          observacao: string | null
          situacao: string | null
          status: Database["public"]["Enums"]["status_contrato"] | null
          updated_at: string | null
          valor_mensalidade: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_aluno_dependencies: {
        Args: { p_aluno_id: string }
        Returns: Json
      }
      check_professor_dependencies: {
        Args: { p_professor_id: string }
        Returns: Json
      }
      obter_permissoes_usuario: {
        Args: { usuario_id: string }
        Returns: Json
      }
      verificar_permissao: {
        Args: { usuario_id: string; permissao: string }
        Returns: boolean
      }
    }
    Enums: {
      ativo_ou_encerrado: "ativo" | "encerrado"
      cargo_usuario: "Secretária" | "Gerente" | "Admin"
      categoria_despesa: "salário" | "aluguel" | "material" | "manutenção"
      competencia: "Listening" | "Speaking" | "Writing" | "Reading"
      idioma: "Inglês" | "Japonês"
      idioma_registro_financeiro: "Inglês" | "Japonês"
      nivel:
        | "Book 1"
        | "Book 2"
        | "Book 3"
        | "Book 4"
        | "Book 5"
        | "Book 6"
        | "Book 7"
        | "Book 8"
        | "Book 9"
        | "Book 10"
      status_aluno: "Ativo" | "Trancado" | "Inativo"
      status_boleto: "Pago" | "Pendente" | "Vencido"
      status_contrato:
        | "Ativo"
        | "Agendado"
        | "Vencendo"
        | "Vencido"
        | "Cancelado"
      status_despesa: "Pago" | "Pendente"
      status_documento: "gerado" | "assinado" | "cancelado"
      status_folha: "Pago" | "Pendente"
      status_material: "disponivel" | "indisponivel"
      status_notificacao: "enviada" | "pendente" | "erro"
      status_pagamento: "pago" | "pendente" | "vencido" | "cancelado"
      status_presenca: "Presente" | "Falta" | "Justificada"
      tipo_arquivamento: "renovacao" | "cancelamento" | "conclusao"
      tipo_documento:
        | "contrato"
        | "declaracao_matricula"
        | "declaracao_frequencia"
        | "declaracao_conclusao"
        | "certificado_professor"
        | "diploma_professor"
        | "comprovante_experiencia"
        | "documento_pessoal"
      tipo_item: "plano" | "material" | "matrícula"
      tipo_notificacao: "boleto" | "presenca" | "lembrete" | "geral"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ativo_ou_encerrado: ["ativo", "encerrado"],
      cargo_usuario: ["Secretária", "Gerente", "Admin"],
      categoria_despesa: ["salário", "aluguel", "material", "manutenção"],
      competencia: ["Listening", "Speaking", "Writing", "Reading"],
      idioma: ["Inglês", "Japonês"],
      idioma_registro_financeiro: ["Inglês", "Japonês"],
      nivel: [
        "Book 1",
        "Book 2",
        "Book 3",
        "Book 4",
        "Book 5",
        "Book 6",
        "Book 7",
        "Book 8",
        "Book 9",
        "Book 10",
      ],
      status_aluno: ["Ativo", "Trancado", "Inativo"],
      status_boleto: ["Pago", "Pendente", "Vencido"],
      status_contrato: [
        "Ativo",
        "Agendado",
        "Vencendo",
        "Vencido",
        "Cancelado",
      ],
      status_despesa: ["Pago", "Pendente"],
      status_documento: ["gerado", "assinado", "cancelado"],
      status_folha: ["Pago", "Pendente"],
      status_material: ["disponivel", "indisponivel"],
      status_notificacao: ["enviada", "pendente", "erro"],
      status_pagamento: ["pago", "pendente", "vencido", "cancelado"],
      status_presenca: ["Presente", "Falta", "Justificada"],
      tipo_arquivamento: ["renovacao", "cancelamento", "conclusao"],
      tipo_documento: [
        "contrato",
        "declaracao_matricula",
        "declaracao_frequencia",
        "declaracao_conclusao",
        "certificado_professor",
        "diploma_professor",
        "comprovante_experiencia",
        "documento_pessoal",
      ],
      tipo_item: ["plano", "material", "matrícula"],
      tipo_notificacao: ["boleto", "presenca", "lembrete", "geral"],
    },
  },
} as const
