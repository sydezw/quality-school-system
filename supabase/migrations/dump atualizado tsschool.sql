--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: cargo_usuario; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cargo_usuario AS ENUM (
    'Secretária',
    'Gerente',
    'Admin'
);


ALTER TYPE public.cargo_usuario OWNER TO postgres;

--
-- Name: categoria_despesa; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.categoria_despesa AS ENUM (
    'salário',
    'aluguel',
    'material',
    'manutenção'
);


ALTER TYPE public.categoria_despesa OWNER TO postgres;

--
-- Name: competencia; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.competencia AS ENUM (
    'Listening',
    'Speaking',
    'Writing',
    'Reading'
);


ALTER TYPE public.competencia OWNER TO postgres;

--
-- Name: idioma; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.idioma AS ENUM (
    'Inglês',
    'Japonês'
);


ALTER TYPE public.idioma OWNER TO postgres;

--
-- Name: nivel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.nivel AS ENUM (
    'Book 1',
    'Book 2',
    'Book 3',
    'Book 4',
    'Book 5',
    'Book 6',
    'Book 7',
    'Book 8',
    'Book 9',
    'Book 10'
);


ALTER TYPE public.nivel OWNER TO postgres;

--
-- Name: status_aluno; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_aluno AS ENUM (
    'Ativo',
    'Trancado',
    'Inativo'
);


ALTER TYPE public.status_aluno OWNER TO postgres;

--
-- Name: status_boleto; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_boleto AS ENUM (
    'Pago',
    'Pendente',
    'Vencido'
);


ALTER TYPE public.status_boleto OWNER TO postgres;

--
-- Name: status_contrato; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_contrato AS ENUM (
    'Ativo',
    'Agendado',
    'Vencendo',
    'Vencido',
    'Cancelado'
);


ALTER TYPE public.status_contrato OWNER TO postgres;

--
-- Name: status_despesa; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_despesa AS ENUM (
    'Pago',
    'Pendente'
);


ALTER TYPE public.status_despesa OWNER TO postgres;

--
-- Name: status_documento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_documento AS ENUM (
    'gerado',
    'assinado',
    'cancelado'
);


ALTER TYPE public.status_documento OWNER TO postgres;

--
-- Name: status_folha; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_folha AS ENUM (
    'Pago',
    'Pendente'
);


ALTER TYPE public.status_folha OWNER TO postgres;

--
-- Name: status_material; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_material AS ENUM (
    'disponivel',
    'indisponivel'
);


ALTER TYPE public.status_material OWNER TO postgres;

--
-- Name: status_notificacao; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_notificacao AS ENUM (
    'enviada',
    'pendente',
    'erro'
);


ALTER TYPE public.status_notificacao OWNER TO postgres;

--
-- Name: status_presenca; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_presenca AS ENUM (
    'Presente',
    'Falta',
    'Justificada'
);


ALTER TYPE public.status_presenca OWNER TO postgres;

--
-- Name: tipo_documento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_documento AS ENUM (
    'contrato',
    'declaracao_matricula',
    'declaracao_frequencia',
    'declaracao_conclusao',
    'certificado_professor',
    'diploma_professor',
    'comprovante_experiencia',
    'documento_pessoal'
);


ALTER TYPE public.tipo_documento OWNER TO postgres;

--
-- Name: tipo_notificacao; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_notificacao AS ENUM (
    'boleto',
    'presenca',
    'lembrete',
    'geral'
);


