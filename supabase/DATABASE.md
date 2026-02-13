# Documentación de la Base de Datos

## 📋 Resumen

Este proyecto usa **Supabase** para autenticación y persistencia de datos. El schema incluye tablas para perfiles de usuario, conversaciones, mensajes de chat y audios TTS.

---

## 🔐 Sistema de Autenticación

### `auth.users` (Tabla Interna de Supabase)

**Esta tabla NO se crea manualmente** - es gestionada automáticamente por Supabase Auth.

**Campos incluidos:**
- `id` → UUID único del usuario
- `email` → Email del usuario
- `encrypted_password` → Contraseña encriptada (nunca accesible directamente)
- `email_confirmed_at` → Timestamp de confirmación de email
- `created_at` → Fecha de registro
- `updated_at` → Última actualización
- `raw_user_meta_data` → Metadata adicional
- `role` → Rol del usuario (authenticated, anon, etc.)

**Funcionalidades automáticas:**
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Gestión de sesiones con JWT
- ✅ Confirmación de email
- ✅ Reset de contraseña
- ✅ Magic links
- ✅ OAuth providers (Google, GitHub, etc.)

---

## 📊 Estructura de Tablas

### 1. `public.profiles`

Complementa la información de `auth.users` con datos personalizados.

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Sincronización automática:**
- Se crea automáticamente cuando se registra un usuario (trigger `handle_new_user`)
- Se actualiza cuando cambia el email en `auth.users`

**RLS (Row Level Security):**
- ✅ Los usuarios solo pueden ver/editar su propio perfil
- ✅ No se permite eliminar perfiles (cascade desde auth.users)

---

### 2. `public.conversations`

Agrupa mensajes de chat y audios TTS en conversaciones.

```sql
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Nueva conversación',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Características:**
- Título generado automáticamente desde el primer mensaje
- `updated_at` se actualiza automáticamente con trigger
- Se elimina en cascada cuando se borra el usuario

**RLS:**
- ✅ Solo el propietario puede ver/crear/editar/eliminar sus conversaciones

---

### 3. `public.messages`

Almacena los mensajes del chat (usuario y asistente).

```sql
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content jsonb NOT NULL,
  tool_used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Detalles del campo `content`:**
- Tipo `jsonb` para soportar texto simple o multimodal
- Texto simple: `"Hola, ¿cómo estás?"`
- Multimodal: `[{"type": "text", "text": "..."}, {"type": "image_url", "image_url": {...}}]`

**`tool_used`:**
- Indica si el asistente usó herramientas (búsqueda semántica, funciones, etc.)

**RLS:**
- ✅ Solo accesible si el usuario es dueño de la conversación padre

---

### 4. `public.tts_audios`

Almacena los audios generados con Text-to-Speech.

```sql
CREATE TABLE public.tts_audios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  text text NOT NULL,
  audio_url text NOT NULL,
  timestamp_ms bigint NOT NULL,
  voice_id text NOT NULL,
  voice_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Uso:**
- Compatible con ElevenLabs y otras APIs TTS
- `audio_url` puede ser base64 o URL externa
- `voice_id` identifica la voz usada
- `timestamp_ms` marca el momento de generación

**RLS:**
- ✅ Solo accesible si el usuario es dueño de la conversación padre

---

## 🔒 Políticas de Seguridad (RLS)

Todas las tablas tienen **Row Level Security** habilitado:

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | ✅ Propio | ✅ Propio | ✅ Propio | ❌ |
| `conversations` | ✅ Propio | ✅ Propio | ✅ Propio | ✅ Propio |
| `messages` | ✅ Si es dueño de conversación | ✅ Si es dueño | ✅ Si es dueño | ✅ Si es dueño |
| `tts_audios` | ✅ Si es dueño de conversación | ✅ Si es dueño | ✅ Si es dueño | ✅ Si es dueño |

**Verificación de permisos:**
```sql
-- Verificar que un usuario solo ve sus propios datos
SELECT * FROM conversations; -- Solo devuelve las del usuario actual
SELECT * FROM messages; -- Solo de conversaciones propias
```

---

## 🔄 Triggers y Funciones

### 1. `handle_new_user()`
**Trigger:** `after insert or update on auth.users`

Sincroniza automáticamente la tabla `profiles` con `auth.users`:
```sql
-- Cuando se crea/actualiza un usuario en auth.users
INSERT INTO profiles (id, email) VALUES (new.id, new.email)
ON CONFLICT (id) DO UPDATE SET email = excluded.email, updated_at = now();
```

### 2. `touch_updated_at()`
**Trigger:** `before update on conversations`

Actualiza automáticamente el campo `updated_at`:
```sql
-- Antes de actualizar una conversación
new.updated_at = now();
```

### 3. `touch_profile_updated_at()`
**Trigger:** `before update on profiles`

Actualiza automáticamente el campo `updated_at` en profiles.

---

## 🚀 Índices para Optimización

```sql
-- Búsqueda rápida de conversaciones por usuario
CREATE INDEX conversations_user_id_idx ON conversations(user_id);

-- Ordenar conversaciones por fecha (más recientes primero)
CREATE INDEX conversations_updated_at_idx ON conversations(updated_at DESC);

-- Buscar mensajes de una conversación
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);

-- Ordenar mensajes por fecha
CREATE INDEX messages_created_at_idx ON messages(created_at);

-- Buscar audios de una conversación
CREATE INDEX tts_audios_conversation_id_idx ON tts_audios(conversation_id);

-- Búsqueda rápida de perfiles por email
CREATE INDEX profiles_email_idx ON profiles(email);
```

---

## 📝 Cómo Aplicar el Schema

### En Supabase Cloud:

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Click en **SQL Editor** (barra lateral)
3. Copia y pega el contenido de `schema.sql`
4. Click en **Run** para ejecutar

### Localmente con Supabase CLI:

```bash
# Iniciar Supabase local
supabase start

# Aplicar migraciones
supabase db reset

# O aplicar el schema directamente
psql [CONNECTION_STRING] < supabase/schema.sql
```

---

## 🔍 Queries Útiles

### Ver todos los usuarios y sus perfiles
```sql
SELECT 
  au.id,
  au.email,
  au.created_at as registered_at,
  p.full_name,
  p.avatar_url
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id;
```

### Ver conversaciones con contador de mensajes
```sql
SELECT 
  c.id,
  c.title,
  c.updated_at,
  COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.user_id = auth.uid()
GROUP BY c.id, c.title, c.updated_at
ORDER BY c.updated_at DESC;
```

### Ver audios TTS de una conversación
```sql
SELECT 
  id,
  text,
  voice_name,
  created_at
FROM tts_audios
WHERE conversation_id = '[CONVERSATION_ID]'
ORDER BY created_at DESC;
```

---

## ⚠️ Importante

1. **No modifiques `auth.users` directamente** - usa las funciones de Supabase Auth
2. **Las contraseñas NUNCA son accesibles** - están encriptadas por Supabase
3. **RLS está habilitado** - los usuarios solo acceden a sus propios datos
4. **Los triggers se ejecutan automáticamente** - no es necesario crearlos en el código
5. **Usa `auth.uid()`** en las policies para obtener el ID del usuario actual

---

## 📚 Referencias

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Triggers en PostgreSQL](https://www.postgresql.org/docs/current/triggers.html)
