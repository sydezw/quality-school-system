export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          id: string
          idioma: Database["public"]["Enums"]["idioma"]
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
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          idioma: Database["public"]["Enums"]["idioma"]
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
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          idioma?: Database["public"]["Enums"]["idioma"]
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
          aluno_id: string
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
          aluno_id: string
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
          aluno_id?: string
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
          aluno_id: string
          aulas_pagas: number | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          forma_pagamento: string | null
          id: string
          numero_parcelas: number | null
          observacao: string | null
          plano_id: string | null
          status: Database["public"]["Enums"]["status_contrato"]
          updated_at: string
          valor_material: number | null
          valor_matricula: number | null
          valor_mensalidade: number
          valor_total: number | null
        }
        Insert: {
          aluno_id: string
          aulas_pagas?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          forma_pagamento?: string | null
          id?: string
          numero_parcelas?: number | null
          observacao?: string | null
          plano_id?: string | null
          status?: Database["public"]["Enums"]["status_contrato"]
          updated_at?: string
          valor_material?: number | null
          valor_matricula?: number | null
          valor_mensalidade: number
          valor_total?: number | null
        }
        Update: {
          aluno_id?: string
          aulas_pagas?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          forma_pagamento?: string | null
          id?: string
          numero_parcelas?: number | null
          observacao?: string | null
          plano_id?: string | null
          status?: Database["public"]["Enums"]["status_contrato"]
          updated_at?: string
          valor_material?: number | null
          valor_matricula?: number | null
          valor_mensalidade?: number
          valor_total?: number | null
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
      financeiro_alunos: {
        Row: {
          aluno_id: string
          created_at: string
          data_primeiro_vencimento: string
          desconto_total: number
          forma_pagamento_matricula: string
          forma_pagamento_material: string
          forma_pagamento_plano: string
          id: string
          numero_parcelas_matricula: number
          numero_parcelas_material: number
          numero_parcelas_plano: number
          plano_id: string
          status_geral: string
          updated_at: string
          valor_material: number
          valor_matricula: number
          valor_plano: number
          valor_total: number
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_primeiro_vencimento: string
          desconto_total?: number
          forma_pagamento_matricula?: string
          forma_pagamento_material?: string
          forma_pagamento_plano?: string
          id?: string
          numero_parcelas_matricula?: number
          numero_parcelas_material?: number
          numero_parcelas_plano?: number
          plano_id: string
          status_geral?: string
          updated_at?: string
          valor_material?: number
          valor_matricula?: number
          valor_plano?: number
          valor_total: number
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_primeiro_vencimento?: string
          desconto_total?: number
          forma_pagamento_matricula?: string
          forma_pagamento_material?: string
          forma_pagamento_plano?: string
          id?: string
          numero_parcelas_matricula?: number
          numero_parcelas_material?: number
          numero_parcelas_plano?: number
          plano_id?: string
          status_geral?: string
          updated_at?: string
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
          professor_id: string | null
          arquivo_link: string | null
          created_at: string
          data: string
          id: string
          status: Database["public"]["Enums"]["status_documento"]
          tipo: Database["public"]["Enums"]["tipo_documento"]
          updated_at: string
        }
        Insert: {
          aluno_id?: string | null
          professor_id?: string | null
          arquivo_link?: string | null
          created_at?: string
          data: string
          id?: string
          status?: Database["public"]["Enums"]["status_documento"]
          tipo: Database["public"]["Enums"]["tipo_documento"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string | null
          professor_id?: string | null
          arquivo_link?: string | null
          created_at?: string
          data?: string
          id?: string
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
          aluno_id: string
          created_at: string
          data_entrega: string
          id: string
          material_id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_entrega: string
          id?: string
          material_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
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
      parcelas: {
        Row: {
          aluno_id: string
          boleto_link: string | null
          contrato_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          id: string
          juros: number | null
          metodo_pagamento: string | null
          multa: number | null
          numero_parcela: number | null
          observacao: string | null
          status: Database["public"]["Enums"]["status_boleto"]
          updated_at: string
          valor: number
          valor_pago: number | null
        }
        Insert: {
          aluno_id: string
          boleto_link?: string | null
          contrato_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          juros?: number | null
          metodo_pagamento?: string | null
          multa?: number | null
          numero_parcela?: number | null
          observacao?: string | null
          status?: Database["public"]["Enums"]["status_boleto"]
          updated_at?: string
          valor: number
          valor_pago?: number | null
        }
        Update: {
          aluno_id?: string
          boleto_link?: string | null
          contrato_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          juros?: number | null
          metodo_pagamento?: string | null
          multa?: number | null
          numero_parcela?: number | null
          observacao?: string | null
          status?: Database["public"]["Enums"]["status_boleto"]
          updated_at?: string
          valor?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcelas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
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
          parcela_id: string | null
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
          parcela_id?: string | null
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
          parcela_id?: string | null
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
            foreignKeyName: "historico_pagamentos_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcelas"
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
      planos: {
        Row: {
          id: string
          nome: string
          descricao: string
          numero_aulas: number
          frequencia_aulas: string
          carga_horaria_total: number | null
          valor_total: number | null
          valor_por_aula: number | null
          horario_por_aula: number | null
          permite_cancelamento: boolean
          permite_parcelamento: boolean
          observacoes: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao: string
          numero_aulas: number
          frequencia_aulas: string
          carga_horaria_total?: number | null
          valor_total?: number | null
          valor_por_aula?: number | null
          horario_por_aula?: number | null
          permite_cancelamento?: boolean
          permite_parcelamento?: boolean
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string
          numero_aulas?: number
          frequencia_aulas?: string
          carga_horaria_total?: number | null
          valor_total?: number | null
          valor_por_aula?: number | null
          horario_por_aula?: number | null
          permite_cancelamento?: boolean
          permite_parcelamento?: boolean
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      presencas: {
        Row: {
          aluno_id: string
          aula_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["status_presenca"]
          updated_at: string
        }
        Insert: {
          aluno_id: string
          aula_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["status_presenca"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string
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
          email: string | null
          id: string
          idiomas: string
          nome: string
          salario: number | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          idiomas: string
          nome: string
          salario?: number | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          idiomas?: string
          nome?: string
          salario?: number | null
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
          tipo: string
          updated_at: string
        }
        Insert: {
          capacidade?: number
          created_at?: string
          id?: string
          nome: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          capacidade?: number
          created_at?: string
          id?: string
          nome?: string
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
          perm_visualizar_alunos: boolean | null
          perm_gerenciar_alunos: boolean | null
          perm_visualizar_turmas: boolean | null
          perm_gerenciar_turmas: boolean | null
          perm_visualizar_aulas: boolean | null
          perm_gerenciar_aulas: boolean | null
          perm_visualizar_avaliacoes: boolean | null
          perm_gerenciar_avaliacoes: boolean | null
          perm_visualizar_contratos: boolean | null
          perm_gerenciar_contratos: boolean | null
          perm_visualizar_financeiro: boolean | null
          perm_gerenciar_financeiro: boolean | null
          perm_visualizar_professores: boolean | null
          perm_gerenciar_professores: boolean | null
          perm_visualizar_salas: boolean | null
          perm_gerenciar_salas: boolean | null
          perm_gerenciar_presencas: boolean | null
          perm_gerenciar_usuarios: boolean | null
          perm_visualizar_agenda: boolean | null
          perm_gerenciar_agenda: boolean | null
          perm_visualizar_materiais: boolean | null
          perm_gerenciar_materiais: boolean | null
          perm_visualizar_gerador_contratos: boolean | null
          perm_gerenciar_gerador_contratos: boolean | null
          perm_visualizar_documentos: boolean | null
          perm_gerenciar_documentos: boolean | null
          perm_visualizar_planos: boolean | null
          perm_gerenciar_planos: boolean | null
          senha: string
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
          perm_visualizar_alunos?: boolean | null
          perm_gerenciar_alunos?: boolean | null
          perm_visualizar_turmas?: boolean | null
          perm_gerenciar_turmas?: boolean | null
          perm_visualizar_aulas?: boolean | null
          perm_gerenciar_aulas?: boolean | null
          perm_visualizar_avaliacoes?: boolean | null
          perm_gerenciar_avaliacoes?: boolean | null
          perm_visualizar_contratos?: boolean | null
          perm_gerenciar_contratos?: boolean | null
          perm_visualizar_financeiro?: boolean | null
          perm_gerenciar_financeiro?: boolean | null
          perm_visualizar_professores?: boolean | null
          perm_gerenciar_professores?: boolean | null
          perm_visualizar_salas?: boolean | null
          perm_gerenciar_salas?: boolean | null
          perm_gerenciar_presencas?: boolean | null
          perm_gerenciar_usuarios?: boolean | null
          perm_visualizar_agenda?: boolean | null
          perm_gerenciar_agenda?: boolean | null
          perm_visualizar_materiais?: boolean | null
          perm_gerenciar_materiais?: boolean | null
          perm_visualizar_gerador_contratos?: boolean | null
          perm_gerenciar_gerador_contratos?: boolean | null
          perm_visualizar_documentos?: boolean | null
          perm_gerenciar_documentos?: boolean | null
          perm_visualizar_planos?: boolean | null
          perm_gerenciar_planos?: boolean | null
          senha: string
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
          perm_visualizar_alunos?: boolean | null
          perm_gerenciar_alunos?: boolean | null
          perm_visualizar_turmas?: boolean | null
          perm_gerenciar_turmas?: boolean | null
          perm_visualizar_aulas?: boolean | null
          perm_gerenciar_aulas?: boolean | null
          perm_visualizar_avaliacoes?: boolean | null
          perm_gerenciar_avaliacoes?: boolean | null
          perm_visualizar_contratos?: boolean | null
          perm_gerenciar_contratos?: boolean | null
          perm_visualizar_financeiro?: boolean | null
          perm_gerenciar_financeiro?: boolean | null
          perm_visualizar_professores?: boolean | null
          perm_gerenciar_professores?: boolean | null
          perm_visualizar_salas?: boolean | null
          perm_gerenciar_salas?: boolean | null
          perm_gerenciar_presencas?: boolean | null
          perm_gerenciar_usuarios?: boolean | null
          perm_visualizar_agenda?: boolean | null
          perm_gerenciar_agenda?: boolean | null
          perm_visualizar_materiais?: boolean | null
          perm_gerenciar_materiais?: boolean | null
          perm_visualizar_gerador_contratos?: boolean | null
          perm_gerenciar_gerador_contratos?: boolean | null
          perm_visualizar_documentos?: boolean | null
          perm_gerenciar_documentos?: boolean | null
          perm_visualizar_planos?: boolean | null
          perm_gerenciar_planos?: boolean | null
          senha?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuarios_pendentes: {
        Row: {
          cargo: Database["public"]["Enums"]["cargo_usuario"]
          created_at: string
          email: string
          id: string
          nome: string
          permissoes: string | null
          perm_visualizar_alunos: boolean | null
          perm_gerenciar_alunos: boolean | null
          perm_visualizar_turmas: boolean | null
          perm_gerenciar_turmas: boolean | null
          perm_visualizar_aulas: boolean | null
          perm_gerenciar_aulas: boolean | null
          perm_visualizar_avaliacoes: boolean | null
          perm_gerenciar_avaliacoes: boolean | null
          perm_visualizar_contratos: boolean | null
          perm_gerenciar_contratos: boolean | null
          perm_visualizar_financeiro: boolean | null
          perm_gerenciar_financeiro: boolean | null
          perm_visualizar_professores: boolean | null
          perm_gerenciar_professores: boolean | null
          perm_visualizar_salas: boolean | null
          perm_gerenciar_salas: boolean | null
          perm_gerenciar_presencas: boolean | null
          perm_gerenciar_usuarios: boolean | null
          perm_visualizar_agenda: boolean | null
          perm_gerenciar_agenda: boolean | null
          perm_visualizar_materiais: boolean | null
          perm_gerenciar_materiais: boolean | null
          perm_visualizar_gerador_contratos: boolean | null
          perm_gerenciar_gerador_contratos: boolean | null
          perm_visualizar_documentos: boolean | null
          perm_gerenciar_documentos: boolean | null
          senha: string
          status: string
          updated_at: string
        }
        Insert: {
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          created_at?: string
          email: string
          id?: string
          nome: string
          permissoes?: string | null
          perm_visualizar_alunos?: boolean | null
          perm_gerenciar_alunos?: boolean | null
          perm_visualizar_turmas?: boolean | null
          perm_gerenciar_turmas?: boolean | null
          perm_visualizar_aulas?: boolean | null
          perm_gerenciar_aulas?: boolean | null
          perm_visualizar_avaliacoes?: boolean | null
          perm_gerenciar_avaliacoes?: boolean | null
          perm_visualizar_contratos?: boolean | null
          perm_gerenciar_contratos?: boolean | null
          perm_visualizar_financeiro?: boolean | null
          perm_gerenciar_financeiro?: boolean | null
          perm_visualizar_professores?: boolean | null
          perm_gerenciar_professores?: boolean | null
          perm_visualizar_salas?: boolean | null
          perm_gerenciar_salas?: boolean | null
          perm_gerenciar_presencas?: boolean | null
          perm_gerenciar_usuarios?: boolean | null
          perm_visualizar_agenda?: boolean | null
          perm_gerenciar_agenda?: boolean | null
          perm_visualizar_materiais?: boolean | null
          perm_gerenciar_materiais?: boolean | null
          perm_visualizar_gerador_contratos?: boolean | null
          perm_gerenciar_gerador_contratos?: boolean | null
          perm_visualizar_documentos?: boolean | null
          perm_gerenciar_documentos?: boolean | null
          senha: string
          status?: string
          updated_at?: string
        }
        Update: {
          cargo?: Database["public"]["Enums"]["cargo_usuario"]
          created_at?: string
          email?: string
          id?: string
          nome?: string
          permissoes?: string | null
          perm_visualizar_alunos?: boolean | null
          perm_gerenciar_alunos?: boolean | null
          perm_visualizar_turmas?: boolean | null
          perm_gerenciar_turmas?: boolean | null
          perm_visualizar_aulas?: boolean | null
          perm_gerenciar_aulas?: boolean | null
          perm_visualizar_avaliacoes?: boolean | null
          perm_gerenciar_avaliacoes?: boolean | null
          perm_visualizar_contratos?: boolean | null
          perm_gerenciar_contratos?: boolean | null
          perm_visualizar_financeiro?: boolean | null
          perm_gerenciar_financeiro?: boolean | null
          perm_visualizar_professores?: boolean | null
          perm_gerenciar_professores?: boolean | null
          perm_visualizar_salas?: boolean | null
          perm_gerenciar_salas?: boolean | null
          perm_gerenciar_presencas?: boolean | null
          perm_gerenciar_usuarios?: boolean | null
          perm_visualizar_agenda?: boolean | null
          perm_gerenciar_agenda?: boolean | null
          perm_visualizar_materiais?: boolean | null
          perm_gerenciar_materiais?: boolean | null
          perm_visualizar_gerador_contratos?: boolean | null
          perm_gerenciar_gerador_contratos?: boolean | null
          perm_visualizar_documentos?: boolean | null
          perm_gerenciar_documentos?: boolean | null
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
      view_inadimplencia: {
        Row: {
          aluno_id: string | null
          aluno_nome: string | null
          boletos_vencidos: number | null
          dias_atraso_maximo: number | null
          total_em_atraso: number | null
          ultimo_pagamento: string | null
        }
        Relationships: []
      }
      view_resumo_financeiro: {
        Row: {
          boletos_pagos_mes: number | null
          boletos_pendentes: number | null
          boletos_vencidos: number | null
          receita_mes_atual: number | null
          receita_prevista_mes: number | null
          total_inadimplencia: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      cargo_usuario: "Secretária" | "Gerente" | "Admin"
      categoria_despesa: "salário" | "aluguel" | "material" | "manutenção"
      competencia: "Listening" | "Speaking" | "Writing" | "Reading"
      idioma: "Inglês" | "Japonês"
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
      status_aluno: "Ativo" | "Trancado" | "Cancelado"
      status_boleto: "Pago" | "Pendente" | "Vencido"
      status_contrato: "Ativo" | "Trancado" | "Cancelado" | "Encerrado"
      status_despesa: "Pago" | "Pendente"
      status_documento: "gerado" | "assinado" | "cancelado"
      status_folha: "Pago" | "Pendente"
      status_material: "disponivel" | "indisponivel"
      status_notificacao: "enviada" | "pendente" | "erro"
      status_presenca: "Presente" | "Falta" | "Justificada"
      tipo_documento:
        | "contrato"
        | "declaracao_matricula"
        | "declaracao_frequencia"
        | "declaracao_conclusao"
        | "certificado_professor"
        | "diploma_professor"
        | "comprovante_experiencia"
        | "documento_pessoal"
      tipo_notificacao: "boleto" | "presenca" | "lembrete" | "geral"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cargo_usuario: ["Secretária", "Gerente", "Admin"],
      categoria_despesa: ["salário", "aluguel", "material", "manutenção"],
      competencia: ["Listening", "Speaking", "Writing", "Reading"],
      idioma: ["Inglês", "Japonês"],
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
      status_aluno: ["Ativo", "Trancado", "Cancelado"],
      status_boleto: ["Pago", "Pendente", "Vencido"],
      status_contrato: ["Ativo", "Trancado", "Cancelado", "Encerrado"],
      status_despesa: ["Pago", "Pendente"],
      status_documento: ["gerado", "assinado", "cancelado"],
      status_folha: ["Pago", "Pendente"],
      status_material: ["disponivel", "indisponivel"],
      status_notificacao: ["enviada", "pendente", "erro"],
      status_presenca: ["Presente", "Falta", "Justificada"],
      tipo_documento: [
        "contrato",
        "declaracao_matricula",
        "declaracao_frequencia",
        "declaracao_conclusao",
      ],
      tipo_notificacao: ["boleto", "presenca", "lembrete", "geral"],
    },
  },
} as const

// Export helper types
export type Student = Database['public']['Tables']['alunos']['Row'] & {
  turmas?: { nome: string } | null;
  responsaveis?: { nome: string } | null;
};

export type Teacher = Database['public']['Tables']['professores']['Row'];
export type Responsible = Database['public']['Tables']['responsaveis']['Row'];
export type Room = Database['public']['Tables']['salas']['Row'];