ALTER TYPE public.tipo_notificacao OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: calculate_valor_por_aula(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_valor_por_aula() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Calcular valor_por_aula como valor_total / 36 (aulas totais do semestre)
  IF NEW.valor_total IS NOT NULL THEN
    NEW.valor_por_aula = NEW.valor_total / 36;
  ELSE
    NEW.valor_por_aula = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.calculate_valor_por_aula() OWNER TO postgres;

--
-- Name: check_aluno_dependencies(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_aluno_dependencies(p_aluno_id uuid) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_deps JSON;
BEGIN
  SELECT json_build_object(
    'contratos', (SELECT COUNT(*) FROM contratos WHERE aluno_id = p_aluno_id),
    'boletos', (SELECT COUNT(*) FROM boletos WHERE aluno_id = p_aluno_id),
    'parcelas', (SELECT COUNT(*) FROM parcelas WHERE aluno_id = p_aluno_id),
    'recibos', (SELECT COUNT(*) FROM recibos WHERE aluno_id = p_aluno_id),
    'presencas', (SELECT COUNT(*) FROM presencas WHERE aluno_id = p_aluno_id),
    'avaliacoes', (SELECT COUNT(*) FROM avaliacoes WHERE aluno_id = p_aluno_id),
    'avaliacoes_competencia', (SELECT COUNT(*) FROM avaliacoes_competencia WHERE aluno_id = p_aluno_id),
    'documentos', (SELECT COUNT(*) FROM documentos WHERE aluno_id = p_aluno_id),
    'notificacoes', (SELECT COUNT(*) FROM notificacoes WHERE destinatario_id = p_aluno_id),
    'materiais_entregues', (SELECT COUNT(*) FROM materiais_entregues WHERE aluno_id = p_aluno_id)
  ) INTO v_deps;
  
  RETURN v_deps;
END;
$$;


ALTER FUNCTION public.check_aluno_dependencies(p_aluno_id uuid) OWNER TO postgres;

--
-- Name: check_professor_dependencies(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_professor_dependencies(p_professor_id uuid) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_deps JSON;
BEGIN
  SELECT json_build_object(
    'turmas_ativas', (SELECT COUNT(*) FROM turmas WHERE professor_id = p_professor_id AND status = 'ativa'),
    'turmas_encerradas', (SELECT COUNT(*) FROM turmas WHERE professor_id = p_professor_id AND status = 'encerrada'),
    'folha_pagamento', (SELECT COUNT(*) FROM folha_pagamento WHERE professor_id = p_professor_id),
    'planos_aula', (SELECT COUNT(*) FROM planos_aula WHERE professor_id = p_professor_id)
  ) INTO v_deps;
  
  RETURN v_deps;
END;
$$;


ALTER FUNCTION public.check_professor_dependencies(p_professor_id uuid) OWNER TO postgres;

--
-- Name: obter_permissoes_usuario(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.obter_permissoes_usuario(usuario_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    permissoes_json json;
BEGIN
    SELECT json_build_object(
        'criar_alunos', perm_criar_alunos,
        'editar_alunos', perm_editar_alunos,
        'remover_alunos', perm_remover_alunos,
        'criar_turmas', perm_criar_turmas,
        'editar_turmas', perm_editar_turmas,
        'remover_turmas', perm_remover_turmas,
        'criar_contratos', perm_criar_contratos,
        'editar_contratos', perm_editar_contratos,
        'remover_contratos', perm_remover_contratos,
        'aprovar_contratos', perm_aprovar_contratos,
        'criar_aulas', perm_criar_aulas,
        'editar_aulas', perm_editar_aulas,
        'remover_aulas', perm_remover_aulas,
        'gerenciar_presencas', perm_gerenciar_presencas,
        'criar_avaliacoes', perm_criar_avaliacoes,
        'editar_avaliacoes', perm_editar_avaliacoes,
        'remover_avaliacoes', perm_remover_avaliacoes,
        'gerenciar_boletos', perm_gerenciar_boletos,
        'gerenciar_despesas', perm_gerenciar_despesas,
        'gerenciar_folha', perm_gerenciar_folha,
        'gerenciar_usuarios', perm_gerenciar_usuarios
    )
    INTO permissoes_json
    FROM usuarios
    WHERE id = usuario_id;
    
    RETURN permissoes_json;
END;
$$;


ALTER FUNCTION public.obter_permissoes_usuario(usuario_id uuid) OWNER TO postgres;

--
-- Name: registrar_pagamento_historico(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registrar_pagamento_historico() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Registrar no histórico quando status muda para 'Pago'
  IF NEW.status = 'Pago' AND (OLD.status IS NULL OR OLD.status != 'Pago') THEN
    INSERT INTO public.historico_pagamentos (
      boleto_id,
      aluno_id,
      contrato_id,
      valor_original,
      valor_pago,
      juros,
      multa,
      metodo_pagamento,
      data_pagamento,
      data_vencimento_original,
      observacoes,
      tipo_transacao,
      status_anterior,
      status_novo
    ) VALUES (
      NEW.id,
      NEW.aluno_id,
      NEW.contrato_id,
      NEW.valor,
      COALESCE(NEW.valor + COALESCE(NEW.juros, 0) + COALESCE(NEW.multa, 0), NEW.valor),
      COALESCE(NEW.juros, 0),
      COALESCE(NEW.multa, 0),
      COALESCE(NEW.metodo_pagamento, 'Não informado'),
      COALESCE(NEW.data_pagamento, CURRENT_DATE),
      NEW.data_vencimento,
      NEW.observacoes,
      'pagamento',
      COALESCE(OLD.status, 'Pendente'),
      NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.registrar_pagamento_historico() OWNER TO postgres;

--
-- Name: registrar_pagamento_parcela_historico(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registrar_pagamento_parcela_historico() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Registrar no histórico quando status muda para 'Pago'
  IF NEW.status = 'Pago' AND (OLD.status IS NULL OR OLD.status != 'Pago') THEN
    INSERT INTO public.historico_pagamentos (
      parcela_id,
      aluno_id,
      contrato_id,
      valor_original,
      valor_pago,
      juros,
      multa,
      metodo_pagamento,
      data_pagamento,
      data_vencimento_original,
      observacoes,
      tipo_transacao,
      status_anterior,
      status_novo
    ) VALUES (
      NEW.id,
      NEW.aluno_id,
      NEW.contrato_id,
      NEW.valor,
      COALESCE(NEW.valor_pago, NEW.valor),
      COALESCE(NEW.juros, 0),
      COALESCE(NEW.multa, 0),
      COALESCE(NEW.metodo_pagamento, 'Não informado'),
      COALESCE(NEW.data_pagamento, CURRENT_DATE),
      NEW.data_vencimento,
      NEW.observacao,
      'pagamento',
      COALESCE(OLD.status, 'Pendente'),
      NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.registrar_pagamento_parcela_historico() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: validate_valor_total(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_valor_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.valor_total = coalesce(new.valor_plano, 0)
                  + coalesce(new.valor_material, 0)
                  + coalesce(new.valor_matricula, 0)
                  - coalesce(new.desconto_total, 0);

  if new.valor_total < 0 then
    raise exception 'Valor total não pode ser negativo. Verifique os valores inseridos.';
  end if;

  return new;
end;
$$;


ALTER FUNCTION public.validate_valor_total() OWNER TO postgres;

--
-- Name: verificar_permissao(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.verificar_permissao(usuario_id uuid, permissao text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
DECLARE
    tem_permissao boolean := false;
BEGIN
    EXECUTE format('SELECT %I FROM usuarios WHERE id = $1', 'perm_' || permissao)
    INTO tem_permissao
    USING usuario_id;
    
    RETURN COALESCE(tem_permissao, false);
END;
$_$;


ALTER FUNCTION public.verificar_permissao(usuario_id uuid, permissao text) OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: agenda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agenda (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo text NOT NULL,
    descricao text,
    data date NOT NULL,
    hora time without time zone NOT NULL,
    status text DEFAULT 'pendente'::text NOT NULL,
    criado_por uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agenda_status_check CHECK ((status = ANY (ARRAY['pendente'::text, 'concluido'::text, 'cancelado'::text])))
);


ALTER TABLE public.agenda OWNER TO postgres;

--
-- Name: alunos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alunos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    telefone text,
    email text,
    endereco text,
    status public.status_aluno DEFAULT 'Ativo'::public.status_aluno NOT NULL,
    idioma public.idioma NOT NULL,
    turma_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    data_conclusao date,
    data_cancelamento date,
    cpf text,
    responsavel_id uuid,
    numero_endereco text,
    data_nascimento date,
    data_exclusao timestamp without time zone
);


ALTER TABLE public.alunos OWNER TO postgres;

--
-- Name: COLUMN alunos.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.alunos.status IS 'Status do aluno: Ativo, Trancado, Inativo';


--
-- Name: aulas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aulas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    turma_id uuid NOT NULL,
    data date NOT NULL,
    conteudo text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.aulas OWNER TO postgres;

--
-- Name: avaliacoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avaliacoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid NOT NULL,
    turma_id uuid NOT NULL,
    data date NOT NULL,
    nota numeric(4,2),
    observacao text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.avaliacoes OWNER TO postgres;

--
-- Name: avaliacoes_competencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avaliacoes_competencia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid NOT NULL,
    turma_id uuid NOT NULL,
    data date NOT NULL,
    competencia public.competencia NOT NULL,
    nota numeric(4,2) NOT NULL,
    observacao text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.avaliacoes_competencia OWNER TO postgres;

--
-- Name: boletos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.boletos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid,
    data_vencimento date NOT NULL,
    valor numeric(10,2) NOT NULL,
    status public.status_boleto DEFAULT 'Pendente'::public.status_boleto NOT NULL,
    link_pagamento text,
    descricao text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    juros numeric(5,2) DEFAULT 0,
    multa numeric(5,2) DEFAULT 0,
    metodo_pagamento text,
    data_pagamento date,
    observacoes text,
    numero_parcela integer DEFAULT 1,
    contrato_id uuid
);


ALTER TABLE public.boletos OWNER TO postgres;

--
-- Name: COLUMN boletos.metodo_pagamento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.boletos.metodo_pagamento IS 'Método utilizado para o pagamento: Pix, Boleto, Dinheiro, Cartão, etc.';


--
-- Name: COLUMN boletos.data_pagamento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.boletos.data_pagamento IS 'Data em que o pagamento foi efetivamente realizado';


--
-- Name: COLUMN boletos.observacoes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.boletos.observacoes IS 'Observações adicionais sobre o boleto ou pagamento';


--
-- Name: COLUMN boletos.numero_parcela; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.boletos.numero_parcela IS 'Número da parcela quando o boleto faz parte de um parcelamento';


--
-- Name: COLUMN boletos.contrato_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.boletos.contrato_id IS 'Referência ao contrato que originou este boleto';


--
-- Name: configuracoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chave text NOT NULL,
    valor jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.configuracoes OWNER TO postgres;

--
-- Name: contratos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contratos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid,
    data_inicio date NOT NULL,
    data_fim date,
    valor_mensalidade numeric(10,2) NOT NULL,
    status_contrato public.status_contrato DEFAULT 'Ativo'::public.status_contrato NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    observacao text,
    plano_id uuid
);


ALTER TABLE public.contratos OWNER TO postgres;

--
-- Name: COLUMN contratos.plano_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.contratos.plano_id IS 'Referência ao plano associado ao contrato';


--
-- Name: contratos_vencendo; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.contratos_vencendo AS
 SELECT c.id,
    c.aluno_id,
    c.data_inicio,
    c.data_fim,
    c.valor_mensalidade,
    c.status_contrato AS status,
    c.created_at,
    c.updated_at,
    c.observacao,
    a.nome AS aluno_nome,
    (c.data_fim - CURRENT_DATE) AS dias_restantes,
        CASE
            WHEN (c.data_fim < CURRENT_DATE) THEN 'vencido'::text
            WHEN (c.data_fim <= (CURRENT_DATE + '30 days'::interval)) THEN 'vencendo'::text
            ELSE 'ativo'::text
        END AS situacao
   FROM (public.contratos c
     JOIN public.alunos a ON ((c.aluno_id = a.id)))
  WHERE (c.status_contrato = 'Ativo'::public.status_contrato);


ALTER VIEW public.contratos_vencendo OWNER TO postgres;

--
-- Name: despesas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.despesas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    descricao text NOT NULL,
    valor numeric(10,2) NOT NULL,
    data date NOT NULL,
    categoria public.categoria_despesa NOT NULL,
    status public.status_despesa DEFAULT 'Pendente'::public.status_despesa NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.despesas OWNER TO postgres;

--
-- Name: documentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid,
    tipo public.tipo_documento NOT NULL,
    data date NOT NULL,
    arquivo_link text,
    status public.status_documento DEFAULT 'gerado'::public.status_documento NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    professor_id uuid,
    CONSTRAINT check_documento_pessoa CHECK ((((aluno_id IS NOT NULL) AND (professor_id IS NULL)) OR ((aluno_id IS NULL) AND (professor_id IS NOT NULL))))
);


ALTER TABLE public.documentos OWNER TO postgres;

--
-- Name: financeiro_alunos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financeiro_alunos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid,
    plano_id uuid NOT NULL,
    valor_plano numeric(10,2) DEFAULT 0 NOT NULL,
    valor_material numeric(10,2) DEFAULT 0 NOT NULL,
    valor_matricula numeric(10,2) DEFAULT 0 NOT NULL,
    desconto_total numeric(10,2) DEFAULT 0 NOT NULL,
    valor_total numeric(10,2) NOT NULL,
    status_geral text DEFAULT 'Pendente'::text NOT NULL,
    data_primeiro_vencimento date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    forma_pagamento_material character varying(20) DEFAULT 'boleto'::character varying,
    numero_parcelas_material integer DEFAULT 1,
    forma_pagamento_matricula character varying(20) DEFAULT 'boleto'::character varying,
    numero_parcelas_matricula integer DEFAULT 1,
    forma_pagamento_plano character varying(20) DEFAULT 'boleto'::character varying,
    numero_parcelas_plano integer DEFAULT 1,
    CONSTRAINT financeiro_alunos_forma_pagamento_material_check CHECK (((forma_pagamento_material)::text = ANY ((ARRAY['boleto'::character varying, 'cartao'::character varying, 'pix'::character varying, 'dinheiro'::character varying, 'transferencia'::character varying])::text[]))),
    CONSTRAINT financeiro_alunos_forma_pagamento_matricula_check CHECK (((forma_pagamento_matricula)::text = ANY ((ARRAY['boleto'::character varying, 'cartao'::character varying, 'pix'::character varying, 'dinheiro'::character varying, 'transferencia'::character varying])::text[]))),
    CONSTRAINT financeiro_alunos_forma_pagamento_plano_check CHECK (((forma_pagamento_plano)::text = ANY ((ARRAY['boleto'::character varying, 'cartao'::character varying, 'pix'::character varying, 'dinheiro'::character varying, 'transferencia'::character varying])::text[]))),
    CONSTRAINT financeiro_alunos_numero_parcelas_material_check CHECK (((numero_parcelas_material >= 1) AND (numero_parcelas_material <= 12))),
    CONSTRAINT financeiro_alunos_numero_parcelas_matricula_check CHECK (((numero_parcelas_matricula >= 1) AND (numero_parcelas_matricula <= 12))),
    CONSTRAINT financeiro_alunos_numero_parcelas_plano_check CHECK (((numero_parcelas_plano >= 1) AND (numero_parcelas_plano <= 12))),
    CONSTRAINT financeiro_alunos_status_geral_check CHECK ((status_geral = ANY (ARRAY['Pago'::text, 'Parcialmente Pago'::text, 'Pendente'::text])))
);


ALTER TABLE public.financeiro_alunos OWNER TO postgres;

--
-- Name: TABLE financeiro_alunos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.financeiro_alunos IS 'Tabela principal de controle financeiro dos alunos';


--
-- Name: COLUMN financeiro_alunos.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.id IS 'ID único da cobrança';


--
-- Name: COLUMN financeiro_alunos.aluno_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.aluno_id IS 'ID do aluno (relacionado à tabela alunos)';


--
-- Name: COLUMN financeiro_alunos.plano_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.plano_id IS 'ID do plano (relacionado à tabela planos)';


--
-- Name: COLUMN financeiro_alunos.valor_plano; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.valor_plano IS 'Valor do plano contratado';


--
-- Name: COLUMN financeiro_alunos.valor_material; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.valor_material IS 'Valor do material didático';


--
-- Name: COLUMN financeiro_alunos.valor_matricula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.valor_matricula IS 'Taxa de matrícula';


--
-- Name: COLUMN financeiro_alunos.desconto_total; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.desconto_total IS 'Desconto aplicado, se houver';


--
-- Name: COLUMN financeiro_alunos.valor_total; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.valor_total IS 'Soma de tudo (plano + matrícula + material - desconto)';


--
-- Name: COLUMN financeiro_alunos.status_geral; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.status_geral IS 'Status geral: Pago, Parcialmente Pago, Pendente';


--
-- Name: COLUMN financeiro_alunos.data_primeiro_vencimento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.data_primeiro_vencimento IS 'Data da primeira parcela';


--
-- Name: COLUMN financeiro_alunos.forma_pagamento_material; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.forma_pagamento_material IS 'Método de pagamento para materiais: boleto, cartao, pix, dinheiro, transferencia';


--
-- Name: COLUMN financeiro_alunos.numero_parcelas_material; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.numero_parcelas_material IS 'Número de parcelas para pagamento dos materiais (1 a 12)';


--
-- Name: COLUMN financeiro_alunos.forma_pagamento_matricula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.forma_pagamento_matricula IS 'Método de pagamento para matrícula: boleto, cartao, pix, dinheiro, transferencia';


--
-- Name: COLUMN financeiro_alunos.numero_parcelas_matricula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.numero_parcelas_matricula IS 'Número de parcelas para pagamento da matrícula (1 a 12)';


--
-- Name: COLUMN financeiro_alunos.forma_pagamento_plano; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.forma_pagamento_plano IS 'Método de pagamento para plano: boleto, cartao, pix, dinheiro, transferencia';


--
-- Name: COLUMN financeiro_alunos.numero_parcelas_plano; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.financeiro_alunos.numero_parcelas_plano IS 'Número de parcelas para pagamento do plano (1 a 12)';


--
-- Name: folha_pagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.folha_pagamento (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professor_id uuid NOT NULL,
    mes integer NOT NULL,
    ano integer NOT NULL,
    valor numeric(10,2) NOT NULL,
    status public.status_folha DEFAULT 'Pendente'::public.status_folha NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT folha_pagamento_mes_check CHECK (((mes >= 1) AND (mes <= 12)))
);


ALTER TABLE public.folha_pagamento OWNER TO postgres;

--
-- Name: historico_pagamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historico_pagamentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    boleto_id uuid,
    aluno_id uuid,
    contrato_id uuid,
    valor_original numeric(10,2) NOT NULL,
    valor_pago numeric(10,2) NOT NULL,
    juros numeric(10,2) DEFAULT 0,
    multa numeric(10,2) DEFAULT 0,
    desconto numeric(10,2) DEFAULT 0,
    metodo_pagamento text NOT NULL,
    data_pagamento date NOT NULL,
    data_vencimento_original date NOT NULL,
    observacoes text,
    usuario_id uuid,
    tipo_transacao text NOT NULL,
    status_anterior text,
    status_novo text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT historico_pagamentos_tipo_transacao_check CHECK ((tipo_transacao = ANY (ARRAY['pagamento'::text, 'estorno'::text, 'ajuste'::text])))
);


ALTER TABLE public.historico_pagamentos OWNER TO postgres;

--
-- Name: TABLE historico_pagamentos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.historico_pagamentos IS 'Tabela de auditoria para registrar todos os pagamentos e alterações de status';


--
-- Name: COLUMN historico_pagamentos.tipo_transacao; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.historico_pagamentos.tipo_transacao IS 'Tipo da transação: pagamento, estorno ou ajuste';


--
-- Name: logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    acao text NOT NULL,
    tabela_afetada text NOT NULL,
    registro_id uuid,
    data timestamp with time zone DEFAULT now() NOT NULL,
    descricao text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.logs OWNER TO postgres;

--
-- Name: materiais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materiais (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    descricao text,
    idioma public.idioma NOT NULL,
    nivel public.nivel NOT NULL,
    status public.status_material DEFAULT 'disponivel'::public.status_material NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.materiais OWNER TO postgres;

--
-- Name: materiais_entregues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materiais_entregues (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid,
    material_id uuid NOT NULL,
    data_entrega date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.materiais_entregues OWNER TO postgres;

--
-- Name: notificacoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificacoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo public.tipo_notificacao NOT NULL,
    destinatario_id uuid NOT NULL,
    mensagem text NOT NULL,
    data_envio timestamp with time zone DEFAULT now() NOT NULL,
    status public.status_notificacao DEFAULT 'pendente'::public.status_notificacao NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notificacoes OWNER TO postgres;

--
-- Name: pesquisas_satisfacao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pesquisas_satisfacao (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid NOT NULL,
    turma_id uuid NOT NULL,
    data date NOT NULL,
    nota integer NOT NULL,
    comentario text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pesquisas_satisfacao_nota_check CHECK (((nota >= 1) AND (nota <= 5)))
);


ALTER TABLE public.pesquisas_satisfacao OWNER TO postgres;

--
-- Name: planos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    descricao text NOT NULL,
    numero_aulas numeric NOT NULL,
    frequencia_aulas jsonb NOT NULL,
    carga_horaria_total integer,
    permite_cancelamento boolean DEFAULT true,
    permite_parcelamento boolean DEFAULT true,
    observacoes text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    valor_total numeric(10,2),
    valor_por_aula numeric(10,2),
    horario_por_aula numeric(4,2),
    idioma public.idioma DEFAULT 'Inglês'::public.idioma NOT NULL,
    CONSTRAINT frequencia_aulas_valid_values CHECK (((frequencia_aulas ->> ''::text) = ANY (ARRAY['semanal'::text, 'quinzenal'::text, 'mensal'::text, 'intensivo'::text]))),
    CONSTRAINT horario_por_aula_positive CHECK ((horario_por_aula > (0)::numeric))
);


ALTER TABLE public.planos OWNER TO postgres;

--
-- Name: TABLE planos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.planos IS 'Tabela para armazenar planos padronizados de pagamento. Não inclui valores monetários, apenas estrutura do plano.';


--
-- Name: COLUMN planos.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.id IS 'Identificador único do plano (UUID)';


--
-- Name: COLUMN planos.nome; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.nome IS 'Nome do plano (obrigatório)';


--
-- Name: COLUMN planos.descricao; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.descricao IS 'Descrição detalhada do plano (obrigatório)';


--
-- Name: COLUMN planos.numero_aulas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.numero_aulas IS 'Número total de aulas do plano';


--
-- Name: COLUMN planos.frequencia_aulas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.frequencia_aulas IS 'Frequência das aulas (jsonb): semanal, quinzenal, mensal ou intensivo';


--
-- Name: COLUMN planos.carga_horaria_total; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.carga_horaria_total IS 'Carga horária total do plano em horas';


--
-- Name: COLUMN planos.permite_cancelamento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.permite_cancelamento IS 'Define se o aluno pode cancelar o plano antes do término';


--
-- Name: COLUMN planos.permite_parcelamento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.permite_parcelamento IS 'Define se o plano pode ser parcelado ou deve ser pago à vista';


--
-- Name: COLUMN planos.observacoes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.observacoes IS 'Observações adicionais sobre o plano (opcional)';


--
-- Name: COLUMN planos.ativo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.ativo IS 'Define se o plano está ativo e pode ser usado em novos contratos';


--
-- Name: COLUMN planos.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.created_at IS 'Data e hora de criação do registro';


--
-- Name: COLUMN planos.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.updated_at IS 'Data e hora da última atualização do registro';


--
-- Name: COLUMN planos.valor_total; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.valor_total IS 'Valor total do plano em reais';


--
-- Name: COLUMN planos.valor_por_aula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.valor_por_aula IS 'Valor por aula calculado automaticamente (valor_total / 36)';


--
-- Name: COLUMN planos.horario_por_aula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.horario_por_aula IS 'Duração de cada aula em horas';


--
-- Name: COLUMN planos.idioma; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.planos.idioma IS 'Idioma do plano de ensino: Inglês ou Japonês';


--
-- Name: planos_aula; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planos_aula (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    turma_id uuid NOT NULL,
    data date NOT NULL,
    conteudo text NOT NULL,
    professor_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.planos_aula OWNER TO postgres;

--
-- Name: presencas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presencas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aula_id uuid NOT NULL,
    aluno_id uuid,
    status public.status_presenca DEFAULT 'Presente'::public.status_presenca NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.presencas OWNER TO postgres;

--
-- Name: professores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    telefone text,
    email text,
    idiomas text NOT NULL,
    salario numeric(10,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cpf text,
    status text DEFAULT 'ativo'::text NOT NULL,
    excluido boolean DEFAULT false,
    data_exclusao timestamp without time zone,
    CONSTRAINT professores_status_check CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'demitido'::text])))
);


ALTER TABLE public.professores OWNER TO postgres;

--
-- Name: COLUMN professores.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.professores.status IS 'Status do professor: ativo, inativo, demitido';


--
-- Name: ranking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ranking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid NOT NULL,
    turma_id uuid NOT NULL,
    pontuacao integer NOT NULL,
    data date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ranking OWNER TO postgres;

--
-- Name: recibos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recibos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    aluno_id uuid NOT NULL,
    data date NOT NULL,
    valor numeric(10,2) NOT NULL,
    descricao text NOT NULL,
    arquivo_link text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recibos OWNER TO postgres;

--
-- Name: responsaveis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.responsaveis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    cpf text,
    endereco text,
    telefone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    numero_endereco text,
    status text DEFAULT 'ativo'::text NOT NULL,
    CONSTRAINT responsaveis_status_check CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text])))
);


ALTER TABLE public.responsaveis OWNER TO postgres;

--
-- Name: COLUMN responsaveis.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.responsaveis.status IS 'Status do responsável: ativo, inativo';


--
-- Name: salas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    capacidade integer DEFAULT 10 NOT NULL,
    tipo text DEFAULT 'Física'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'ativa'::text NOT NULL,
    CONSTRAINT salas_status_check CHECK ((status = ANY (ARRAY['ativa'::text, 'inativa'::text, 'manutencao'::text]))),
    CONSTRAINT salas_tipo_check CHECK ((tipo = ANY (ARRAY['Física'::text, 'Virtual'::text])))
);


ALTER TABLE public.salas OWNER TO postgres;

--
-- Name: COLUMN salas.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.salas.status IS 'Status da sala: ativa, inativa, manutencao';


--
-- Name: turmas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.turmas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    idioma public.idioma NOT NULL,
    nivel public.nivel NOT NULL,
    dias_da_semana text NOT NULL,
    horario text NOT NULL,
    professor_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'ativa'::text NOT NULL,
    sala_id uuid,
    CONSTRAINT turmas_status_check CHECK ((status = ANY (ARRAY['ativa'::text, 'encerrada'::text])))
);


ALTER TABLE public.turmas OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    cargo public.cargo_usuario DEFAULT 'Secretária'::public.cargo_usuario NOT NULL,
    permissoes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    funcao text,
    perm_visualizar_alunos boolean DEFAULT false,
    perm_gerenciar_alunos boolean DEFAULT false,
    perm_visualizar_turmas boolean DEFAULT false,
    perm_gerenciar_turmas boolean DEFAULT false,
    perm_visualizar_aulas boolean DEFAULT false,
    perm_gerenciar_aulas boolean DEFAULT false,
    perm_visualizar_avaliacoes boolean DEFAULT false,
    perm_gerenciar_avaliacoes boolean DEFAULT false,
    perm_visualizar_agenda boolean DEFAULT false,
    perm_gerenciar_agenda boolean DEFAULT false,
    perm_visualizar_contratos boolean DEFAULT false,
    perm_gerenciar_contratos boolean DEFAULT false,
    perm_gerenciar_presencas boolean DEFAULT false,
    perm_gerenciar_usuarios boolean DEFAULT false,
    perm_visualizar_professores boolean DEFAULT false,
    perm_gerenciar_professores boolean DEFAULT false,
    perm_visualizar_salas boolean DEFAULT false,
    perm_gerenciar_salas boolean DEFAULT false,
    perm_visualizar_materiais boolean DEFAULT false,
    perm_gerenciar_materiais boolean DEFAULT false,
    perm_visualizar_financeiro boolean DEFAULT false,
    perm_gerenciar_financeiro boolean DEFAULT false,
    perm_visualizar_gerador_contratos boolean DEFAULT false,
    perm_gerenciar_gerador_contratos boolean DEFAULT false,
    perm_visualizar_documentos boolean DEFAULT false,
    perm_gerenciar_documentos boolean DEFAULT false,
    status text DEFAULT 'ativo'::text NOT NULL,
    perm_visualizar_planos boolean DEFAULT false,
    perm_gerenciar_planos boolean DEFAULT false,
    CONSTRAINT usuarios_status_check CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'suspenso'::text])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: COLUMN usuarios.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.usuarios.status IS 'Status do usuário: ativo, inativo, suspenso';


