# FFPSJ · Gestor Oficial de Actas

SPA para la Federación de Fútbol Playa de San Juan, preparada también para empaquetarse como aplicación Windows con Electron.

## Puesta en marcha

1. Crea un proyecto en Supabase.
2. Ejecuta [`supabase/migrations/202608070001_initial_schema.sql`](supabase/migrations/202608070001_initial_schema.sql) en el SQL Editor.
3. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Instala y ejecuta:

```bash
npm install
npm run dev
```

Si tu gestor de paquetes solicita aprobar scripts de dependencias, aprueba los de `electron` y `esbuild` antes de usar los comandos de escritorio.

El primer usuario se crea como árbitro inactivo por seguridad. Tras registrarlo, promuévelo en el SQL Editor de Supabase:

```sql
update public.users
set role = 'admin', status = 'active'
where email = 'admin@tu-dominio.com';
```

## Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | SPA con Vite |
| `npm run electron` | Aplicación de escritorio en desarrollo |
| `npm run build` | Build web optimizado |
| `npm run dist` | Instalador Windows `FFPSJ-Setup-*.exe` |

## Seguridad

La app no utiliza datos simulados ni `localStorage`. El acceso usa Supabase Auth; la migración crea políticas RLS para separar administradores, árbitros asignados y usuarios inactivos. Los marcadores se recalculan en PostgreSQL a partir de los eventos de gol y las operaciones relevantes quedan en `audit_logs`.
