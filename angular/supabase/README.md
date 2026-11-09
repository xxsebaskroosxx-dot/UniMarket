# Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Abre **SQL Editor**, pega y ejecuta [`schema.sql`](./schema.sql).
3. En **Project Settings → API**, copia la **Project URL** y la clave pública **anon/publishable** a `src/environments/environment.ts`.
4. En **Authentication → URL Configuration**, establece `https://unimarketucc.netlify.app` como **Site URL** y agrega `http://localhost:4200/**` y `https://unimarketucc.netlify.app/**` a los redirect URLs permitidos. El enlace de recuperación vuelve al origen desde el que se solicitó.
5. Publica el sitio de Netlify después de compilar Angular. La configuración de [`netlify.toml`](../../netlify.toml) usa `angular` como directorio base y publica `dist/angular/browser`.
5. Inicia la app con `npm start` y crea cuentas con correos distintos para probar conversaciones desde dos sesiones/navegadores.

La aplicación usa Supabase Auth para las cuentas, Postgres con Row Level Security para perfiles, publicaciones y mensajes, Storage para fotos, y Realtime para recibir mensajes. No pongas la clave `service_role` en el frontend. El archivo SQL está pensado para ejecutarse una vez en un proyecto nuevo.

Para una base ya creada, ejecuta `admin-role-migration.sql` en SQL Editor para habilitar los permisos de administración, incluida la eliminación de publicaciones de cualquier usuario. Cada perfil nuevo comienza como `user`; un administrador se designa manualmente desde el SQL Editor después de crear su cuenta:

```sql
update public.profiles set role = 'admin' where username = 'sebasadmin';
```