--
-- Name: COLUMN usuarios.perm_visualizar_planos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.usuarios.perm_visualizar_planos IS 'Permissão para visualizar a aba de planos';


--
-- Name: COLUMN usuarios.perm_gerenciar_planos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.usuarios.perm_gerenciar_planos IS 'Permissão para criar, editar e remover planos';


--
-- Name: usuarios_pendentes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_pendentes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    cargo public.cargo_usuario DEFAULT 'Secretária'::public.cargo_usuario NOT NULL,
    permissoes text,
    funcao text,
    status text DEFAULT 'pendente'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    perm_criar_alunos boolean DEFAULT false,
    perm_editar_alunos boolean DEFAULT false,
    perm_remover_alunos boolean DEFAULT false,
    perm_criar_turmas boolean DEFAULT false,
    perm_editar_turmas boolean DEFAULT false,
    perm_remover_turmas boolean DEFAULT false,
    perm_criar_contratos boolean DEFAULT false,
    perm_editar_contratos boolean DEFAULT false,
    perm_remover_contratos boolean DEFAULT false,
    perm_aprovar_contratos boolean DEFAULT false,
    perm_criar_aulas boolean DEFAULT false,
    perm_editar_aulas boolean DEFAULT false,
    perm_remover_aulas boolean DEFAULT false,
    perm_gerenciar_presencas boolean DEFAULT false,
    perm_criar_avaliacoes boolean DEFAULT false,
    perm_editar_avaliacoes boolean DEFAULT false,
    perm_remover_avaliacoes boolean DEFAULT false,
    perm_gerenciar_boletos boolean DEFAULT false,
    perm_gerenciar_despesas boolean DEFAULT false,
    perm_gerenciar_folha boolean DEFAULT false,
    perm_gerenciar_usuarios boolean DEFAULT false,
    perm_visualizar_gerador_contratos boolean DEFAULT false,
    perm_gerenciar_gerador_contratos boolean DEFAULT false,
    perm_visualizar_documentos boolean DEFAULT false,
    perm_gerenciar_documentos boolean DEFAULT false
);


ALTER TABLE public.usuarios_pendentes OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_07_02; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_07_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_07_02 OWNER TO supabase_admin;

--
-- Name: messages_2025_07_03; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_07_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_07_03 OWNER TO supabase_admin;

--
-- Name: messages_2025_07_04; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_07_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_07_04 OWNER TO supabase_admin;

--
-- Name: messages_2025_07_05; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_07_05 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_07_05 OWNER TO supabase_admin;

--
-- Name: messages_2025_07_06; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_07_06 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_07_06 OWNER TO supabase_admin;

--
-- Name: messages_2025_07_07; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_07_07 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_07_07 OWNER TO supabase_admin;

--
-- Name: messages_2025_07_08; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_07_08 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_07_08 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


ALTER TABLE supabase_migrations.seed_files OWNER TO postgres;

--
-- Name: messages_2025_07_02; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_07_02 FOR VALUES FROM ('2025-07-02 00:00:00') TO ('2025-07-03 00:00:00');


--
-- Name: messages_2025_07_03; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_07_03 FOR VALUES FROM ('2025-07-03 00:00:00') TO ('2025-07-04 00:00:00');


--
-- Name: messages_2025_07_04; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_07_04 FOR VALUES FROM ('2025-07-04 00:00:00') TO ('2025-07-05 00:00:00');


--
-- Name: messages_2025_07_05; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_07_05 FOR VALUES FROM ('2025-07-05 00:00:00') TO ('2025-07-06 00:00:00');


--
-- Name: messages_2025_07_06; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_07_06 FOR VALUES FROM ('2025-07-06 00:00:00') TO ('2025-07-07 00:00:00');


--
-- Name: messages_2025_07_07; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_07_07 FOR VALUES FROM ('2025-07-07 00:00:00') TO ('2025-07-08 00:00:00');


