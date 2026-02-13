# Diagrama de la Base de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE AUTH                           │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │           auth.users (Gestionada por Supabase)      │   │
│  │                                                      │   │
│  │  • id (uuid) PK                                     │   │
│  │  • email                                            │   │
│  │  • encrypted_password (bcrypt)                      │   │
│  │  • email_confirmed_at                               │   │
│  │  • created_at, updated_at                           │   │
│  │  • raw_user_meta_data                               │   │
│  │  • role (authenticated, anon, etc.)                 │   │
│  └───────────────────┬────────────────────────────────┘   │
└────────────────────────┼──────────────────────────────────┘
                         │
                         │ FK (id)
                         │ ON DELETE CASCADE
                         ▼
        ┌────────────────────────────────────┐
        │      public.profiles               │
        │                                    │
        │  • id (uuid) PK ───────────────┐  │
        │  • email (unique)               │  │
        │  • full_name                    │  │
        │  • avatar_url                   │  │
        │  • created_at                   │  │
        │  • updated_at                   │  │
        └─────────────────────────────────┘  │
                         │                    │
                         │                    │
                         │ FK (user_id)       │
                         │ ON DELETE CASCADE  │
                         ▼                    │
        ┌────────────────────────────────────┐│
        │    public.conversations            ││
        │                                    ││
        │  • id (uuid) PK                   ││
        │  • user_id (uuid) FK ──────────────┘
        │  • title                            │
        │  • created_at                       │
        │  • updated_at (auto trigger)        │
        └───────┬────────────┬────────────────┘
                │            │
                │            │
    ┌───────────┘            └───────────────┐
    │                                        │
    │ FK (conversation_id)                   │ FK (conversation_id)
    │ ON DELETE CASCADE                      │ ON DELETE CASCADE
    ▼                                        ▼
┌─────────────────────────┐      ┌──────────────────────────┐
│   public.messages       │      │   public.tts_audios      │
│                         │      │                          │
│  • id (uuid) PK         │      │  • id (uuid) PK          │
│  • conversation_id FK   │      │  • conversation_id FK    │
│  • role (user/assistant)│      │  • text                  │
│  • content (jsonb)      │      │  • audio_url             │
│  • tool_used (boolean)  │      │  • timestamp_ms          │
│  • created_at           │      │  • voice_id              │
└─────────────────────────┘      │  • voice_name            │
                                 │  • created_at            │
                                 └──────────────────────────┘
```

## 🔐 Seguridad (Row Level Security)

```
┌─────────────────────────────────────────────────────────────┐
│  RLS habilitado en todas las tablas                         │
│                                                             │
│  👤 Usuario A                      👤 Usuario B            │
│     ↓                                  ↓                    │
│  ┌──────────┐                     ┌──────────┐            │
│  │ Profile A│                     │ Profile B│            │
│  │ Conv 1, 2│                     │ Conv 3, 4│            │
│  └──────────┘                     └──────────┘            │
│       ↓                                ↓                    │
│  [Solo ve sus                    [Solo ve sus              │
│   propias conversaciones]         propias conversaciones]  │
│                                                             │
│  🚫 Usuario A NO puede ver datos de Usuario B              │
│  ✅ Cada usuario está completamente aislado                │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Creación de Usuario

```
1. Usuario se registra en AuthScreen
          ↓
2. Supabase crea registro en auth.users
   - Encripta password automáticamente
   - Genera UUID único
   - Guarda email
          ↓
3. Trigger 'on_auth_user_created' se ejecuta
          ↓
4. Se crea automáticamente el perfil en public.profiles
   - Copia id y email desde auth.users
   - Inicializa created_at, updated_at
          ↓
5. Usuario puede iniciar sesión
          ↓
6. Se obtiene JWT token de sesión
          ↓
7. Frontend puede acceder a:
   - profiles (su propio perfil)
   - conversations (sus conversaciones)
   - messages (sus mensajes)
   - tts_audios (sus audios)
```

## 📊 Ejemplo de Datos

```
auth.users (id: abc-123)
   └── email: "juan@example.com"
   └── encrypted_password: "$2a$10$..." 
          ↓
public.profiles (id: abc-123)
   └── email: "juan@example.com"
   └── full_name: "Juan Pérez"
          ↓
public.conversations (id: conv-1, user_id: abc-123)
   └── title: "Consulta sobre IA"
          ↓
          ├── public.messages (conversation_id: conv-1)
          │      ├── role: "user", content: "¿Qué es ML?"
          │      └── role: "assistant", content: "Machine Learning es..."
          │
          └── public.tts_audios (conversation_id: conv-1)
                 └── text: "Machine Learning es...", audio_url: "data:audio/..."
```

## 🎯 Índices para Rendimiento

```
conversations:
  ├── conversations_user_id_idx (user_id)
  └── conversations_updated_at_idx (updated_at DESC)
       → Búsqueda rápida: "Dame las 10 conversaciones más recientes"

messages:
  ├── messages_conversation_id_idx (conversation_id)
  └── messages_created_at_idx (created_at)
       → Búsqueda rápida: "Dame todos los mensajes de esta conversación"

tts_audios:
  ├── tts_audios_conversation_id_idx (conversation_id)
  └── tts_audios_created_at_idx (created_at)
       → Búsqueda rápida: "Dame todos los audios de esta conversación"

profiles:
  └── profiles_email_idx (email)
       → Búsqueda rápida por email
```

## ⚙️ Triggers Automáticos

```
┌────────────────────────────────────────┐
│  INSERT/UPDATE en auth.users           │
└──────────────┬─────────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  handle_new_user()       │
    │  Sincroniza con profiles │
    └──────────────────────────┘

┌────────────────────────────────────────┐
│  UPDATE en conversations               │
└──────────────┬─────────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │  touch_updated_at()      │
    │  Actualiza updated_at    │
    └──────────────────────────┘

┌────────────────────────────────────────┐
│  UPDATE en profiles                    │
└──────────────┬─────────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ touch_profile_updated_at()│
    │  Actualiza updated_at     │
    └──────────────────────────┘
```

## 🚀 Performance Tips

1. **Usa índices:** Ya están creados para las consultas más comunes
2. **Limita resultados:** Usa `LIMIT` en queries grandes
3. **Ordena eficientemente:** Usa los índices DESC donde sea posible
4. **Cache en frontend:** El hook `useConversations` ya implementa cache local
5. **Batch inserts:** Usa `upsert` con arrays para múltiples inserts

## 📝 Notas Importantes

- **auth.users es de solo lectura** desde el frontend (gestionada por Supabase Auth)
- **Nunca accedas a encrypted_password** - es inaccesible por seguridad
- **RLS protege todos los datos** - imposible acceder a datos de otros usuarios
- **Los triggers son automáticos** - no requieren código frontend
- **CASCADE elimina todo** - al borrar un usuario se eliminan todas sus conversaciones, mensajes y audios
