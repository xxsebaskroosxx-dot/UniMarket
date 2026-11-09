# UniMarket

Proyecto organizado como una única aplicación Angular con Supabase y Netlify.

## Estructura

- `angular/`: código fuente, dependencias, compilación y SQL de Supabase.
- `netlify.toml`: configuración de compilación y publicación en Netlify.

La aplicación antigua HTML estática y sus archivos duplicados fueron retirados para evitar que se publique una versión distinta de la aplicación real.

## Comandos

```bash
cd angular
npm install
npm start
```

Para configurar la base de datos, sigue [angular/supabase/README.md](./angular/supabase/README.md).