--
-- Name: messages_2025_07_08; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_07_08 FOR VALUES FROM ('2025-07-08 00:00:00') TO ('2025-07-09 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	f9001fe8-11d9-4669-9e8b-e53008bd8f44	{"action":"user_confirmation_requested","actor_id":"e4200884-d74d-4ed2-a286-2d4807d73c39","actor_username":"secretaria@gmai.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-14 18:53:26.386574+00	
00000000-0000-0000-0000-000000000000	d3035e12-b5bb-437b-8cea-4419efe5c1a0	{"action":"user_confirmation_requested","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-14 18:54:07.841047+00	
00000000-0000-0000-0000-000000000000	9b311caa-87c1-4530-8321-c61aefd5fcd8	{"action":"user_signedup","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"team"}	2025-06-14 18:54:50.915531+00	
00000000-0000-0000-0000-000000000000	2086d74e-0a37-4f85-8ea4-218e9fac3434	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-14 18:55:07.23181+00	
00000000-0000-0000-0000-000000000000	6ca5788b-80b3-47f3-981b-2922d5265afd	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-14 19:30:23.562663+00	
00000000-0000-0000-0000-000000000000	82c433b7-934e-4d20-bb0e-46ba89a3f45e	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 21:29:06.788874+00	
00000000-0000-0000-0000-000000000000	0fb638c6-774e-488f-a361-215d07c075af	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 21:29:06.789749+00	
00000000-0000-0000-0000-000000000000	11a02f8c-7e24-46db-9e90-e80d62201310	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 21:29:59.127348+00	
00000000-0000-0000-0000-000000000000	12a7b7ce-ced9-465e-8323-d408fce0aad6	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 21:29:59.127886+00	
00000000-0000-0000-0000-000000000000	c8a71010-be2a-49aa-84b0-08284df8d6c5	{"action":"user_repeated_signup","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-14 21:40:09.796074+00	
00000000-0000-0000-0000-000000000000	5219771a-67c8-4d36-912a-d3e5fd46107b	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-14 21:41:12.750257+00	
00000000-0000-0000-0000-000000000000	f113ec8b-adfb-422c-ad2f-57df1efe3321	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 22:29:59.840804+00	
00000000-0000-0000-0000-000000000000	45651c5a-e252-4078-8ad3-3ad877d7cf02	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 22:29:59.84337+00	
00000000-0000-0000-0000-000000000000	201d5443-78b0-42db-b16a-445cb6ffc9dd	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 23:07:02.701504+00	
00000000-0000-0000-0000-000000000000	e0f04707-bfe5-44c3-b5be-3591c82ab5a2	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 23:07:02.703169+00	
00000000-0000-0000-0000-000000000000	b5a3e7f5-8d8d-4109-8231-03f3a0980b65	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 23:30:22.034015+00	
00000000-0000-0000-0000-000000000000	93136ab0-1ea7-4156-9e09-68f5ba81381d	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 23:30:22.034777+00	
00000000-0000-0000-0000-000000000000	bf63dbeb-cc01-4a09-94c6-32094bca0cfc	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-14 23:36:21.536904+00	
00000000-0000-0000-0000-000000000000	b4172009-4811-4866-80dc-99b9f443dac5	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 23:49:34.767211+00	
00000000-0000-0000-0000-000000000000	41011df4-a622-4268-beee-615edcce966e	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-14 23:49:34.768102+00	
00000000-0000-0000-0000-000000000000	7f1ebca5-a5d7-421b-8d69-bc7641950b71	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 00:58:16.965684+00	
00000000-0000-0000-0000-000000000000	1321e64f-a32a-4c43-8d42-c6fc88ffeb86	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 00:58:28.753616+00	
00000000-0000-0000-0000-000000000000	a9edaf53-d521-4001-be59-886ebe7f5a4e	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 00:58:28.754201+00	
00000000-0000-0000-0000-000000000000	f2a70993-03be-406d-b9e5-e6cfd0601fb9	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 00:58:50.592403+00	
00000000-0000-0000-0000-000000000000	e4d1da8c-3d15-47a9-b7a5-a178889cbc8e	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 00:58:50.59301+00	
00000000-0000-0000-0000-000000000000	dc18a5a1-7346-406a-826a-02bfb4c9c0c7	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 01:58:44.927991+00	
00000000-0000-0000-0000-000000000000	888b1125-da91-4a74-b95c-f3b94710385a	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 01:58:44.928908+00	
00000000-0000-0000-0000-000000000000	830017b1-8cf8-4a07-a2fb-2d659cbaa2ff	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 02:59:33.719048+00	
00000000-0000-0000-0000-000000000000	722b9116-8239-42be-8de7-bc82b956b547	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 02:59:33.719818+00	
00000000-0000-0000-0000-000000000000	e9aaa15e-251b-4612-83e8-583743524293	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 04:00:33.69162+00	
00000000-0000-0000-0000-000000000000	d2a3d053-79da-48ec-965e-ba0bff846bb9	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 04:00:33.692377+00	
00000000-0000-0000-0000-000000000000	f3a51de2-980a-47de-a81c-7175c4a1f4c3	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 05:01:29.456661+00	
00000000-0000-0000-0000-000000000000	98419fda-d593-46e1-8519-8f6c884627fe	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 05:01:29.457429+00	
00000000-0000-0000-0000-000000000000	ce2d9b20-0321-4fd3-a753-bb565604b9eb	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 06:02:29.402449+00	
00000000-0000-0000-0000-000000000000	5eb74bff-f4d6-4a25-9462-2aa4fa22bd30	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 06:02:29.403429+00	
00000000-0000-0000-0000-000000000000	e8992f3b-3ad7-40f2-9cb9-86cf2dd88cbe	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 07:02:54.356145+00	
00000000-0000-0000-0000-000000000000	63f1ea95-6bc6-4189-8a07-91de7e17ea7b	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 07:02:54.357019+00	
00000000-0000-0000-0000-000000000000	5ebfbc35-93a6-4810-8e17-32b7f727160d	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 08:03:33.763508+00	
00000000-0000-0000-0000-000000000000	e57b442f-5859-4a26-bda4-f45b704570ed	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 08:03:33.764382+00	
00000000-0000-0000-0000-000000000000	50b54aaa-e721-4630-8d3e-f40cd66fadf3	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 09:04:33.736289+00	
00000000-0000-0000-0000-000000000000	e9273510-505c-45df-86cb-a24a62762baf	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 09:04:33.737048+00	
00000000-0000-0000-0000-000000000000	82ed24fa-9a72-4f65-ae56-c38b0b5c153f	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 10:05:33.399056+00	
00000000-0000-0000-0000-000000000000	dd20ac25-1c66-4c0b-8738-74e27d341681	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 10:05:33.39985+00	
00000000-0000-0000-0000-000000000000	c04d077b-3cc4-4346-9acb-e47e234a4bdd	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 11:06:33.369745+00	
00000000-0000-0000-0000-000000000000	b58d3188-025a-4885-a5f4-e9022227e090	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 11:06:33.370569+00	
00000000-0000-0000-0000-000000000000	3274fe6a-52ef-44e4-b4fe-dad7065cf09f	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 11:37:24.061092+00	
00000000-0000-0000-0000-000000000000	41e439ee-b678-4545-981f-c13aae4cf875	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 11:37:24.061905+00	
00000000-0000-0000-0000-000000000000	9f130b03-ca78-4fdc-b502-627273897d9d	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 11:37:37.578186+00	
00000000-0000-0000-0000-000000000000	0b593357-3c16-46b4-a222-90dbd1ac6152	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 11:37:37.578694+00	
00000000-0000-0000-0000-000000000000	164f5adf-d247-4c02-b5f5-513a8e20a0ac	{"action":"logout","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-15 11:58:09.673412+00	
00000000-0000-0000-0000-000000000000	7d302906-8de9-452d-8d3b-71bf40b96fc6	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 12:39:10.652972+00	
00000000-0000-0000-0000-000000000000	c5a55da9-7f42-4586-8d68-240ee57c7dd9	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 12:43:43.851601+00	
00000000-0000-0000-0000-000000000000	3e311791-d86b-4c79-8a6f-55855d333d91	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 12:49:05.046756+00	
00000000-0000-0000-0000-000000000000	e78ef4d5-f2c1-4d13-bc08-dee86fd93f64	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 14:04:42.317499+00	
00000000-0000-0000-0000-000000000000	7c24ea36-e2b8-4227-98d5-6a562b6a152d	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 14:04:42.327847+00	
00000000-0000-0000-0000-000000000000	0bf87f4a-80f1-4fb6-8e5a-eda09927f535	{"action":"logout","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-15 14:10:04.653561+00	
00000000-0000-0000-0000-000000000000	30608c45-921d-4d98-bcb7-40328dc20bdd	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 14:11:34.402243+00	
00000000-0000-0000-0000-000000000000	dba8c875-f37b-465f-a8c1-2e1df108bd63	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 14:12:29.188707+00	
00000000-0000-0000-0000-000000000000	e9d6871a-a5da-4b49-8cff-64c7b1e03844	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 14:27:20.118837+00	
00000000-0000-0000-0000-000000000000	d8e30b4f-11eb-4af8-bd55-f479ef559c0f	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 15:24:40.528962+00	
00000000-0000-0000-0000-000000000000	62a12966-ac8a-4911-b0d8-09f964676d84	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 15:24:40.531136+00	
00000000-0000-0000-0000-000000000000	d377a30f-9f1a-450f-9353-4b354846e2e4	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 16:25:33.154594+00	
00000000-0000-0000-0000-000000000000	4a6aa840-e903-4c9c-aa98-8fed5f593e22	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 16:25:33.156647+00	
00000000-0000-0000-0000-000000000000	67df6444-8d73-4126-b53c-37cb9ef41c5f	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 16:49:16.964566+00	
00000000-0000-0000-0000-000000000000	4269891a-caa5-49db-bc44-b959a4542667	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 16:57:26.21979+00	
00000000-0000-0000-0000-000000000000	4f9a77db-efbe-4f00-bcbf-137fe7048eb0	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 17:26:19.093311+00	
00000000-0000-0000-0000-000000000000	2ffb4ac0-9832-418a-a236-b932e9f1fe90	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 17:26:19.095601+00	
00000000-0000-0000-0000-000000000000	b9275bbf-6fde-43df-9b77-33a5de240aef	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 17:47:31.804921+00	
00000000-0000-0000-0000-000000000000	26c39032-111f-4968-b60e-4f0f8bbf2c22	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 17:47:31.806356+00	
00000000-0000-0000-0000-000000000000	49b0f646-e86e-4669-a0fc-edaf2a0ee71c	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 18:45:31.828713+00	
00000000-0000-0000-0000-000000000000	bcfc773b-e367-4e3a-84e5-ed1fb9021051	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 18:45:31.830337+00	
00000000-0000-0000-0000-000000000000	cfa684d1-6b67-4b1a-852a-7ef7e954acb0	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:43:43.829379+00	
00000000-0000-0000-0000-000000000000	b9701de1-3eb9-4e82-8ab3-b507048b777e	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 19:44:04.142411+00	
00000000-0000-0000-0000-000000000000	ddd363a0-d456-43f7-81c8-07787af0e07a	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 19:44:04.143058+00	
00000000-0000-0000-0000-000000000000	f996461a-2eec-4436-afb8-9538a73afb2d	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 19:54:42.480298+00	
00000000-0000-0000-0000-000000000000	778ccf72-edf3-42fe-bf04-4143927b4c2c	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 20:42:40.035936+00	
00000000-0000-0000-0000-000000000000	2f4f829d-f7bb-4ba2-8aaf-59455855429e	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 20:42:40.037362+00	
00000000-0000-0000-0000-000000000000	3f3645b4-becf-40a7-9f40-38e148a1e674	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 20:47:34.99022+00	
00000000-0000-0000-0000-000000000000	48059ff9-b1a5-4bd2-97ea-8804a386e5de	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 20:55:02.285689+00	
00000000-0000-0000-0000-000000000000	1e2fd381-ce3c-4685-a30c-e81b518d8606	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 20:55:50.095418+00	
00000000-0000-0000-0000-000000000000	98ee6494-c0e2-46e4-97e8-4960616e68d8	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 20:55:50.095965+00	
00000000-0000-0000-0000-000000000000	2b8d6b72-1cbb-49f7-9738-9af075fb7b02	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 21:00:59.328975+00	
00000000-0000-0000-0000-000000000000	b5ac61e2-fd3c-4aaf-91e0-1acc4d17b331	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:03:43.023721+00	
00000000-0000-0000-0000-000000000000	c02c6c22-83e8-48d0-aeaa-e4e5d681eaed	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:03:43.025189+00	
00000000-0000-0000-0000-000000000000	2b3461fd-3a43-4917-bbbc-dc37de858720	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 21:23:14.669394+00	
00000000-0000-0000-0000-000000000000	b37e3cb9-e957-4d16-89b6-37a3932bbe18	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:41:25.120101+00	
00000000-0000-0000-0000-000000000000	12279a3d-d6ba-4892-81a4-6d63f8ee9b53	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:41:25.122614+00	
00000000-0000-0000-0000-000000000000	a386db3f-8377-4708-8066-e0f30f030950	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:53:09.454056+00	
00000000-0000-0000-0000-000000000000	de6c5680-d673-43ee-82c1-566b0847af6f	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:53:09.455433+00	
00000000-0000-0000-0000-000000000000	af694bda-084d-418a-80b6-72dbccbb31bd	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:55:59.799766+00	
00000000-0000-0000-0000-000000000000	7591dc48-d887-4d51-b3ff-aeaf3fa00d20	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:55:59.800531+00	
00000000-0000-0000-0000-000000000000	3d69a0ed-49f5-43c3-9703-350e17890690	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:59:20.767427+00	
00000000-0000-0000-0000-000000000000	e985b9b0-b8df-43c8-8def-c1a8b09f6e3b	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 21:59:20.768993+00	
00000000-0000-0000-0000-000000000000	d977cc93-19f4-4dd7-93f2-f56b58965e8d	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 22:00:30.430187+00	
00000000-0000-0000-0000-000000000000	0a11cff7-027a-41be-9666-fb0e9a2b448a	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 22:02:29.140391+00	
00000000-0000-0000-0000-000000000000	61d9b4b1-2e21-4864-9976-fc3772cddb8b	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 22:03:24.617871+00	
00000000-0000-0000-0000-000000000000	dfde4eab-776d-4cc9-b716-edaca3109eb6	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 22:04:35.043794+00	
00000000-0000-0000-0000-000000000000	bf007672-6688-4fb2-bd31-2db5f48155aa	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 22:04:35.04459+00	
00000000-0000-0000-0000-000000000000	3f947810-11a6-4e34-8169-dfcae5e2311d	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 22:24:05.021393+00	
00000000-0000-0000-0000-000000000000	419134ec-a2e9-429e-a471-2f58b4a957fd	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 22:24:05.02307+00	
00000000-0000-0000-0000-000000000000	68377fa3-13ac-411c-84ba-b4ca687f593e	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 22:40:16.141493+00	
00000000-0000-0000-0000-000000000000	d5ea28df-158f-4154-afd5-4b69301eba75	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 22:40:16.142923+00	
00000000-0000-0000-0000-000000000000	c149e6af-75ee-4cef-b0de-60e2e5f97d9a	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-15 22:56:12.725081+00	
00000000-0000-0000-0000-000000000000	6cbb1802-b22e-4938-b73e-98cdc62e8bca	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 23:24:38.133881+00	
00000000-0000-0000-0000-000000000000	399305b3-ed89-4419-b98e-1fd32b77e24e	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 23:24:38.135968+00	
00000000-0000-0000-0000-000000000000	b6cf1e54-a050-4dca-b72b-8c57d7950405	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 23:39:04.273453+00	
00000000-0000-0000-0000-000000000000	fada4fca-bb0a-40c1-9b6f-a8d415c0bb45	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 23:39:04.275357+00	
00000000-0000-0000-0000-000000000000	a439c327-7379-47f3-8271-53b2258214b5	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 23:55:04.300142+00	
00000000-0000-0000-0000-000000000000	49e937f1-a144-43c6-9a73-2464f94a7c46	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-15 23:55:04.302003+00	
00000000-0000-0000-0000-000000000000	f79feafd-699c-43b9-b41b-60b244ca0421	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 00:00:37.410697+00	
00000000-0000-0000-0000-000000000000	71dee045-4ab8-482a-bb92-38bc4d75c34d	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 00:25:54.090245+00	
00000000-0000-0000-0000-000000000000	c9aea03e-cea3-42b9-9640-88b6345acedd	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 00:25:54.091721+00	
00000000-0000-0000-0000-000000000000	58a7e132-5c08-4a53-8882-df4297f02445	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 00:37:40.268445+00	
00000000-0000-0000-0000-000000000000	bd05fad6-2fc7-4ee6-9022-3e1528b33177	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 00:37:40.269933+00	
00000000-0000-0000-0000-000000000000	00e8b25d-6437-43c7-bd0e-508dbade10f0	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 00:45:27.680712+00	
00000000-0000-0000-0000-000000000000	3a81502d-261c-4750-9493-932ca2c93fca	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 00:59:15.478925+00	
00000000-0000-0000-0000-000000000000	98990970-ca9f-4712-bfb5-eaaf18affba2	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 00:59:15.481478+00	
00000000-0000-0000-0000-000000000000	5f6ec25c-1be9-440e-9c7f-261a50f2ff80	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 01:14:21.377732+00	
00000000-0000-0000-0000-000000000000	9eb73f53-920f-4070-9f9d-854d11792cab	{"action":"logout","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-16 01:14:44.024854+00	
00000000-0000-0000-0000-000000000000	efb7a862-3c65-48d0-a0fc-1b298575d5df	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 01:15:09.643704+00	
00000000-0000-0000-0000-000000000000	56db1936-ea35-4776-bf38-89ebc64a1f29	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 01:44:36.391722+00	
00000000-0000-0000-0000-000000000000	0dace8c2-d5b6-439f-9587-f017eec1f360	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 02:20:14.592091+00	
00000000-0000-0000-0000-000000000000	382ca962-093f-4ade-837e-1eb49ebd2bf4	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 02:20:14.594133+00	
00000000-0000-0000-0000-000000000000	c220bfda-04a4-406f-b708-9f1e9b3adb3b	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 02:39:09.114475+00	
00000000-0000-0000-0000-000000000000	0fb57f9a-d14c-4618-b675-8f7511435212	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 02:47:07.863664+00	
00000000-0000-0000-0000-000000000000	0c98aaad-c4b9-4713-bc17-47722d636964	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 03:20:53.946124+00	
00000000-0000-0000-0000-000000000000	87257e4c-d9e3-4c76-9bb0-0f467dbb9a91	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 03:20:53.948998+00	
00000000-0000-0000-0000-000000000000	2be50bb0-23ae-4be0-8a81-962d2fc337e1	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 16:54:17.320484+00	
00000000-0000-0000-0000-000000000000	918ff16c-7402-44ed-b557-836293d50389	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 19:02:49.952159+00	
00000000-0000-0000-0000-000000000000	45028b99-41eb-4489-8e23-7ca1f4735887	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 20:50:15.233498+00	
00000000-0000-0000-0000-000000000000	a4519ad1-613e-44a4-83de-1577bce4e362	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 20:50:15.237338+00	
00000000-0000-0000-0000-000000000000	0c349784-26d4-4e94-90cb-6f486ee64789	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 21:07:45.2124+00	
00000000-0000-0000-0000-000000000000	6688f5a4-6113-4a1b-bdb7-d98547e0a199	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 21:23:26.36159+00	
00000000-0000-0000-0000-000000000000	7e620274-fef3-4ccc-8698-f3089faf3d5f	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-16 21:23:26.365676+00	
00000000-0000-0000-0000-000000000000	2d4bbbc0-7828-44bc-a98d-4d9e72e743a1	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-16 21:23:27.510686+00	
00000000-0000-0000-0000-000000000000	a18dc61d-c4d7-47c6-8286-bad3f03ef39d	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-17 02:42:52.549836+00	
00000000-0000-0000-0000-000000000000	314e0f78-ea0d-421e-ab84-7ac5c605fc9d	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-17 02:42:52.553933+00	
00000000-0000-0000-0000-000000000000	8b965e65-7ab6-4392-8484-fc6296930b29	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-17 02:42:53.130934+00	
00000000-0000-0000-0000-000000000000	c4d5be64-aaa2-4f25-bc2f-d7b054032335	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 15:58:21.104862+00	
00000000-0000-0000-0000-000000000000	cc9322b9-eba3-4a84-9d93-011ce194d57e	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 15:58:21.115881+00	
00000000-0000-0000-0000-000000000000	663e7519-ce3c-4958-8fe2-a7980f1c7d2b	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-19 15:58:24.603045+00	
00000000-0000-0000-0000-000000000000	a0e49670-870a-405d-a1f4-2788bf25af06	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-19 16:35:27.152233+00	
00000000-0000-0000-0000-000000000000	b7835fa9-7cf1-4f93-aa9e-186c2e23e745	{"action":"login","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-06-19 17:17:37.167862+00	
00000000-0000-0000-0000-000000000000	24014d68-e970-463d-9ad5-62a03ac1eb99	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 18:15:34.446013+00	
00000000-0000-0000-0000-000000000000	1202f560-5eb3-4a11-b363-e7395f14a7b0	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 18:15:34.452574+00	
00000000-0000-0000-0000-000000000000	5f90816a-9303-4079-8e00-664b76fd9cfd	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 18:18:16.637271+00	
00000000-0000-0000-0000-000000000000	25629c88-a1ad-47d8-8fc1-8f4ab33d1866	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 18:18:16.638109+00	
00000000-0000-0000-0000-000000000000	19bcd825-f74a-4ac0-b2f8-1ce597f03253	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 19:16:14.19326+00	
00000000-0000-0000-0000-000000000000	8f583611-2e32-406a-bc36-9c16f47a0e69	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 19:16:14.194667+00	
00000000-0000-0000-0000-000000000000	30fe8be4-91a3-407f-8437-8ecd3be0936c	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 19:18:31.738859+00	
00000000-0000-0000-0000-000000000000	9d6e7894-390f-4da1-85b6-6eec37a2b079	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 19:18:31.741279+00	
00000000-0000-0000-0000-000000000000	3451edd3-cd88-4b40-957d-6b30d3d432ed	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 20:26:38.133224+00	
00000000-0000-0000-0000-000000000000	7fbcdd13-8f3d-4754-81da-d5c6d78f7964	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 20:26:38.136645+00	
00000000-0000-0000-0000-000000000000	456b93aa-9a04-4db2-8b3a-16fb66fc6946	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 20:44:04.151866+00	
00000000-0000-0000-0000-000000000000	4888e75a-a366-468b-a1c9-13eec135f90c	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 20:44:04.153974+00	
00000000-0000-0000-0000-000000000000	a73aeadd-2bbd-485a-a8c7-52de0c0de740	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 21:44:38.357374+00	
00000000-0000-0000-0000-000000000000	d8112ff1-bb34-43d7-a26d-494b283658d5	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 21:44:38.360021+00	
00000000-0000-0000-0000-000000000000	7842b149-09e2-4a0d-a093-c0716fe92978	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 22:45:18.65457+00	
00000000-0000-0000-0000-000000000000	b495d1c5-af45-4498-b0e4-43a13959f455	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 22:45:18.657707+00	
00000000-0000-0000-0000-000000000000	abf84543-e54f-46a0-b282-b41afe8f0c9e	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 23:45:41.966864+00	
00000000-0000-0000-0000-000000000000	e3d77ac3-1366-415d-8fc0-bccdcfdff0a5	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 23:45:41.969026+00	
00000000-0000-0000-0000-000000000000	7f0f6751-b71e-4023-90de-154fa4a57ec6	{"action":"token_refreshed","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 23:54:59.52416+00	
00000000-0000-0000-0000-000000000000	0c75b597-1d36-48c3-b8b2-00eefc5bc274	{"action":"token_revoked","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-06-19 23:54:59.527443+00	
00000000-0000-0000-0000-000000000000	83594ba5-fb79-4a9b-8d6f-2ec6835d9c3f	{"action":"logout","actor_id":"c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7","actor_username":"es2587070@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-06-20 00:36:36.466139+00	
00000000-0000-0000-0000-000000000000	f1c55c92-5fd7-4931-8e91-241e445afc44	{"action":"user_confirmation_requested","actor_id":"896b8247-fcb1-4b8a-aff6-e5cda594bdac","actor_username":"usuario@exemplo.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-29 18:25:21.877609+00	
00000000-0000-0000-0000-000000000000	26a1416d-0f96-4ade-9519-9ba8f7093937	{"action":"user_confirmation_requested","actor_id":"896b8247-fcb1-4b8a-aff6-e5cda594bdac","actor_username":"usuario@exemplo.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-29 18:32:35.929329+00	
00000000-0000-0000-0000-000000000000	59716603-fc58-4753-ba7c-68f9e20a69a8	{"action":"user_confirmation_requested","actor_id":"896b8247-fcb1-4b8a-aff6-e5cda594bdac","actor_username":"usuario@exemplo.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-29 18:36:22.87288+00	
00000000-0000-0000-0000-000000000000	b80444b2-1dfc-44dc-bd95-9523df9ee666	{"action":"user_confirmation_requested","actor_id":"896b8247-fcb1-4b8a-aff6-e5cda594bdac","actor_username":"usuario@exemplo.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-29 18:49:14.90021+00	
00000000-0000-0000-0000-000000000000	dde4a9dd-8d99-4a2b-8453-edbe660f2b49	{"action":"user_confirmation_requested","actor_id":"896b8247-fcb1-4b8a-aff6-e5cda594bdac","actor_username":"usuario@exemplo.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-29 18:50:23.640337+00	
00000000-0000-0000-0000-000000000000	7b649c8e-2fb1-409a-870f-bd5e5f02a8c0	{"action":"user_confirmation_requested","actor_id":"ae1fa2f3-0c06-4002-8d9b-ebbafbcca200","actor_username":"joadodidao@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-06-29 18:56:54.142572+00	
00000000-0000-0000-0000-000000000000	cad0b89a-6eeb-4095-bec5-d7f44298f66c	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"demo@demo.com","user_id":"84f0cfb4-5e8a-4d30-b025-92b3bf439763","user_phone":""}}	2025-06-29 18:58:51.708085+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
e4200884-d74d-4ed2-a286-2d4807d73c39	e4200884-d74d-4ed2-a286-2d4807d73c39	{"sub": "e4200884-d74d-4ed2-a286-2d4807d73c39", "email": "secretaria@gmai.com", "email_verified": false, "phone_verified": false}	email	2025-06-14 18:53:26.382992+00	2025-06-14 18:53:26.383048+00	2025-06-14 18:53:26.383048+00	242ee251-cadd-43ea-aa37-9ec7670dbeee
c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7	c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7	{"sub": "c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7", "email": "es2587070@gmail.com", "email_verified": true, "phone_verified": false}	email	2025-06-14 18:54:07.839177+00	2025-06-14 18:54:07.839226+00	2025-06-14 18:54:07.839226+00	616aefcc-69b4-4a96-bb29-f2caa65794eb
896b8247-fcb1-4b8a-aff6-e5cda594bdac	896b8247-fcb1-4b8a-aff6-e5cda594bdac	{"sub": "896b8247-fcb1-4b8a-aff6-e5cda594bdac", "email": "usuario@exemplo.com", "email_verified": false, "phone_verified": false}	email	2025-06-29 18:25:21.865094+00	2025-06-29 18:25:21.865149+00	2025-06-29 18:25:21.865149+00	66abb5ec-c59f-4b68-922d-533511f89af6
ae1fa2f3-0c06-4002-8d9b-ebbafbcca200	ae1fa2f3-0c06-4002-8d9b-ebbafbcca200	{"sub": "ae1fa2f3-0c06-4002-8d9b-ebbafbcca200", "email": "joadodidao@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-06-29 18:56:54.139504+00	2025-06-29 18:56:54.139551+00	2025-06-29 18:56:54.139551+00	098c2481-bf35-41d4-8ace-f1bf4425c598
84f0cfb4-5e8a-4d30-b025-92b3bf439763	84f0cfb4-5e8a-4d30-b025-92b3bf439763	{"sub": "84f0cfb4-5e8a-4d30-b025-92b3bf439763", "email": "demo@demo.com", "email_verified": false, "phone_verified": false}	email	2025-06-29 18:58:51.706193+00	2025-06-29 18:58:51.706248+00	2025-06-29 18:58:51.706248+00	a1285059-6cec-4393-8333-6174383e929f
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
389d093f-3c56-40d9-8798-be140d4e26ac	e4200884-d74d-4ed2-a286-2d4807d73c39	confirmation_token	60864bcb9789685c600079015019cc1e370a26bde273259082efeb7f	secretaria@gmai.com	2025-06-14 18:53:28.588394	2025-06-14 18:53:28.588394
8e8684d2-2b27-44ca-bfc1-e39591bdd009	896b8247-fcb1-4b8a-aff6-e5cda594bdac	confirmation_token	c7ca7bb4e6ddaaaade85a47ee4f8bca58164e3740b10b9f2d0512ad1	usuario@exemplo.com	2025-06-29 18:50:25.634686	2025-06-29 18:50:25.634686
abdad568-ca93-4970-855c-06e59e42ff44	ae1fa2f3-0c06-4002-8d9b-ebbafbcca200	confirmation_token	0d1f295ed15d907d38e9bd3e19939c7e0088c1cb7b620d172bc90b0a	joadodidao@gmail.com	2025-06-29 18:56:56.129908	2025-06-29 18:56:56.129908
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7	authenticated	authenticated	es2587070@gmail.com	$2a$10$OAWpx7BRoDwYWUH.IOCP9e5ceJTNXBCCTheKQmCeHpinHdGh4a9X2	2025-06-14 18:54:50.916104+00	\N		2025-06-14 18:54:07.841535+00		\N			\N	2025-06-19 17:17:37.170636+00	{"provider": "email", "providers": ["email"]}	{"sub": "c8fe0734-a6fd-4bdb-9eaf-46e51ee5a1c7", "email": "es2587070@gmail.com", "email_verified": true, "phone_verified": false}	\N	2025-06-14 18:54:07.836137+00	2025-06-19 23:54:59.531032+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e4200884-d74d-4ed2-a286-2d4807d73c39	authenticated	authenticated	secretaria@gmai.com	$2a$10$4.t9ZoCwsUued/gIBCKDfeuQdQ0p3D9TmFRO..1M1p8CZdWRux4YC	\N	\N	60864bcb9789685c600079015019cc1e370a26bde273259082efeb7f	2025-06-14 18:53:26.388737+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "e4200884-d74d-4ed2-a286-2d4807d73c39", "email": "secretaria@gmai.com", "email_verified": false, "phone_verified": false}	\N	2025-06-14 18:53:26.369034+00	2025-06-14 18:53:28.585163+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	84f0cfb4-5e8a-4d30-b025-92b3bf439763	authenticated	authenticated	demo@demo.com	$2a$10$2ib20KiP129QA5GRqTevB.RIGElsYKyJz/v0wItyUbjy0u/3tHEve	2025-06-29 18:58:51.709498+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-06-29 18:58:51.70478+00	2025-06-29 18:58:51.71034+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	896b8247-fcb1-4b8a-aff6-e5cda594bdac	authenticated	authenticated	usuario@exemplo.com	$2a$10$qjlB7DorCIRdmoXC9ZDPX.yplPwIFI3G3J0dCmHax1sb45FHL7C0.	\N	\N	c7ca7bb4e6ddaaaade85a47ee4f8bca58164e3740b10b9f2d0512ad1	2025-06-29 18:50:23.64126+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "896b8247-fcb1-4b8a-aff6-e5cda594bdac", "email": "usuario@exemplo.com", "email_verified": false, "phone_verified": false}	\N	2025-06-29 18:25:21.829235+00	2025-06-29 18:50:25.632676+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ae1fa2f3-0c06-4002-8d9b-ebbafbcca200	authenticated	authenticated	joadodidao@gmail.com	$2a$10$j/Mlk./iYryFjzsyRcF3OeUBX9QSFCTsrdSL32sCKKlZnS.KgwlBW	\N	\N	0d1f295ed15d907d38e9bd3e19939c7e0088c1cb7b620d172bc90b0a	2025-06-29 18:56:54.143901+00		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"sub": "ae1fa2f3-0c06-4002-8d9b-ebbafbcca200", "email": "joadodidao@gmail.com", "email_verified": false, "phone_verified": false}	\N	2025-06-29 18:56:54.135239+00	2025-06-29 18:56:56.128101+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: agenda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agenda (id, titulo, descricao, data, hora, status, criado_por, created_at, updated_at) FROM stdin;
b544d96e-264e-4490-a89a-78e5362f5c0e	marcas de sangue	\N	2025-06-06	11:11:00	pendente	c26c9b7a-5788-4c75-8cee-defd3b547bcf	2025-06-23 03:26:09.419155+00	2025-06-23 03:26:09.419155+00
\.


--
-- Data for Name: alunos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alunos (id, nome, telefone, email, endereco, status, idioma, turma_id, created_at, updated_at, data_conclusao, data_cancelamento, cpf, responsavel_id, numero_endereco, data_nascimento, data_exclusao) FROM stdin;
386bf983-f251-40e2-a3a1-87ffbb944814	Alberto elias Barbosa	(11) 94314-4114	Albertofreelancer@gmail.com	Rua Assis Valente, Jardim Pinhal, Guarulhos - SP, CEP: 07120-020	Inativo	Inglês	\N	2025-07-05 01:48:27.890521+00	2025-07-05 01:48:27.890521+00	\N	\N	01001242831	\N	162	1971-10-17	2025-07-05 05:28:10.206
9f5241d3-5a45-4373-89ef-5ed539e4d9b2	Alice Almeida Alcantara	(11) 95304-8080	alcantaraalice2@gmail.com	Rua Manoel Reis da Silva, Vila Carmela I, Guarulhos - SP, CEP: 07178-450	Inativo	Inglês	\N	2025-07-05 01:51:33.513888+00	2025-07-05 01:51:33.513888+00	\N	\N	51140341898	\N	162	2001-12-29	2025-07-05 15:16:28.687
4be96d37-d1a2-4450-8c3e-ae3eb53fc1ac	Agata de Oliveira Teixeira 	(11) 95377-4675	agatadeoliveirateixeira@gmail.com	Rua Guirecema, Vila Nova Bonsucesso, Guarulhos - SP, CEP: 07176-321	Inativo	Inglês	\N	2025-07-05 01:46:10.740453+00	2025-07-05 01:46:10.740453+00	\N	\N	55134792810	\N	142	2006-12-15	2025-07-05 05:26:58.782
\.


--
-- Data for Name: aulas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aulas (id, turma_id, data, conteudo, created_at, updated_at) FROM stdin;
9bd71a51-972a-43ac-904b-2ce427f160cb	e57ddff0-9309-48b9-98e0-f40efca54cf0	2025-06-14	aula de listening	2025-06-15 14:45:20.50356+00	2025-06-15 14:45:20.50356+00
\.


--
-- Data for Name: avaliacoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avaliacoes (id, aluno_id, turma_id, data, nota, observacao, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: avaliacoes_competencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avaliacoes_competencia (id, aluno_id, turma_id, data, competencia, nota, observacao, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: boletos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boletos (id, aluno_id, data_vencimento, valor, status, link_pagamento, descricao, created_at, updated_at, juros, multa, metodo_pagamento, data_pagamento, observacoes, numero_parcela, contrato_id) FROM stdin;
\.


--
-- Data for Name: configuracoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracoes (id, chave, valor, created_at, updated_at) FROM stdin;
6ce65ea2-4c8e-441c-b610-e4f0518a5ce1	idiomas	["Inglês", "Japonês"]	2025-06-14 18:50:15.224631+00	2025-06-14 18:50:15.224631+00
3a40c62a-721a-4d6b-bdf7-f14b244e73e4	metodos_pagamento	["Pix", "Boleto", "Dinheiro", "Cartão"]	2025-06-14 18:50:15.224631+00	2025-06-14 18:50:15.224631+00
7679bdf8-d184-46d2-b3d5-1bc7bfd78a24	niveis	["Book 1", "Book 2", "Book 3", "Book 4", "Book 5", "Book 6", "Book 7", "Book 8", "Book 9", "Book 10"]	2025-06-14 18:50:15.224631+00	2025-06-14 18:50:15.224631+00
\.


--
-- Data for Name: contratos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contratos (id, aluno_id, data_inicio, data_fim, valor_mensalidade, status_contrato, created_at, updated_at, observacao, plano_id) FROM stdin;
3233e0ce-6a6b-4fb2-8874-95222f2170bb	\N	2025-07-01	2030-07-01	2000.00	Ativo	2025-07-01 16:53:21.323649+00	2025-07-01 16:53:21.323649+00	Contrato iniciado em 30/06/2025 - Renovado em 01/07/2025 até 30/06/2027 - Renovado em 01/07/2025 (Início: 30/06/2025, Nova data fim: 30/06/2028) - Renovado em 01/07/2025 (Início: 30/06/2025, Nova data fim: 30/06/2029) - Renovado em 01/07/2025 (Início: 30/06/2025, Nova data fim: 30/06/2030)	\N
c6841b8d-3c0b-4302-9cea-3e5cd48c65ca	\N	2000-03-13	2001-03-12	2000.00	Ativo	2025-07-03 02:39:26.830924+00	2025-07-03 02:39:26.830924+00	\N	\N
159faa36-e23e-4534-bf4e-2461317e6024	\N	2024-07-10	2025-07-10	200.00	Ativo	2025-07-03 14:04:03.137288+00	2025-07-03 14:04:03.137288+00	\N	\N
\.


--
-- Data for Name: despesas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.despesas (id, descricao, valor, data, categoria, status, created_at, updated_at) FROM stdin;
3e92d348-7cf7-43b5-ac55-9cdc08cc7434	aluguel 2025 fev	2000.00	2025-07-16	aluguel	Pago	2025-07-03 23:51:27.921775+00	2025-07-03 23:51:27.921775+00
\.


--
-- Data for Name: documentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documentos (id, aluno_id, tipo, data, arquivo_link, status, created_at, updated_at, professor_id) FROM stdin;
\.


--
-- Data for Name: financeiro_alunos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financeiro_alunos (id, aluno_id, plano_id, valor_plano, valor_material, valor_matricula, desconto_total, valor_total, status_geral, data_primeiro_vencimento, created_at, updated_at, forma_pagamento_material, numero_parcelas_material, forma_pagamento_matricula, numero_parcelas_matricula, forma_pagamento_plano, numero_parcelas_plano) FROM stdin;
\.


--
-- Data for Name: folha_pagamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.folha_pagamento (id, professor_id, mes, ano, valor, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: historico_pagamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historico_pagamentos (id, boleto_id, aluno_id, contrato_id, valor_original, valor_pago, juros, multa, desconto, metodo_pagamento, data_pagamento, data_vencimento_original, observacoes, usuario_id, tipo_transacao, status_anterior, status_novo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs (id, usuario_id, acao, tabela_afetada, registro_id, data, descricao, created_at) FROM stdin;
\.


--
-- Data for Name: materiais; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materiais (id, nome, descricao, idioma, nivel, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: materiais_entregues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materiais_entregues (id, aluno_id, material_id, data_entrega, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notificacoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacoes (id, tipo, destinatario_id, mensagem, data_envio, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pesquisas_satisfacao; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pesquisas_satisfacao (id, aluno_id, turma_id, data, nota, comentario, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: planos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planos (id, nome, descricao, numero_aulas, frequencia_aulas, carga_horaria_total, permite_cancelamento, permite_parcelamento, observacoes, ativo, created_at, updated_at, valor_total, valor_por_aula, horario_por_aula, idioma) FROM stdin;
d8f0c674-bae2-4786-9df5-2b9d64502d47	plano silver	plano de verão	36	"semanal"	72	t	t	\N	t	2025-07-03 00:32:31.991744+00	2025-07-03 13:16:23.195368+00	2000.00	55.56	2.00	Inglês
59bd6b36-f93a-4de2-a8b2-4df27a00f6f7	eduardo	srgare	136	"semanal"	272	f	f	frhrt	t	2025-07-03 19:36:57.901098+00	2025-07-03 22:17:51.471338+00	2000.00	55.56	2.00	Inglês
4fed2bb1-ec6d-45cd-a6c8-5ed778cfb035	Plano do Kauan 	plano de primavera	22	"semanal"	44	f	f	\N	t	2025-07-03 14:38:36.42385+00	2025-07-05 01:26:12.019732+00	2000.00	55.56	2.00	Japonês
\.


--
-- Data for Name: planos_aula; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planos_aula (id, turma_id, data, conteudo, professor_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: presencas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.presencas (id, aula_id, aluno_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: professores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.professores (id, nome, telefone, email, idiomas, salario, created_at, updated_at, cpf, status, excluido, data_exclusao) FROM stdin;
62d55389-04e7-4f4d-82d7-3ae784e240c5	Teacher Douglas 	\N	tsschool@teacherdouglas.com	Inglês	\N	2025-07-05 01:33:12.512764+00	2025-07-05 01:33:12.512764+00	\N	ativo	f	\N
296e8adc-dfe1-44b6-b94a-dec9abf959aa	Teacher Daiane 	\N	tsschool@teacherdaiane.com	Inglês	\N	2025-07-05 01:32:04.810305+00	2025-07-05 01:32:04.810305+00	\N	ativo	f	\N
55a8d110-ef76-43cf-bbcf-af835ef99177	Sensei Jonathan 	\N	tsschool@senseijonathan.com	Japonês	\N	2025-07-05 01:30:55.086026+00	2025-07-05 01:30:55.086026+00	45295090876	ativo	f	\N
8669e542-0d6b-4638-b8b2-c22669e4c65e	Teacher Gabriel 	\N	tsschool@teachergabriel.com	Inglês	\N	2025-07-05 01:34:36.843295+00	2025-07-05 01:34:36.843295+00	\N	ativo	f	\N
0a08a181-7fe4-4ba0-b900-fb116ef797e8	Teacher Lincoln 	\N	tsschool@teacherlincoln.com	Inglês	\N	2025-07-05 01:35:49.752763+00	2025-07-05 01:35:49.752763+00	\N	ativo	f	\N
\.


--
-- Data for Name: ranking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ranking (id, aluno_id, turma_id, pontuacao, data, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: recibos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recibos (id, aluno_id, data, valor, descricao, arquivo_link, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: responsaveis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.responsaveis (id, nome, cpf, endereco, telefone, created_at, updated_at, numero_endereco, status) FROM stdin;
1bb8fc99-8d0b-47e2-8300-8faeeb3b158d	Mãe do Kauan	28471574845	Avenida Paschoal Thomeu, Vila Nova Bonsucesso, Guarulhos - SP, CEP: 07175-090	1192328945	2025-06-15 21:09:40.764871+00	2025-06-15 21:09:40.764871+00	2502	ativo
9326827b-2fc9-4d6b-93b3-b105272df834	pai do joão doido 	11112435567	Rua Santa Izabel do Pará, Jardim do Triunfo, Guarulhos - SP, CEP: 07175-390	(11) 94883-3725	2025-06-19 16:37:15.591993+00	2025-06-19 16:37:15.591993+00	15	ativo
5f08fa1e-5e52-4800-939d-cfe4ee76f91c	Risoane Souza da Silva	28471574845	Avenida Paschoal Thomeu, Vila Nova Bonsucesso, Guarulhos - SP, CEP: 07175-090	(11) 99232-8945	2025-06-21 17:14:58.285608+00	2025-06-21 17:14:58.285608+00	2502	ativo
c75f10c9-1ca2-4641-87b4-904e3f907ba9	mae do eduardo	93847984738	FSDFUS8FA0S9	(31) 31231-221	2025-06-21 17:21:57.5334+00	2025-06-21 17:21:57.5334+00	12231rfsdfsdfsa	ativo
\.


--
-- Data for Name: salas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salas (id, nome, capacidade, tipo, created_at, updated_at, status) FROM stdin;
53be6f0a-8ff5-4a01-aa44-2b0d29e6fd12	Sala 2	10	Física	2025-06-15 11:45:45.277884+00	2025-06-15 11:45:45.277884+00	ativa
01a8771b-5c54-42f6-b76f-fd35b372b428	sala test	15	Virtual	2025-06-15 14:29:24.851505+00	2025-06-15 14:29:24.851505+00	ativa
44386c1a-a3ca-4bae-9753-5785442ed42f	Sala 1	12	Física	2025-06-27 17:10:35.150295+00	2025-06-27 17:10:35.150295+00	ativa
e8e87637-bbb2-4bb3-8865-132e6a382557	Sala 3	8	Física	2025-06-27 17:10:35.150295+00	2025-06-27 17:10:35.150295+00	ativa
1496a36c-ce59-4009-b23f-df66260a6af0	Sala Online A	20	Virtual	2025-06-27 17:10:35.150295+00	2025-06-27 17:10:35.150295+00	ativa
10aa4ff7-b0c9-449f-a0d0-05f610ea5033	Sala Online B	15	Virtual	2025-06-27 17:10:35.150295+00	2025-06-27 17:10:35.150295+00	ativa
feb0748d-9255-4019-9acf-49228a5ef7b2	Sala Teste	30	Física	2025-06-28 18:19:07.007126+00	2025-06-28 18:19:07.007126+00	ativa
\.


--
-- Data for Name: turmas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.turmas (id, nome, idioma, nivel, dias_da_semana, horario, professor_id, created_at, updated_at, status, sala_id) FROM stdin;
e57ddff0-9309-48b9-98e0-f40efca54cf0	book1	Inglês	Book 1	Seg/Qua	08h á 10h	\N	2025-06-14 19:31:20.272433+00	2025-06-14 19:31:20.272433+00	ativa	01a8771b-5c54-42f6-b76f-fd35b372b428
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nome, email, senha, cargo, permissoes, created_at, updated_at, funcao, perm_visualizar_alunos, perm_gerenciar_alunos, perm_visualizar_turmas, perm_gerenciar_turmas, perm_visualizar_aulas, perm_gerenciar_aulas, perm_visualizar_avaliacoes, perm_gerenciar_avaliacoes, perm_visualizar_agenda, perm_gerenciar_agenda, perm_visualizar_contratos, perm_gerenciar_contratos, perm_gerenciar_presencas, perm_gerenciar_usuarios, perm_visualizar_professores, perm_gerenciar_professores, perm_visualizar_salas, perm_gerenciar_salas, perm_visualizar_materiais, perm_gerenciar_materiais, perm_visualizar_financeiro, perm_gerenciar_financeiro, perm_visualizar_gerador_contratos, perm_gerenciar_gerador_contratos, perm_visualizar_documentos, perm_gerenciar_documentos, status, perm_visualizar_planos, perm_gerenciar_planos) FROM stdin;
bd4faf9e-e9fb-4504-ac4d-eb79edaba61d	joao doidao	joadodidao@gmail.com	lekao229852	Admin		2025-06-19 22:49:01.262325+00	2025-06-19 22:49:01.262325+00	\N	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	f	ativo	t	t
c26c9b7a-5788-4c75-8cee-defd3b547bcf	Usuário Padrão	usuario@exemplo.com	meda1real1	Admin	\N	2025-06-14 22:20:11.016242+00	2025-06-14 22:20:11.016242+00	\N	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	ativo	t	t
\.


--
-- Data for Name: usuarios_pendentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios_pendentes (id, nome, email, senha, cargo, permissoes, funcao, status, created_at, updated_at, perm_criar_alunos, perm_editar_alunos, perm_remover_alunos, perm_criar_turmas, perm_editar_turmas, perm_remover_turmas, perm_criar_contratos, perm_editar_contratos, perm_remover_contratos, perm_aprovar_contratos, perm_criar_aulas, perm_editar_aulas, perm_remover_aulas, perm_gerenciar_presencas, perm_criar_avaliacoes, perm_editar_avaliacoes, perm_remover_avaliacoes, perm_gerenciar_boletos, perm_gerenciar_despesas, perm_gerenciar_folha, perm_gerenciar_usuarios, perm_visualizar_gerador_contratos, perm_gerenciar_gerador_contratos, perm_visualizar_documentos, perm_gerenciar_documentos) FROM stdin;
\.


--
-- Data for Name: messages_2025_07_02; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_07_02 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_07_03; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_07_03 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_07_04; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_07_04 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_07_05; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_07_05 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_07_06; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_07_06 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_07_07; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_07_07 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_07_08; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_07_08 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-06-14 18:31:48
20211116045059	2025-06-14 18:31:52
20211116050929	2025-06-14 18:31:56
20211116051442	2025-06-14 18:31:59
20211116212300	2025-06-14 18:32:03
20211116213355	2025-06-14 18:32:07
20211116213934	2025-06-14 18:32:10
20211116214523	2025-06-14 18:32:15
20211122062447	2025-06-14 18:32:18
20211124070109	2025-06-14 18:32:21
20211202204204	2025-06-14 18:32:24
20211202204605	2025-06-14 18:32:28
20211210212804	2025-06-14 18:32:38
20211228014915	2025-06-14 18:32:42
20220107221237	2025-06-14 18:32:45
20220228202821	2025-06-14 18:32:48
20220312004840	2025-06-14 18:32:52
20220603231003	2025-06-14 18:32:57
20220603232444	2025-06-14 18:33:00
20220615214548	2025-06-14 18:33:04
20220712093339	2025-06-14 18:33:08
20220908172859	2025-06-14 18:33:11
20220916233421	2025-06-14 18:33:14
20230119133233	2025-06-14 18:33:18
20230128025114	2025-06-14 18:33:22
20230128025212	2025-06-14 18:33:26
20230227211149	2025-06-14 18:33:29
20230228184745	2025-06-14 18:33:32
20230308225145	2025-06-14 18:33:36
20230328144023	2025-06-14 18:33:39
20231018144023	2025-06-14 18:33:43
20231204144023	2025-06-14 18:33:48
20231204144024	2025-06-14 18:33:51
20231204144025	2025-06-14 18:33:55
20240108234812	2025-06-14 18:33:58
20240109165339	2025-06-14 18:34:01
20240227174441	2025-06-14 18:34:07
20240311171622	2025-06-14 18:34:12
20240321100241	2025-06-14 18:34:19
20240401105812	2025-06-14 18:34:29
20240418121054	2025-06-14 18:34:33
20240523004032	2025-06-14 18:34:45
20240618124746	2025-06-14 18:34:49
20240801235015	2025-06-14 18:34:52
20240805133720	2025-06-14 18:34:55
20240827160934	2025-06-14 18:34:59
20240919163303	2025-06-14 18:35:03
20240919163305	2025-06-14 18:35:07
20241019105805	2025-06-14 18:35:10
20241030150047	2025-06-14 18:35:22
20241108114728	2025-06-14 18:35:27
20241121104152	2025-06-14 18:35:30
20241130184212	2025-06-14 18:35:34
20241220035512	2025-06-14 18:35:38
20241220123912	2025-06-14 18:35:41
20241224161212	2025-06-14 18:35:44
20250107150512	2025-06-14 18:35:48
20250110162412	2025-06-14 18:35:51
20250123174212	2025-06-14 18:35:54
20250128220012	2025-06-14 18:35:58
20250506224012	2025-06-14 18:36:00
20250523164012	2025-06-14 18:36:04
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-06-14 18:31:44.074298
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-06-14 18:31:44.088368
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-06-14 18:31:44.13738
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-06-14 18:31:44.160098
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-06-14 18:31:44.176355
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-06-14 18:31:44.188114
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-06-14 18:31:44.197229
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-06-14 18:31:44.207235
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-06-14 18:31:44.216758
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-06-14 18:31:44.225998
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-06-14 18:31:44.235004
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-06-14 18:31:44.246048
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-06-14 18:31:44.261035
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-06-14 18:31:44.268942
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-06-14 18:31:44.277085
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-06-14 18:31:44.304165
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-06-14 18:31:44.312248
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-06-14 18:31:44.321758
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-06-14 18:31:44.333033
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-06-14 18:31:44.343753
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-06-14 18:31:44.35462
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-06-14 18:31:44.366574
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-06-14 18:31:44.383287
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-06-14 18:31:44.397391
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-06-14 18:31:44.408106
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-06-14 18:31:44.416518
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name, created_by, idempotency_key) FROM stdin;
20250131000000	{"-- Configurar constraints para proteger planos e preservar histórico financeiro\r\n-- Esta migração resolve o problema de exclusão de alunos com planos associados\r\n\r\n-- 1. FINANCEIRO_ALUNOS -> PLANO: RESTRICT (protege o plano)\r\n-- Não permite excluir plano se há registros financeiros\r\nALTER TABLE public.financeiro_alunos \r\nDROP CONSTRAINT IF EXISTS financeiro_alunos_plano_id_fkey","ALTER TABLE public.financeiro_alunos \r\nADD CONSTRAINT financeiro_alunos_plano_id_fkey \r\nFOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE RESTRICT","-- 2. CONTRATOS -> PLANO: RESTRICT (protege o plano)\r\n-- Não permite excluir plano se há contratos ativos\r\nALTER TABLE public.contratos \r\nDROP CONSTRAINT IF EXISTS contratos_plano_id_fkey","ALTER TABLE public.contratos \r\nADD CONSTRAINT contratos_plano_id_fkey \r\nFOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE RESTRICT","-- 3. FINANCEIRO_ALUNOS -> ALUNO: SET NULL (preserva histórico financeiro)\r\n-- Quando aluno é excluído, mantém registros financeiros mas remove referência\r\nALTER TABLE public.financeiro_alunos \r\nDROP CONSTRAINT IF EXISTS financeiro_alunos_aluno_id_fkey","ALTER TABLE public.financeiro_alunos \r\nADD CONSTRAINT financeiro_alunos_aluno_id_fkey \r\nFOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL","-- 4. CONTRATOS -> ALUNO: SET NULL (preserva histórico de contratos)\r\n-- Quando aluno é excluído, mantém contrato mas remove referência\r\nALTER TABLE public.contratos \r\nDROP CONSTRAINT IF EXISTS contratos_aluno_id_fkey","ALTER TABLE public.contratos \r\nADD CONSTRAINT contratos_aluno_id_fkey \r\nFOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL","-- 5. PARCELAS -> ALUNO: SET NULL (preserva histórico de parcelas)\r\n-- Quando aluno é excluído, mantém parcelas mas remove referência\r\nALTER TABLE public.parcelas \r\nDROP CONSTRAINT IF EXISTS parcelas_aluno_id_fkey","ALTER TABLE public.parcelas \r\nADD CONSTRAINT parcelas_aluno_id_fkey \r\nFOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL","-- 6. BOLETOS -> ALUNO: SET NULL (preserva histórico de boletos)\r\n-- Quando aluno é excluído, mantém boletos mas remove referência\r\nALTER TABLE public.boletos \r\nDROP CONSTRAINT IF EXISTS boletos_aluno_id_fkey","ALTER TABLE public.boletos \r\nADD CONSTRAINT boletos_aluno_id_fkey \r\nFOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL","-- 7. RECIBOS -> ALUNO: SET NULL (preserva histórico de recibos)\r\n-- Quando aluno é excluído, mantém recibos mas remove referência\r\nALTER TABLE public.recibos \r\nDROP CONSTRAINT IF EXISTS recibos_aluno_id_fkey","ALTER TABLE public.recibos \r\nADD CONSTRAINT recibos_aluno_id_fkey \r\nFOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL","-- 8. HISTORICO_PAGAMENTOS -> ALUNO: SET NULL (preserva histórico de pagamentos)\r\n-- Quando aluno é excluído, mantém histórico mas remove referência\r\nALTER TABLE public.historico_pagamentos \r\nDROP CONSTRAINT IF EXISTS historico_pagamentos_aluno_id_fkey","ALTER TABLE public.historico_pagamentos \r\nADD CONSTRAINT historico_pagamentos_aluno_id_fkey \r\nFOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL"}	fix_planos_constraints_preserve_financial	\N	\N
\.


--
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 98, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: agenda agenda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda
    ADD CONSTRAINT agenda_pkey PRIMARY KEY (id);


--
-- Name: alunos alunos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alunos
    ADD CONSTRAINT alunos_pkey PRIMARY KEY (id);


--
-- Name: aulas aulas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT aulas_pkey PRIMARY KEY (id);


--
-- Name: avaliacoes_competencia avaliacoes_competencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes_competencia
    ADD CONSTRAINT avaliacoes_competencia_pkey PRIMARY KEY (id);


--
-- Name: avaliacoes avaliacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes
    ADD CONSTRAINT avaliacoes_pkey PRIMARY KEY (id);


--
-- Name: boletos boletos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boletos
    ADD CONSTRAINT boletos_pkey PRIMARY KEY (id);


--
-- Name: configuracoes configuracoes_chave_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes
    ADD CONSTRAINT configuracoes_chave_key UNIQUE (chave);


--
-- Name: configuracoes configuracoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracoes
    ADD CONSTRAINT configuracoes_pkey PRIMARY KEY (id);


--
-- Name: contratos contratos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_pkey PRIMARY KEY (id);


--
-- Name: despesas despesas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.despesas
    ADD CONSTRAINT despesas_pkey PRIMARY KEY (id);


--
-- Name: documentos documentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_pkey PRIMARY KEY (id);


--
-- Name: financeiro_alunos financeiro_alunos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro_alunos
    ADD CONSTRAINT financeiro_alunos_pkey PRIMARY KEY (id);


--
-- Name: folha_pagamento folha_pagamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folha_pagamento
    ADD CONSTRAINT folha_pagamento_pkey PRIMARY KEY (id);


--
-- Name: folha_pagamento folha_pagamento_professor_id_mes_ano_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folha_pagamento
    ADD CONSTRAINT folha_pagamento_professor_id_mes_ano_key UNIQUE (professor_id, mes, ano);


--
-- Name: historico_pagamentos historico_pagamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_pagamentos
    ADD CONSTRAINT historico_pagamentos_pkey PRIMARY KEY (id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- Name: materiais_entregues materiais_entregues_aluno_id_material_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiais_entregues
    ADD CONSTRAINT materiais_entregues_aluno_id_material_id_key UNIQUE (aluno_id, material_id);


--
-- Name: materiais_entregues materiais_entregues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiais_entregues
    ADD CONSTRAINT materiais_entregues_pkey PRIMARY KEY (id);


--
-- Name: materiais materiais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiais
    ADD CONSTRAINT materiais_pkey PRIMARY KEY (id);


--
-- Name: notificacoes notificacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (id);


--
-- Name: pesquisas_satisfacao pesquisas_satisfacao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesquisas_satisfacao
    ADD CONSTRAINT pesquisas_satisfacao_pkey PRIMARY KEY (id);


--
-- Name: planos_aula planos_aula_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planos_aula
    ADD CONSTRAINT planos_aula_pkey PRIMARY KEY (id);


--
-- Name: planos planos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planos
    ADD CONSTRAINT planos_pkey PRIMARY KEY (id);


--
-- Name: presencas presencas_aula_id_aluno_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presencas
    ADD CONSTRAINT presencas_aula_id_aluno_id_key UNIQUE (aula_id, aluno_id);


--
-- Name: presencas presencas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presencas
    ADD CONSTRAINT presencas_pkey PRIMARY KEY (id);


--
-- Name: professores professores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professores
    ADD CONSTRAINT professores_pkey PRIMARY KEY (id);


--
-- Name: ranking ranking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking
    ADD CONSTRAINT ranking_pkey PRIMARY KEY (id);


--
-- Name: recibos recibos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recibos
    ADD CONSTRAINT recibos_pkey PRIMARY KEY (id);


--
-- Name: responsaveis responsaveis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responsaveis
    ADD CONSTRAINT responsaveis_pkey PRIMARY KEY (id);


--
-- Name: salas salas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salas
    ADD CONSTRAINT salas_pkey PRIMARY KEY (id);


--
-- Name: turmas turmas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turmas
    ADD CONSTRAINT turmas_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios_pendentes usuarios_pendentes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_pendentes
    ADD CONSTRAINT usuarios_pendentes_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_07_02 messages_2025_07_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_07_02
    ADD CONSTRAINT messages_2025_07_02_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_07_03 messages_2025_07_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_07_03
    ADD CONSTRAINT messages_2025_07_03_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_07_04 messages_2025_07_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_07_04
    ADD CONSTRAINT messages_2025_07_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_07_05 messages_2025_07_05_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_07_05
    ADD CONSTRAINT messages_2025_07_05_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_07_06 messages_2025_07_06_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_07_06
    ADD CONSTRAINT messages_2025_07_06_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_07_07 messages_2025_07_07_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_07_07
    ADD CONSTRAINT messages_2025_07_07_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_07_08 messages_2025_07_08_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_07_08
    ADD CONSTRAINT messages_2025_07_08_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_alunos_cpf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_alunos_cpf ON public.alunos USING btree (cpf) WHERE (cpf IS NOT NULL);


--
-- Name: idx_alunos_responsavel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alunos_responsavel_id ON public.alunos USING btree (responsavel_id);


--
-- Name: idx_alunos_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alunos_status ON public.alunos USING btree (status);


--
-- Name: idx_boletos_contrato_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_boletos_contrato_id ON public.boletos USING btree (contrato_id);


--
-- Name: idx_boletos_data_pagamento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_boletos_data_pagamento ON public.boletos USING btree (data_pagamento);


--
-- Name: idx_boletos_data_vencimento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_boletos_data_vencimento ON public.boletos USING btree (data_vencimento);


--
-- Name: idx_boletos_numero_parcela; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_boletos_numero_parcela ON public.boletos USING btree (numero_parcela);


--
-- Name: idx_boletos_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_boletos_status ON public.boletos USING btree (status);


--
-- Name: idx_contratos_data_fim_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_data_fim_status ON public.contratos USING btree (data_fim, status_contrato) WHERE (status_contrato = 'Ativo'::public.status_contrato);


--
-- Name: idx_contratos_plano_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_plano_id ON public.contratos USING btree (plano_id);


--
-- Name: idx_documentos_professor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documentos_professor_id ON public.documentos USING btree (professor_id);


--
-- Name: idx_financeiro_alunos_aluno_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_aluno_id ON public.financeiro_alunos USING btree (aluno_id);


--
-- Name: idx_financeiro_alunos_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_created_at ON public.financeiro_alunos USING btree (created_at);


--
-- Name: idx_financeiro_alunos_forma_pagamento_material; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_forma_pagamento_material ON public.financeiro_alunos USING btree (forma_pagamento_material);


--
-- Name: idx_financeiro_alunos_forma_pagamento_matricula; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_forma_pagamento_matricula ON public.financeiro_alunos USING btree (forma_pagamento_matricula);


--
-- Name: idx_financeiro_alunos_forma_pagamento_plano; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_forma_pagamento_plano ON public.financeiro_alunos USING btree (forma_pagamento_plano);


--
-- Name: idx_financeiro_alunos_numero_parcelas_material; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_numero_parcelas_material ON public.financeiro_alunos USING btree (numero_parcelas_material);


--
-- Name: idx_financeiro_alunos_numero_parcelas_matricula; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_numero_parcelas_matricula ON public.financeiro_alunos USING btree (numero_parcelas_matricula);


--
-- Name: idx_financeiro_alunos_numero_parcelas_plano; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_numero_parcelas_plano ON public.financeiro_alunos USING btree (numero_parcelas_plano);


--
-- Name: idx_financeiro_alunos_plano_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_plano_id ON public.financeiro_alunos USING btree (plano_id);


--
-- Name: idx_financeiro_alunos_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_status ON public.financeiro_alunos USING btree (status_geral);


--
-- Name: idx_financeiro_alunos_vencimento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_financeiro_alunos_vencimento ON public.financeiro_alunos USING btree (data_primeiro_vencimento);


--
-- Name: idx_historico_pagamentos_aluno_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historico_pagamentos_aluno_id ON public.historico_pagamentos USING btree (aluno_id);


--
-- Name: idx_historico_pagamentos_boleto_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historico_pagamentos_boleto_id ON public.historico_pagamentos USING btree (boleto_id);


--
-- Name: idx_historico_pagamentos_contrato_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historico_pagamentos_contrato_id ON public.historico_pagamentos USING btree (contrato_id);


--
-- Name: idx_historico_pagamentos_data_pagamento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historico_pagamentos_data_pagamento ON public.historico_pagamentos USING btree (data_pagamento);


--
-- Name: idx_historico_pagamentos_metodo_pagamento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historico_pagamentos_metodo_pagamento ON public.historico_pagamentos USING btree (metodo_pagamento);


--
-- Name: idx_historico_pagamentos_tipo_transacao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historico_pagamentos_tipo_transacao ON public.historico_pagamentos USING btree (tipo_transacao);


--
-- Name: idx_materiais_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_materiais_status ON public.materiais USING btree (status);


--
-- Name: idx_planos_ativo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_planos_ativo ON public.planos USING btree (ativo);


--
-- Name: idx_planos_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_planos_created_at ON public.planos USING btree (created_at);


--
-- Name: idx_planos_idioma; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_planos_idioma ON public.planos USING btree (idioma);


--
-- Name: idx_planos_nome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_planos_nome ON public.planos USING btree (nome);


--
-- Name: idx_professores_cpf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_professores_cpf ON public.professores USING btree (cpf) WHERE (cpf IS NOT NULL);


--
-- Name: idx_professores_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professores_status ON public.professores USING btree (status);


--
-- Name: idx_responsaveis_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_responsaveis_status ON public.responsaveis USING btree (status);


--
-- Name: idx_salas_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_salas_status ON public.salas USING btree (status);


--
-- Name: idx_turmas_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_turmas_status ON public.turmas USING btree (status);


--
-- Name: idx_usuarios_pendentes_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_pendentes_created_at ON public.usuarios_pendentes USING btree (created_at);


--
-- Name: idx_usuarios_pendentes_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_pendentes_email ON public.usuarios_pendentes USING btree (email);


--
-- Name: idx_usuarios_pendentes_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_pendentes_status ON public.usuarios_pendentes USING btree (status);


--
-- Name: idx_usuarios_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_status ON public.usuarios USING btree (status);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: messages_2025_07_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_07_02_pkey;


--
-- Name: messages_2025_07_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_07_03_pkey;


--
-- Name: messages_2025_07_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_07_04_pkey;


--
-- Name: messages_2025_07_05_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_07_05_pkey;


--
-- Name: messages_2025_07_06_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_07_06_pkey;


--
-- Name: messages_2025_07_07_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_07_07_pkey;


--
-- Name: messages_2025_07_08_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_07_08_pkey;


--
-- Name: planos trigger_calculate_valor_por_aula; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_calculate_valor_por_aula BEFORE INSERT OR UPDATE OF valor_total ON public.planos FOR EACH ROW EXECUTE FUNCTION public.calculate_valor_por_aula();


--
-- Name: boletos trigger_registrar_pagamento_historico; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_registrar_pagamento_historico AFTER UPDATE ON public.boletos FOR EACH ROW EXECUTE FUNCTION public.registrar_pagamento_historico();


--
-- Name: financeiro_alunos update_financeiro_alunos_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_financeiro_alunos_updated_at BEFORE UPDATE ON public.financeiro_alunos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: planos update_planos_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_planos_updated_at BEFORE UPDATE ON public.planos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: financeiro_alunos validate_financeiro_alunos_valor_total; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER validate_financeiro_alunos_valor_total BEFORE INSERT OR UPDATE ON public.financeiro_alunos FOR EACH ROW EXECUTE FUNCTION public.validate_valor_total();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: agenda agenda_criado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda
    ADD CONSTRAINT agenda_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: alunos alunos_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alunos
    ADD CONSTRAINT alunos_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.responsaveis(id) ON DELETE SET NULL;


--
-- Name: alunos alunos_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alunos
    ADD CONSTRAINT alunos_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE SET NULL;


--
-- Name: aulas aulas_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT aulas_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE RESTRICT;


--
-- Name: avaliacoes avaliacoes_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes
    ADD CONSTRAINT avaliacoes_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;


--
-- Name: avaliacoes_competencia avaliacoes_competencia_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes_competencia
    ADD CONSTRAINT avaliacoes_competencia_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;


--
-- Name: avaliacoes_competencia avaliacoes_competencia_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes_competencia
    ADD CONSTRAINT avaliacoes_competencia_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE CASCADE;


--
-- Name: avaliacoes avaliacoes_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes
    ADD CONSTRAINT avaliacoes_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE CASCADE;


--
-- Name: boletos boletos_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boletos
    ADD CONSTRAINT boletos_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;


--
-- Name: boletos boletos_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boletos
    ADD CONSTRAINT boletos_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(id);


--
-- Name: contratos contratos_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;


--
-- Name: contratos contratos_plano_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_plano_id_fkey FOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE RESTRICT;


--
-- Name: documentos documentos_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;


--
-- Name: documentos documentos_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professores(id) ON DELETE SET NULL;


--
-- Name: CONSTRAINT documentos_professor_id_fkey ON documentos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT documentos_professor_id_fkey ON public.documentos IS 'SET NULL permite exclusão do professor mantendo documentos arquivados';


--
-- Name: financeiro_alunos financeiro_alunos_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro_alunos
    ADD CONSTRAINT financeiro_alunos_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;


--
-- Name: financeiro_alunos financeiro_alunos_plano_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financeiro_alunos
    ADD CONSTRAINT financeiro_alunos_plano_id_fkey FOREIGN KEY (plano_id) REFERENCES public.planos(id) ON DELETE RESTRICT;


--
-- Name: folha_pagamento folha_pagamento_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folha_pagamento
    ADD CONSTRAINT folha_pagamento_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professores(id) ON DELETE SET NULL;


--
-- Name: CONSTRAINT folha_pagamento_professor_id_fkey ON folha_pagamento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT folha_pagamento_professor_id_fkey ON public.folha_pagamento IS 'SET NULL permite exclusão do professor mantendo histórico de pagamentos';


--
-- Name: historico_pagamentos historico_pagamentos_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_pagamentos
    ADD CONSTRAINT historico_pagamentos_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;


--
-- Name: historico_pagamentos historico_pagamentos_boleto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_pagamentos
    ADD CONSTRAINT historico_pagamentos_boleto_id_fkey FOREIGN KEY (boleto_id) REFERENCES public.boletos(id) ON DELETE CASCADE;


--
-- Name: historico_pagamentos historico_pagamentos_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_pagamentos
    ADD CONSTRAINT historico_pagamentos_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(id) ON DELETE SET NULL;


--
-- Name: historico_pagamentos historico_pagamentos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_pagamentos
    ADD CONSTRAINT historico_pagamentos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: logs logs_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: materiais_entregues materiais_entregues_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiais_entregues
    ADD CONSTRAINT materiais_entregues_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;


--
-- Name: materiais_entregues materiais_entregues_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiais_entregues
    ADD CONSTRAINT materiais_entregues_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materiais(id) ON DELETE RESTRICT;


--
-- Name: notificacoes notificacoes_destinatario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_destinatario_id_fkey FOREIGN KEY (destinatario_id) REFERENCES public.alunos(id) ON DELETE CASCADE;


--
-- Name: pesquisas_satisfacao pesquisas_satisfacao_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesquisas_satisfacao
    ADD CONSTRAINT pesquisas_satisfacao_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;


--
-- Name: pesquisas_satisfacao pesquisas_satisfacao_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesquisas_satisfacao
    ADD CONSTRAINT pesquisas_satisfacao_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id);


--
-- Name: planos_aula planos_aula_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planos_aula
    ADD CONSTRAINT planos_aula_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professores(id);


--
-- Name: planos_aula planos_aula_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planos_aula
    ADD CONSTRAINT planos_aula_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id);


--
-- Name: presencas presencas_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presencas
    ADD CONSTRAINT presencas_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;


--
-- Name: presencas presencas_aula_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presencas
    ADD CONSTRAINT presencas_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id) ON DELETE CASCADE;


--
-- Name: ranking ranking_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking
    ADD CONSTRAINT ranking_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE;


--
-- Name: ranking ranking_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ranking
    ADD CONSTRAINT ranking_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id);


--
-- Name: recibos recibos_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recibos
    ADD CONSTRAINT recibos_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE SET NULL;


--
-- Name: turmas turmas_professor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turmas
    ADD CONSTRAINT turmas_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professores(id) ON DELETE SET NULL;


--
-- Name: CONSTRAINT turmas_professor_id_fkey ON turmas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT turmas_professor_id_fkey ON public.turmas IS 'SET NULL permite exclusão do professor, turma fica sem professor atribuído';


--
-- Name: turmas turmas_sala_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turmas
    ADD CONSTRAINT turmas_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES public.salas(id) ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: financeiro_alunos Administradores podem fazer tudo em financeiro_alunos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Administradores podem fazer tudo em financeiro_alunos" ON public.financeiro_alunos USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = (auth.jwt() ->> 'email'::text)) AND (usuarios.cargo = 'Admin'::public.cargo_usuario)))));


--
-- Name: agenda Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.agenda USING (true);


--
-- Name: alunos Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.alunos USING (true);


--
-- Name: aulas Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.aulas USING (true);


--
-- Name: avaliacoes Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.avaliacoes USING (true);


--
-- Name: avaliacoes_competencia Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.avaliacoes_competencia USING (true);


--
-- Name: boletos Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.boletos USING (true);


--
-- Name: configuracoes Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.configuracoes USING (true);


--
-- Name: contratos Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.contratos USING (true);


--
-- Name: despesas Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.despesas USING (true);


--
-- Name: documentos Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.documentos USING ((auth.uid() IS NOT NULL)) WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: folha_pagamento Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.folha_pagamento USING (true);


--
-- Name: historico_pagamentos Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.historico_pagamentos USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: logs Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.logs USING (true);


--
-- Name: materiais Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.materiais USING (true);


--
-- Name: materiais_entregues Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.materiais_entregues USING (true);


--
-- Name: notificacoes Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.notificacoes USING (true);


--
-- Name: pesquisas_satisfacao Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.pesquisas_satisfacao USING (true);


--
-- Name: planos_aula Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.planos_aula USING (true);


--
-- Name: presencas Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.presencas USING (true);


--
-- Name: professores Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.professores USING (true);


--
-- Name: ranking Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.ranking USING (true);


--
-- Name: recibos Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.recibos USING (true);


--
-- Name: responsaveis Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.responsaveis USING (true);


--
-- Name: turmas Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.turmas USING (true);


--
-- Name: usuarios Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all operations for authenticated users" ON public.usuarios USING (true);


--
-- Name: financeiro_alunos Alunos podem ver seus próprios dados financeiros; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Alunos podem ver seus próprios dados financeiros" ON public.financeiro_alunos FOR SELECT USING (((auth.jwt() ->> 'email'::text) = ( SELECT alunos.email
   FROM public.alunos
  WHERE (alunos.id = financeiro_alunos.aluno_id))));


--
-- Name: usuarios_pendentes Enable delete for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable delete for authenticated users only" ON public.usuarios_pendentes FOR DELETE USING (true);


--
-- Name: usuarios_pendentes Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for authenticated users only" ON public.usuarios_pendentes FOR INSERT WITH CHECK (true);


--
-- Name: usuarios_pendentes Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON public.usuarios_pendentes FOR SELECT USING (true);


--
-- Name: usuarios_pendentes Enable update for authenticated users only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable update for authenticated users only" ON public.usuarios_pendentes FOR UPDATE USING (true);


--
-- Name: alunos Permitir acesso total para usuários autenticados; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.alunos USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: contratos Permitir acesso total para usuários autenticados; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.contratos USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: salas Permitir acesso total para usuários autenticados; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Permitir acesso total para usuários autenticados" ON public.salas USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: financeiro_alunos Professores podem visualizar financeiro_alunos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Professores podem visualizar financeiro_alunos" ON public.financeiro_alunos FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = (auth.jwt() ->> 'email'::text)) AND (usuarios.cargo = 'Admin'::public.cargo_usuario)))));


--
-- Name: contratos Usuários podem atualizar contratos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem atualizar contratos" ON public.contratos FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = (auth.jwt() ->> 'email'::text)) AND ((usuarios.cargo = 'Admin'::public.cargo_usuario) OR (usuarios.perm_gerenciar_contratos = true))))));


--
-- Name: planos Usuários podem atualizar planos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem atualizar planos" ON public.planos FOR UPDATE USING (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.perm_gerenciar_planos = true))))));


--
-- Name: planos Usuários podem atualizar planos se tiverem permissão; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem atualizar planos se tiverem permissão" ON public.planos FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = auth.email()) AND ((usuarios.cargo = 'Admin'::public.cargo_usuario) OR (usuarios.perm_gerenciar_planos = true))))));


--
-- Name: planos Usuários podem criar planos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem criar planos" ON public.planos FOR INSERT WITH CHECK (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.perm_gerenciar_planos = true))))));


--
-- Name: planos Usuários podem deletar planos se tiverem permissão; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem deletar planos se tiverem permissão" ON public.planos FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = auth.email()) AND ((usuarios.cargo = 'Admin'::public.cargo_usuario) OR (usuarios.perm_gerenciar_planos = true))))));


--
-- Name: contratos Usuários podem excluir contratos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem excluir contratos" ON public.contratos FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = (auth.jwt() ->> 'email'::text)) AND ((usuarios.cargo = 'Admin'::public.cargo_usuario) OR (usuarios.perm_gerenciar_contratos = true))))));


--
-- Name: planos Usuários podem excluir planos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem excluir planos" ON public.planos FOR DELETE USING (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND (usuarios.perm_gerenciar_planos = true))))));


--
-- Name: contratos Usuários podem inserir contratos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem inserir contratos" ON public.contratos FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = (auth.jwt() ->> 'email'::text)) AND ((usuarios.cargo = 'Admin'::public.cargo_usuario) OR (usuarios.perm_gerenciar_contratos = true))))));


--
-- Name: planos Usuários podem inserir planos se tiverem permissão; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem inserir planos se tiverem permissão" ON public.planos FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = auth.email()) AND ((usuarios.cargo = 'Admin'::public.cargo_usuario) OR (usuarios.perm_gerenciar_planos = true))))));


--
-- Name: historico_pagamentos Usuários podem ver histórico de pagamentos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem ver histórico de pagamentos" ON public.historico_pagamentos USING ((auth.uid() IN ( SELECT usuarios.id
   FROM public.usuarios
  WHERE (usuarios.id = auth.uid()))));


--
-- Name: contratos Usuários podem visualizar contratos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem visualizar contratos" ON public.contratos FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = (auth.jwt() ->> 'email'::text)) AND ((usuarios.cargo = 'Admin'::public.cargo_usuario) OR (usuarios.perm_visualizar_contratos = true))))));


--
-- Name: planos Usuários podem visualizar planos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem visualizar planos" ON public.planos FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.perm_visualizar_planos = true) OR (usuarios.perm_gerenciar_planos = true)))))));


--
-- Name: planos Usuários podem visualizar planos se tiverem permissão; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Usuários podem visualizar planos se tiverem permissão" ON public.planos FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.email = auth.email()) AND ((usuarios.cargo = 'Admin'::public.cargo_usuario) OR (usuarios.perm_visualizar_planos = true))))));


--
-- Name: agenda; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;

--
-- Name: alunos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

--
-- Name: aulas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

--
-- Name: avaliacoes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

--
-- Name: avaliacoes_competencia; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.avaliacoes_competencia ENABLE ROW LEVEL SECURITY;

--
-- Name: boletos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.boletos ENABLE ROW LEVEL SECURITY;

--
-- Name: configuracoes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

--
-- Name: contratos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

--
-- Name: despesas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

--
-- Name: documentos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

--
-- Name: folha_pagamento; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.folha_pagamento ENABLE ROW LEVEL SECURITY;

--
-- Name: historico_pagamentos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.historico_pagamentos ENABLE ROW LEVEL SECURITY;

--
-- Name: logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

--
-- Name: materiais; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;

--
-- Name: materiais_entregues; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.materiais_entregues ENABLE ROW LEVEL SECURITY;

--
-- Name: notificacoes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

--
-- Name: pesquisas_satisfacao; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pesquisas_satisfacao ENABLE ROW LEVEL SECURITY;

--
-- Name: planos_aula; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.planos_aula ENABLE ROW LEVEL SECURITY;

--
-- Name: presencas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

--
-- Name: professores; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

--
-- Name: ranking; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ranking ENABLE ROW LEVEL SECURITY;

--
-- Name: recibos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recibos ENABLE ROW LEVEL SECURITY;

--
-- Name: responsaveis; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;

--
-- Name: salas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;

--
-- Name: turmas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios_pendentes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios_pendentes ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION calculate_valor_por_aula(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_valor_por_aula() TO anon;
GRANT ALL ON FUNCTION public.calculate_valor_por_aula() TO authenticated;
GRANT ALL ON FUNCTION public.calculate_valor_por_aula() TO service_role;


--
-- Name: FUNCTION check_aluno_dependencies(p_aluno_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_aluno_dependencies(p_aluno_id uuid) TO anon;
GRANT ALL ON FUNCTION public.check_aluno_dependencies(p_aluno_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.check_aluno_dependencies(p_aluno_id uuid) TO service_role;


--
-- Name: FUNCTION check_professor_dependencies(p_professor_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_professor_dependencies(p_professor_id uuid) TO anon;
GRANT ALL ON FUNCTION public.check_professor_dependencies(p_professor_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.check_professor_dependencies(p_professor_id uuid) TO service_role;


--
-- Name: FUNCTION obter_permissoes_usuario(usuario_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.obter_permissoes_usuario(usuario_id uuid) TO anon;
GRANT ALL ON FUNCTION public.obter_permissoes_usuario(usuario_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.obter_permissoes_usuario(usuario_id uuid) TO service_role;


--
-- Name: FUNCTION registrar_pagamento_historico(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.registrar_pagamento_historico() TO anon;
GRANT ALL ON FUNCTION public.registrar_pagamento_historico() TO authenticated;
GRANT ALL ON FUNCTION public.registrar_pagamento_historico() TO service_role;


--
-- Name: FUNCTION registrar_pagamento_parcela_historico(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.registrar_pagamento_parcela_historico() TO anon;
GRANT ALL ON FUNCTION public.registrar_pagamento_parcela_historico() TO authenticated;
GRANT ALL ON FUNCTION public.registrar_pagamento_parcela_historico() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION validate_valor_total(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.validate_valor_total() TO anon;
GRANT ALL ON FUNCTION public.validate_valor_total() TO authenticated;
GRANT ALL ON FUNCTION public.validate_valor_total() TO service_role;


--
-- Name: FUNCTION verificar_permissao(usuario_id uuid, permissao text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.verificar_permissao(usuario_id uuid, permissao text) TO anon;
GRANT ALL ON FUNCTION public.verificar_permissao(usuario_id uuid, permissao text) TO authenticated;
GRANT ALL ON FUNCTION public.verificar_permissao(usuario_id uuid, permissao text) TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE agenda; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.agenda TO anon;
GRANT ALL ON TABLE public.agenda TO authenticated;
GRANT ALL ON TABLE public.agenda TO service_role;


--
-- Name: TABLE alunos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.alunos TO anon;
GRANT ALL ON TABLE public.alunos TO authenticated;
GRANT ALL ON TABLE public.alunos TO service_role;


--
-- Name: TABLE aulas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.aulas TO anon;
GRANT ALL ON TABLE public.aulas TO authenticated;
GRANT ALL ON TABLE public.aulas TO service_role;


--
-- Name: TABLE avaliacoes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.avaliacoes TO anon;
GRANT ALL ON TABLE public.avaliacoes TO authenticated;
GRANT ALL ON TABLE public.avaliacoes TO service_role;


--
-- Name: TABLE avaliacoes_competencia; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.avaliacoes_competencia TO anon;
GRANT ALL ON TABLE public.avaliacoes_competencia TO authenticated;
GRANT ALL ON TABLE public.avaliacoes_competencia TO service_role;


--
-- Name: TABLE boletos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.boletos TO anon;
GRANT ALL ON TABLE public.boletos TO authenticated;
GRANT ALL ON TABLE public.boletos TO service_role;


--
-- Name: TABLE configuracoes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.configuracoes TO anon;
GRANT ALL ON TABLE public.configuracoes TO authenticated;
GRANT ALL ON TABLE public.configuracoes TO service_role;


--
-- Name: TABLE contratos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contratos TO anon;
GRANT ALL ON TABLE public.contratos TO authenticated;
GRANT ALL ON TABLE public.contratos TO service_role;


--
-- Name: TABLE contratos_vencendo; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contratos_vencendo TO anon;
GRANT ALL ON TABLE public.contratos_vencendo TO authenticated;
GRANT ALL ON TABLE public.contratos_vencendo TO service_role;


--
-- Name: TABLE despesas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.despesas TO anon;
GRANT ALL ON TABLE public.despesas TO authenticated;
GRANT ALL ON TABLE public.despesas TO service_role;


--
-- Name: TABLE documentos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.documentos TO anon;
GRANT ALL ON TABLE public.documentos TO authenticated;
GRANT ALL ON TABLE public.documentos TO service_role;


--
-- Name: TABLE financeiro_alunos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.financeiro_alunos TO anon;
GRANT ALL ON TABLE public.financeiro_alunos TO authenticated;
GRANT ALL ON TABLE public.financeiro_alunos TO service_role;


--
-- Name: TABLE folha_pagamento; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.folha_pagamento TO anon;
GRANT ALL ON TABLE public.folha_pagamento TO authenticated;
GRANT ALL ON TABLE public.folha_pagamento TO service_role;


--
-- Name: TABLE historico_pagamentos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.historico_pagamentos TO anon;
GRANT ALL ON TABLE public.historico_pagamentos TO authenticated;
GRANT ALL ON TABLE public.historico_pagamentos TO service_role;


--
-- Name: TABLE logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.logs TO anon;
GRANT ALL ON TABLE public.logs TO authenticated;
GRANT ALL ON TABLE public.logs TO service_role;


--
-- Name: TABLE materiais; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.materiais TO anon;
GRANT ALL ON TABLE public.materiais TO authenticated;
GRANT ALL ON TABLE public.materiais TO service_role;


--
-- Name: TABLE materiais_entregues; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.materiais_entregues TO anon;
GRANT ALL ON TABLE public.materiais_entregues TO authenticated;
GRANT ALL ON TABLE public.materiais_entregues TO service_role;


--
-- Name: TABLE notificacoes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notificacoes TO anon;
GRANT ALL ON TABLE public.notificacoes TO authenticated;
GRANT ALL ON TABLE public.notificacoes TO service_role;


--
-- Name: TABLE pesquisas_satisfacao; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pesquisas_satisfacao TO anon;
GRANT ALL ON TABLE public.pesquisas_satisfacao TO authenticated;
GRANT ALL ON TABLE public.pesquisas_satisfacao TO service_role;


--
-- Name: TABLE planos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.planos TO anon;
GRANT ALL ON TABLE public.planos TO authenticated;
GRANT ALL ON TABLE public.planos TO service_role;


--
-- Name: TABLE planos_aula; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.planos_aula TO anon;
GRANT ALL ON TABLE public.planos_aula TO authenticated;
GRANT ALL ON TABLE public.planos_aula TO service_role;


--
-- Name: TABLE presencas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.presencas TO anon;
GRANT ALL ON TABLE public.presencas TO authenticated;
GRANT ALL ON TABLE public.presencas TO service_role;


--
-- Name: TABLE professores; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.professores TO anon;
GRANT ALL ON TABLE public.professores TO authenticated;
GRANT ALL ON TABLE public.professores TO service_role;


--
-- Name: TABLE ranking; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ranking TO anon;
GRANT ALL ON TABLE public.ranking TO authenticated;
GRANT ALL ON TABLE public.ranking TO service_role;


--
-- Name: TABLE recibos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.recibos TO anon;
GRANT ALL ON TABLE public.recibos TO authenticated;
GRANT ALL ON TABLE public.recibos TO service_role;


--
-- Name: TABLE responsaveis; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.responsaveis TO anon;
GRANT ALL ON TABLE public.responsaveis TO authenticated;
GRANT ALL ON TABLE public.responsaveis TO service_role;


--
-- Name: TABLE salas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.salas TO anon;
GRANT ALL ON TABLE public.salas TO authenticated;
GRANT ALL ON TABLE public.salas TO service_role;


--
-- Name: TABLE turmas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.turmas TO anon;
GRANT ALL ON TABLE public.turmas TO authenticated;
GRANT ALL ON TABLE public.turmas TO service_role;


--
-- Name: TABLE usuarios; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.usuarios TO anon;
GRANT ALL ON TABLE public.usuarios TO authenticated;
GRANT ALL ON TABLE public.usuarios TO service_role;


--
-- Name: TABLE usuarios_pendentes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.usuarios_pendentes TO anon;
GRANT ALL ON TABLE public.usuarios_pendentes TO authenticated;
GRANT ALL ON TABLE public.usuarios_pendentes TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_07_02; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_07_02 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_07_02 TO dashboard_user;


--
-- Name: TABLE messages_2025_07_03; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_07_03 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_07_03 TO dashboard_user;


--
-- Name: TABLE messages_2025_07_04; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_07_04 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_07_04 TO dashboard_user;


--
-- Name: TABLE messages_2025_07_05; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_07_05 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_07_05 TO dashboard_user;


--
-- Name: TABLE messages_2025_07_06; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_07_06 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_07_06 TO dashboard_user;


--
-- Name: TABLE messages_2025_07_07; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_07_07 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_07_07 TO dashboard_user;


--
-- Name: TABLE messages_2025_07_08; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_07_08 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_07_08 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

