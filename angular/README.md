# UniMarket

Aplicación Angular del marketplace universitario UniMarket.

## Desarrollo local

```bash
npm install
npm start
```

Abre `http://localhost:4200/` en el navegador.

## Compilación y pruebas

```bash
npm run build
npm test -- --watch=false
```

## Supabase

La aplicación usa Supabase para autenticación, perfiles, publicaciones, imágenes, conversaciones y mensajes en tiempo real.

1. Abre `supabase/schema.sql` en el SQL Editor de Supabase y ejecútalo una vez.
2. Verifica que `src/environments/environment.ts` tenga la URL del proyecto y la clave pública `anon/publishable`.
3. En Authentication → URL Configuration configura como Site URL la URL de Netlify y agrega también `http://localhost:4200/**`.
4. Si necesitas permisos de administrador, ejecuta `supabase/admin-role-migration.sql` y asigna el rol desde el SQL Editor.

No uses ni publiques una clave `service_role` en el frontend.

## Netlify

La configuración está en `../netlify.toml`. Netlify usa esta carpeta como base, ejecuta `npm run build` y publica `dist/angular/browser`.
