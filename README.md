# Social Swingers

Red social con feed interactivo, construida con **Next.js 14 (App Router)**,
**Tailwind CSS**, **Supabase** (Auth, Postgres, Realtime, Storage).

## 1. Estructura de carpetas

```
social-swingers/
├── app/
│   ├── layout.tsx            # Layout raíz
│   ├── globals.css           # Estilos Tailwind
│   ├── page.tsx              # Redirige a /feed o /auth según sesión
│   ├── actions.ts            # Server Actions: crear post, reaccionar, comentar
│   ├── auth/
│   │   └── page.tsx          # Login / registro (Client Component)
│   └── feed/
│       └── page.tsx          # Página del feed (layout de 3 columnas)
├── components/
│   ├── Navbar.tsx             # Barra superior: búsqueda, notificaciones, perfil
│   ├── Sidebar.tsx            # Menú lateral de navegación
│   ├── Widgets.tsx            # Columna derecha: sugerencias de conexión
│   ├── Feed.tsx                # Server Component: consulta posts + reacciones + comentarios
│   ├── CreatePost.tsx          # Creador de publicaciones (texto + imagen)
│   ├── PostCard.tsx            # Tarjeta de publicación individual
│   ├── ReactionButton.tsx      # Menú emergente de reacciones
│   └── CommentBox.tsx          # Caja de comentarios integrada
├── utils/supabase/
│   ├── server.ts               # Cliente Supabase para Server Components/Actions
│   ├── client.ts                # Cliente Supabase para Client Components
│   └── middleware.ts            # Refresca la sesión en cada request
├── middleware.ts                # Middleware raíz de Next.js
├── supabase/schema.sql          # Script SQL completo (tablas, trigger, RLS, storage, realtime)
├── .env.local.example            # Variables de entorno necesarias
└── package.json
```

## 2. Puesta en marcha

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre el **SQL Editor** de Supabase y ejecuta el contenido de `supabase/schema.sql`.
   Esto crea las tablas (`profiles`, `posts`, `reactions`, `comments`, `friendships`),
   el trigger que crea automáticamente un `profile` al registrarse, las políticas
   de **Row Level Security**, los buckets de Storage (`avatars`, `posts-images`)
   y habilita Realtime sobre `posts`, `reactions` y `comments`.
3. Copia `.env.local.example` a `.env.local` y completa con la URL y la `anon key`
   de tu proyecto (Project Settings → API).
4. Instala dependencias y arranca el proyecto:

```bash
npm install
npm run dev
```

5. Visita `http://localhost:3000`. Sin sesión te llevará a `/auth`; tras
   registrarte/iniciar sesión, a `/feed`.

## 3. Notas de seguridad

- Toda la escritura en las tablas pasa por **RLS**: un usuario solo puede
  crear/editar/borrar sus propios posts, reacciones y comentarios.
- Las Server Actions (`app/actions.ts`) verifican `auth.getUser()` antes de
  cualquier escritura, como defensa adicional a nivel de aplicación.
- El middleware (`utils/supabase/middleware.ts`) refresca la sesión en cada
  petición y protege las rutas bajo `/feed`.

## 4. Extensiones sugeridas

- Suscripción Realtime en `Feed.tsx`/`ReactionButton.tsx` con
  `supabase.channel(...)` para reflejar nuevos posts/reacciones sin recargar.
- Página de perfil (`/profile/[username]`) reutilizando `profiles`.
- Sistema de solicitudes de amistad usando la tabla `friendships` ya creada.
