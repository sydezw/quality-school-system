export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      aluno_turma: {
        Row: {
          aluno_id: string
          created_at: string | null
          data_matricula: string | null
          id: string
          observacoes: string | null
          status: string | null
          turma_id: string
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string | null
          data_matricula?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          turma_id: string
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string | null
          data_matricula?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          turma_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aluno_turma_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aluno_turma_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "aluno_turma_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "aluno_turma_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "aluno_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "aluno_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "aluno_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aluno_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      alunos: {
        Row: {
          aulas_particulares: boolean | null
          aulas_turma: boolean | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          data_cancelamento: string | null
          data_conclusao: string | null
          data_exclusao: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          idioma: Database["public"]["Enums"]["idioma"] | null
          nivel: string | null
          nome: string
          numero_endereco: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_aluno"]
          telefone: string | null
          turma_id: string | null
          turma_particular_id: string | null
          updated_at: string
        }
        Insert: {
          aulas_particulares?: boolean | null
          aulas_turma?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_cancelamento?: string | null
          data_conclusao?: string | null
          data_exclusao?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"] | null
          nivel?: string | null
          nome: string
          numero_endereco?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_aluno"]
          telefone?: string | null
          turma_id?: string | null
          turma_particular_id?: string | null
          updated_at?: string
        }
        Update: {
          aulas_particulares?: boolean | null
          aulas_turma?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_cancelamento?: string | null
          data_conclusao?: string | null
          data_exclusao?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"] | null
          nivel?: string | null
          nome?: string
          numero_endereco?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_aluno"]
          telefone?: string | null
          turma_id?: string | null
          turma_particular_id?: string | null
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
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "alunos_turma_particular_id_fkey"
            columns: ["turma_particular_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "alunos_turma_particular_id_fkey"
            columns: ["turma_particular_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "alunos_turma_particular_id_fkey"
            columns: ["turma_particular_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_turma_particular_id_fkey"
            columns: ["turma_particular_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      alunos_financeiro: {
        Row: {
          aluno_id: string
          ativo_ou_encerrado: boolean
          aulas_pagas: number
          created_at: string | null
          data_primeiro_vencimento: string
          desconto_total: number
          forma_pagamento_material:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          forma_pagamento_matricula:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          forma_pagamento_plano:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          historico: boolean
          id: string
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          migrado: boolean
          numero_parcelas_material: number | null
          numero_parcelas_matricula: number | null
          numero_parcelas_plano: number | null
          plano_id: string
          porcentagem_progresso: number | null
          porcentagem_total: number | null
          status_geral: Database["public"]["Enums"]["status_geral_financeiro"]
          updated_at: string | null
          valor_material: number
          valor_matricula: number
          valor_plano: number
          valor_total: number
        }
        Insert: {
          aluno_id: string
          ativo_ou_encerrado?: boolean
          aulas_pagas?: number
          created_at?: string | null
          data_primeiro_vencimento: string
          desconto_total?: number
          forma_pagamento_material?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          forma_pagamento_matricula?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          forma_pagamento_plano?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          historico?: boolean
          id?: string
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          migrado?: boolean
          numero_parcelas_material?: number | null
          numero_parcelas_matricula?: number | null
          numero_parcelas_plano?: number | null
          plano_id: string
          porcentagem_progresso?: number | null
          porcentagem_total?: number | null
          status_geral?: Database["public"]["Enums"]["status_geral_financeiro"]
          updated_at?: string | null
          valor_material?: number
          valor_matricula?: number
          valor_plano?: number
          valor_total: number
        }
        Update: {
          aluno_id?: string
          ativo_ou_encerrado?: boolean
          aulas_pagas?: number
          created_at?: string | null
          data_primeiro_vencimento?: string
          desconto_total?: number
          forma_pagamento_material?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          forma_pagamento_matricula?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          forma_pagamento_plano?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          historico?: boolean
          id?: string
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          migrado?: boolean
          numero_parcelas_material?: number | null
          numero_parcelas_matricula?: number | null
          numero_parcelas_plano?: number | null
          plano_id?: string
          porcentagem_progresso?: number | null
          porcentagem_total?: number | null
          status_geral?: Database["public"]["Enums"]["status_geral_financeiro"]
          updated_at?: string | null
          valor_material?: number
          valor_matricula?: number
          valor_plano?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_alunos_financeiro_aluno_id"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alunos_financeiro_aluno_id"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "fk_alunos_financeiro_aluno_id"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "fk_alunos_financeiro_aluno_id"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "fk_alunos_financeiro_plano_id"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos_parcelas: {
        Row: {
          alunos_financeiro_id: string
          atualizado_em: string | null
          comprovante: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao_item: string | null
          final_ciclo: string | null
          forma_pagamento: string | null
          historico: boolean
          id: number
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          inicio_ciclo: string | null
          nome_aluno: string | null
          numero_parcela: number
          observacoes: string | null
          status_pagamento:
            | Database["public"]["Enums"]["status_pagamento"]
            | null
          tipo_item: Database["public"]["Enums"]["tipo_item"]
          valor: number
        }
        Insert: {
          alunos_financeiro_id: string
          atualizado_em?: string | null
          comprovante?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao_item?: string | null
          final_ciclo?: string | null
          forma_pagamento?: string | null
          historico?: boolean
          id?: number
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          inicio_ciclo?: string | null
          nome_aluno?: string | null
          numero_parcela: number
          observacoes?: string | null
          status_pagamento?:
            | Database["public"]["Enums"]["status_pagamento"]
            | null
          tipo_item: Database["public"]["Enums"]["tipo_item"]
          valor: number
        }
        Update: {
          alunos_financeiro_id?: string
          atualizado_em?: string | null
          comprovante?: string | null
          criado_em?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao_item?: string | null
          final_ciclo?: string | null
          forma_pagamento?: string | null
          historico?: boolean
          id?: number
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          inicio_ciclo?: string | null
          nome_aluno?: string | null
          numero_parcela?: number
          observacoes?: string | null
          status_pagamento?:
            | Database["public"]["Enums"]["status_pagamento"]
            | null
          tipo_item?: Database["public"]["Enums"]["tipo_item"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "alunos_parcelas_alunos_financeiro_id_fkey"
            columns: ["alunos_financeiro_id"]
            isOneToOne: false
            referencedRelation: "alunos_financeiro"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas: {
        Row: {
          conteudo: string | null
          created_at: string
          data: string
          descricao: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          observacoes: string | null
          professor_id: string | null
          semestre: string | null
          status: string | null
          tipo_aula: Database["public"]["Enums"]["tipo_aula_enum"]
          titulo: string | null
          turma_id: string
          updated_at: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          data: string
          descricao?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          semestre?: string | null
          status?: string | null
          tipo_aula?: Database["public"]["Enums"]["tipo_aula_enum"]
          titulo?: string | null
          turma_id: string
          updated_at?: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          data?: string
          descricao?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          semestre?: string | null
          status?: string | null
          tipo_aula?: Database["public"]["Enums"]["tipo_aula_enum"]
          titulo?: string | null
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "aulas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "aulas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "fk_aulas_professor"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas_particulares: {
        Row: {
          aluno_id: string
          created_at: string | null
          data_aula: string
          duracao_minutos: number | null
          id: string
          observacoes: string | null
          professor_id: string | null
          status: string | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          aluno_id: string
          created_at?: string | null
          data_aula: string
          duracao_minutos?: number | null
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          aluno_id?: string
          created_at?: string | null
          data_aula?: string
          duracao_minutos?: number | null
          id?: string
          observacoes?: string | null
          professor_id?: string | null
          status?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "aulas_particulares_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_particulares_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "aulas_particulares_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "aulas_particulares_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "aulas_particulares_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          aluno_id: string
          aluno_turma_id: string | null
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
          aluno_turma_id?: string | null
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
          aluno_turma_id?: string | null
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
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_aluno_turma_id_fkey"
            columns: ["aluno_turma_id"]
            isOneToOne: false
            referencedRelation: "aluno_turma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "avaliacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "avaliacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      avaliacoes_competencia: {
        Row: {
          aluno_id: string
          aluno_turma_id: string | null
          aula_id: string | null
          book_snapshot: string | null
          competencia: Database["public"]["Enums"]["competencia"]
          created_at: string
          data: string
          id: string
          nota: number
          observacao: string | null
          turma_id: string
          turma_idioma_snapshot: string | null
          turma_nivel_snapshot: string | null
          turma_nome_snapshot: string | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          aluno_turma_id?: string | null
          aula_id?: string | null
          book_snapshot?: string | null
          competencia: Database["public"]["Enums"]["competencia"]
          created_at?: string
          data: string
          id?: string
          nota: number
          observacao?: string | null
          turma_id: string
          turma_idioma_snapshot?: string | null
          turma_nivel_snapshot?: string | null
          turma_nome_snapshot?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          aluno_turma_id?: string | null
          aula_id?: string | null
          book_snapshot?: string | null
          competencia?: Database["public"]["Enums"]["competencia"]
          created_at?: string
          data?: string
          id?: string
          nota?: number
          observacao?: string | null
          turma_id?: string
          turma_idioma_snapshot?: string | null
          turma_nivel_snapshot?: string | null
          turma_nome_snapshot?: string | null
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
            foreignKeyName: "avaliacoes_competencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_aluno_turma_id_fkey"
            columns: ["aluno_turma_id"]
            isOneToOne: false
            referencedRelation: "aluno_turma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      avaliacoes_prova_final: {
        Row: {
          acertos: number
          aluno_id: string
          aprovacao_manual: boolean
          aprovacao_status: string | null
          aula_id: string
          created_at: string
          data_prova: string
          id: string
          observacao: string | null
          total_questoes: number
          turma_id: string
          updated_at: string
        }
        Insert: {
          acertos: number
          aluno_id: string
          aprovacao_manual?: boolean
          aprovacao_status?: string | null
          aula_id: string
          created_at?: string
          data_prova: string
          id?: string
          observacao?: string | null
          total_questoes: number
          turma_id: string
          updated_at?: string
        }
        Update: {
          acertos?: number
          aluno_id?: string
          aprovacao_manual?: boolean
          aprovacao_status?: string | null
          aula_id?: string
          created_at?: string
          data_prova?: string
          id?: string
          observacao?: string | null
          total_questoes?: number
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_prova_final_aluno_fk"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_prova_final_aluno_fk"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_prova_final_aluno_fk"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_prova_final_aluno_fk"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_prova_final_aula_fk"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_prova_final_turma_fk"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "avaliacoes_prova_final_turma_fk"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "avaliacoes_prova_final_turma_fk"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_prova_final_turma_fk"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      bd_ativo: {
        Row: {
          created_at: string
          id: number
          number: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          number?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          number?: number | null
        }
        Relationships: []
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
            foreignKeyName: "boletos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "boletos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "boletos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
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
            foreignKeyName: "contratos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "contratos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "contratos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
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
            foreignKeyName: "documentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "documentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "documentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
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
      documentos_contratos: {
        Row: {
          created_at: string | null
          data: string | null
          descricao: string | null
          id: string
          link_arquivo: string
          nome_documento: string
          status: string | null
          tipo_documento: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          link_arquivo: string
          nome_documento: string
          status?: string | null
          tipo_documento: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          link_arquivo?: string
          nome_documento?: string
          status?: string | null
          tipo_documento?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financeiro_alunos: {
        Row: {
          aluno_id: string
          ativo_ou_encerrado: Database["public"]["Enums"]["ativo_ou_encerrado"]
          created_at: string | null
          data_primeiro_vencimento: string
          desconto_total: number
          forma_pagamento_material: string | null
          forma_pagamento_matricula: string | null
          forma_pagamento_plano: string | null
          id: string
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          migrado: Database["public"]["Enums"]["migrado"]
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
          aluno_id: string
          ativo_ou_encerrado?: Database["public"]["Enums"]["ativo_ou_encerrado"]
          created_at?: string | null
          data_primeiro_vencimento: string
          desconto_total?: number
          forma_pagamento_material?: string | null
          forma_pagamento_matricula?: string | null
          forma_pagamento_plano?: string | null
          id?: string
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          migrado?: Database["public"]["Enums"]["migrado"]
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
          aluno_id?: string
          ativo_ou_encerrado?: Database["public"]["Enums"]["ativo_ou_encerrado"]
          created_at?: string | null
          data_primeiro_vencimento?: string
          desconto_total?: number
          forma_pagamento_material?: string | null
          forma_pagamento_matricula?: string | null
          forma_pagamento_plano?: string | null
          id?: string
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          migrado?: Database["public"]["Enums"]["migrado"]
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
            foreignKeyName: "financeiro_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "financeiro_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "financeiro_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
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
            foreignKeyName: "historico_pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "historico_pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "historico_pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
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
            foreignKeyName: "historico_parcelas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "historico_parcelas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "historico_parcelas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
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
      parcelas_alunos: {
        Row: {
          atualizado_em: string | null
          comprovante: string | null
          criado_em: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao_item: string | null
          forma_pagamento: string | null
          id: number
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          nome_aluno: string | null
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
          descricao_item?: string | null
          forma_pagamento?: string | null
          id?: number
          idioma_registro: Database["public"]["Enums"]["idioma_registro_financeiro"]
          nome_aluno?: string | null
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
          descricao_item?: string | null
          forma_pagamento?: string | null
          id?: number
          idioma_registro?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          nome_aluno?: string | null
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
      parcelas_migracao_raw: {
        Row: {
          aluno_nome: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao_item: string | null
          forma_pagamento: string
          historico_migrados: boolean | null
          id: number
          idioma: Database["public"]["Enums"]["idioma_registro_financeiro"]
          observacoes: string | null
          status_pagamento: Database["public"]["Enums"]["status_pagamento"]
          tipo_item: Database["public"]["Enums"]["tipo_item"]
          valor: number
        }
        Insert: {
          aluno_nome?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao_item?: string | null
          forma_pagamento: string
          historico_migrados?: boolean | null
          id?: number
          idioma?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          observacoes?: string | null
          status_pagamento?: Database["public"]["Enums"]["status_pagamento"]
          tipo_item?: Database["public"]["Enums"]["tipo_item"]
          valor: number
        }
        Update: {
          aluno_nome?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao_item?: string | null
          forma_pagamento?: string
          historico_migrados?: boolean | null
          id?: number
          idioma?: Database["public"]["Enums"]["idioma_registro_financeiro"]
          observacoes?: string | null
          status_pagamento?: Database["public"]["Enums"]["status_pagamento"]
          tipo_item?: Database["public"]["Enums"]["tipo_item"]
          valor?: number
        }
        Relationships: []
      }
      pesquisas_satisfacao: {
        Row: {
          aluno_id: string
          aluno_turma_id: string | null
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
          aluno_turma_id?: string | null
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
          aluno_turma_id?: string | null
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
            foreignKeyName: "pesquisas_satisfacao_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "pesquisas_satisfacao_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "pesquisas_satisfacao_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "pesquisas_satisfacao_aluno_turma_id_fkey"
            columns: ["aluno_turma_id"]
            isOneToOne: false
            referencedRelation: "aluno_turma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisas_satisfacao_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "pesquisas_satisfacao_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "pesquisas_satisfacao_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisas_satisfacao_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      planos: {
        Row: {
          ativo: boolean | null
          carga_horaria_total: number | null
          created_at: string
          descricao: string
          frequencia_aulas: string
          horario_por_aula: number | null
          id: string
          idioma: Database["public"]["Enums"]["idioma"]
          nome: string
          numero_aulas: number
          observacoes: string | null
          permite_cancelamento: boolean | null
          permite_parcelamento: boolean | null
          tipo_valor: string | null
          updated_at: string
          valor_por_aula: number | null
          valor_total: number | null
        }
        Insert: {
          ativo?: boolean | null
          carga_horaria_total?: number | null
          created_at?: string
          descricao: string
          frequencia_aulas: string
          horario_por_aula?: number | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"]
          nome: string
          numero_aulas: number
          observacoes?: string | null
          permite_cancelamento?: boolean | null
          permite_parcelamento?: boolean | null
          tipo_valor?: string | null
          updated_at?: string
          valor_por_aula?: number | null
          valor_total?: number | null
        }
        Update: {
          ativo?: boolean | null
          carga_horaria_total?: number | null
          created_at?: string
          descricao?: string
          frequencia_aulas?: string
          horario_por_aula?: number | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"]
          nome?: string
          numero_aulas?: number
          observacoes?: string | null
          permite_cancelamento?: boolean | null
          permite_parcelamento?: boolean | null
          tipo_valor?: string | null
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
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "planos_aula_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "planos_aula_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_aula_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      presencas: {
        Row: {
          aluno_id: string | null
          aluno_turma_id: string | null
          aula_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["status_presenca"]
          updated_at: string
        }
        Insert: {
          aluno_id?: string | null
          aluno_turma_id?: string | null
          aula_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["status_presenca"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string | null
          aluno_turma_id?: string | null
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
            foreignKeyName: "presencas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "presencas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "presencas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "presencas_aluno_turma_id_fkey"
            columns: ["aluno_turma_id"]
            isOneToOne: false
            referencedRelation: "aluno_turma"
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
          cargo: Database["public"]["Enums"]["cargo_usuario"] | null
          cpf: string | null
          created_at: string
          data_exclusao: string | null
          email: string | null
          excluido: boolean | null
          id: string
          idiomas: string
          nome: string
          salario: number | null
          senha: string | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cargo?: Database["public"]["Enums"]["cargo_usuario"] | null
          cpf?: string | null
          created_at?: string
          data_exclusao?: string | null
          email?: string | null
          excluido?: boolean | null
          id?: string
          idiomas: string
          nome: string
          salario?: number | null
          senha?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: Database["public"]["Enums"]["cargo_usuario"] | null
          cpf?: string | null
          created_at?: string
          data_exclusao?: string | null
          email?: string | null
          excluido?: boolean | null
          id?: string
          idiomas?: string
          nome?: string
          salario?: number | null
          senha?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ranking: {
        Row: {
          aluno_id: string
          aluno_turma_id: string | null
          created_at: string
          data: string
          id: string
          pontuacao: number
          turma_id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          aluno_turma_id?: string | null
          created_at?: string
          data: string
          id?: string
          pontuacao: number
          turma_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          aluno_turma_id?: string | null
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
            foreignKeyName: "ranking_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "ranking_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "ranking_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "ranking_aluno_turma_id_fkey"
            columns: ["aluno_turma_id"]
            isOneToOne: false
            referencedRelation: "aluno_turma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "ranking_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "ranking_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["turma_id"]
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
          {
            foreignKeyName: "recibos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "recibos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "recibos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
        ]
      }
      responsaveis: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
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
          email?: string | null
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
          email?: string | null
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
          aulas_por_semana: number | null
          cor_calendario: string | null
          cor_prova: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          dias_da_semana: string
          horario: string
          id: string
          idioma: Database["public"]["Enums"]["idioma"]
          materiais_ids: Json | null
          nivel: Database["public"]["Enums"]["nivel"] | null
          nome: string
          plano_id: string | null
          professor_id: string | null
          sala_id: string | null
          status: string
          tipo_turma: Database["public"]["Enums"]["tipo_turma"] | null
          total_aulas: number | null
          updated_at: string
        }
        Insert: {
          aulas_por_semana?: number | null
          cor_calendario?: string | null
          cor_prova?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          dias_da_semana: string
          horario: string
          id?: string
          idioma: Database["public"]["Enums"]["idioma"]
          materiais_ids?: Json | null
          nivel?: Database["public"]["Enums"]["nivel"] | null
          nome: string
          plano_id?: string | null
          professor_id?: string | null
          sala_id?: string | null
          status?: string
          tipo_turma?: Database["public"]["Enums"]["tipo_turma"] | null
          total_aulas?: number | null
          updated_at?: string
        }
        Update: {
          aulas_por_semana?: number | null
          cor_calendario?: string | null
          cor_prova?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          dias_da_semana?: string
          horario?: string
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"]
          materiais_ids?: Json | null
          nivel?: Database["public"]["Enums"]["nivel"] | null
          nome?: string
          plano_id?: string | null
          professor_id?: string | null
          sala_id?: string | null
          status?: string
          tipo_turma?: Database["public"]["Enums"]["tipo_turma"] | null
          total_aulas?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "contratos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "contratos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "contratos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
        ]
      }
      estatisticas_presenca_aluno: {
        Row: {
          aluno_id: string | null
          aluno_nome: string | null
          faltas: number | null
          faltas_repostas: number | null
          percentual_presenca: number | null
          presencas: number | null
          total_aulas: number | null
          turma_id: string | null
          turma_nome: string | null
        }
        Relationships: []
      }
      progresso_competencia_aluno: {
        Row: {
          aluno_id: string | null
          aluno_nome: string | null
          competencia: Database["public"]["Enums"]["competencia"] | null
          nota_media: number | null
          total_avaliacoes: number | null
          turma_id: string | null
          turma_nome: string | null
          ultima_avaliacao: string | null
        }
        Relationships: []
      }
      view_alunos_turmas: {
        Row: {
          aluno_id: string | null
          aluno_nome: string | null
          aluno_status: Database["public"]["Enums"]["status_aluno"] | null
          data_matricula: string | null
          matricula_observacoes: string | null
          matricula_status: string | null
          turma_dias: string | null
          turma_horario: string | null
          turma_id: string | null
          turma_idioma: Database["public"]["Enums"]["idioma"] | null
          turma_nivel: Database["public"]["Enums"]["nivel"] | null
          turma_nome: string | null
        }
        Relationships: []
      }
      view_avaliacoes_aula_historico: {
        Row: {
          aluno_id: string | null
          aula_id: string | null
          book: string | null
          data: string | null
          listening: number | null
          reading: number | null
          speaking: number | null
          turma_idioma_snapshot: string | null
          turma_nivel_snapshot: string | null
          turma_nome_snapshot: string | null
          writing: number | null
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
            foreignKeyName: "avaliacoes_competencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "estatisticas_presenca_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "progresso_competencia_aluno"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "view_alunos_turmas"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "avaliacoes_competencia_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calcular_valor_total_correto: {
        Args: {
          p_desconto_total: number
          p_tipo_valor?: string
          p_valor_material: number
          p_valor_matricula: number
          p_valor_plano: number
        }
        Returns: number
      }
      calculate_aulas_por_semana: {
        Args: { dias_da_semana_text: string }
        Returns: number
      }
      check_aluno_dependencies: { Args: { p_aluno_id: string }; Returns: Json }
      check_horario_conflito: {
        Args: { aluno_uuid: string; nova_turma_id: string }
        Returns: boolean
      }
      check_professor_dependencies: {
        Args: { p_professor_id: string }
        Returns: Json
      }
      get_aluno_turmas: {
        Args: { aluno_uuid: string }
        Returns: {
          data_matricula: string
          matricula_status: string
          turma_id: string
          turma_idioma: string
          turma_nivel: string
          turma_nome: string
        }[]
      }
      get_turma_alunos: {
        Args: { turma_uuid: string }
        Returns: {
          aluno_id: string
          aluno_nome: string
          aluno_status: string
          data_matricula: string
          matricula_status: string
        }[]
      }
      get_turma_book_nome: { Args: { p_turma_id: string }; Returns: string }
      get_turma_color: {
        Args: {
          p_idioma: Database["public"]["Enums"]["idioma"]
          p_nivel: Database["public"]["Enums"]["nivel"]
        }
        Returns: string
      }
      inserir_aluno_financeiro: { Args: { dados: Json }; Returns: undefined }
      obter_permissoes_usuario: { Args: { usuario_id: string }; Returns: Json }
      verificar_permissao: {
        Args: { permissao: string; usuario_id: string }
        Returns: boolean
      }
    }
    Enums: {
      ativo_ou_encerrado: "ativo" | "encerrado"
      cargo_usuario: "Secretária" | "Gerente" | "Admin" | "Professor"
      categoria_despesa: "salário" | "aluguel" | "material" | "manutenção"
      competencia: "Listening" | "Speaking" | "Writing" | "Reading"
      forma_pagamento:
        | "boleto"
        | "cartao_credito"
        | "cartao_debito"
        | "dinheiro"
        | "pix"
        | "transferencia"
        | "outro"
      idioma: "Inglês" | "Japonês" | "Inglês/Japonês" | "particular"
      idioma_registro_financeiro: "Inglês" | "Japonês"
      migrado: "sim" | "nao"
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
      status_geral_financeiro:
        | "Pago"
        | "Parcialmente Pago"
        | "Pendente"
        | "Arquivado"
      status_material: "disponivel" | "indisponivel"
      status_notificacao: "enviada" | "pendente" | "erro"
      status_pagamento: "pago" | "pendente" | "vencido" | "cancelado"
      status_presenca: "Presente" | "Falta" | "Reposta"
      tipo_arquivamento: "renovacao" | "cancelamento" | "conclusao"
      tipo_aula_enum: "normal" | "avaliativa" | "prova_final"
      tipo_documento:
        | "contrato"
        | "declaracao_matricula"
        | "declaracao_frequencia"
        | "declaracao_conclusao"
        | "certificado_professor"
        | "diploma_professor"
        | "comprovante_experiencia"
        | "documento_pessoal"
      tipo_item:
        | "plano"
        | "material"
        | "matrícula"
        | "cancelamento"
        | "outros"
        | "avulso"
      tipo_notificacao: "boleto" | "presenca" | "lembrete" | "geral"
      tipo_turma: "Turma particular" | "Turma"
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
      cargo_usuario: ["Secretária", "Gerente", "Admin", "Professor"],
      categoria_despesa: ["salário", "aluguel", "material", "manutenção"],
      competencia: ["Listening", "Speaking", "Writing", "Reading"],
      forma_pagamento: [
        "boleto",
        "cartao_credito",
        "cartao_debito",
        "dinheiro",
        "pix",
        "transferencia",
        "outro",
      ],
      idioma: ["Inglês", "Japonês", "Inglês/Japonês", "particular"],
      idioma_registro_financeiro: ["Inglês", "Japonês"],
      migrado: ["sim", "nao"],
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
      status_geral_financeiro: [
        "Pago",
        "Parcialmente Pago",
        "Pendente",
        "Arquivado",
      ],
      status_material: ["disponivel", "indisponivel"],
      status_notificacao: ["enviada", "pendente", "erro"],
      status_pagamento: ["pago", "pendente", "vencido", "cancelado"],
      status_presenca: ["Presente", "Falta", "Reposta"],
      tipo_arquivamento: ["renovacao", "cancelamento", "conclusao"],
      tipo_aula_enum: ["normal", "avaliativa", "prova_final"],
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
      tipo_item: [
        "plano",
        "material",
        "matrícula",
        "cancelamento",
        "outros",
        "avulso",
      ],
      tipo_notificacao: ["boleto", "presenca", "lembrete", "geral"],
      tipo_turma: ["Turma particular", "Turma"],
    },
  },
} as const
