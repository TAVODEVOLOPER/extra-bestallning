# Extra beställning

Formulario web para rellenar el pedido "Extra beställning", recoger la firma del responsable,
generar el PDF y guardarlo en Google Drive + registrar el pedido en Google Sheets.

- `index.html` + `config.js`: la web (se publica con GitHub Pages)
- `apps-script/Code.gs`: API en Google Apps Script (guarda PDF en Drive y fila en Sheets)

## Instalación

### 1. Google Sheets + Apps Script
1. Crea una hoja de Google Sheets. **Extensiones → Apps Script**.
2. Pega `apps-script/Code.gs` en `Código.gs`.
3. **Configuración del proyecto (engranaje) → Propiedades del script → Añadir**: nombre `PIN`, valor = el código que usarás en la web.
4. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: *Yo*. Quién tiene acceso: *Cualquier persona*.
5. Acepta los permisos y copia la URL que termina en `/exec`.

### 2. GitHub Pages
1. Pega la URL en `config.js` (`APPS_SCRIPT_URL`).
2. Sube el repositorio a GitHub.
3. **Settings → Pages → Branch: main, carpeta / (root) → Save**.
4. El enlace queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Actualizar
- **La web** (`index.html`, `config.js`): edita en GitHub o haz `git push`. Pages se actualiza en ~1 minuto.
- **El servidor** (`Code.gs`): pega el nuevo código en Apps Script y ve a
  **Implementar → Administrar implementaciones → lápiz → Versión: Nueva versión → Implementar**.
  La URL no cambia.

## Privacidad
Los PDF y la hoja contienen datos personales. No subas PDF ni exportaciones de la hoja al repositorio.
El código de acceso (`PIN`) vive solo en las propiedades del script, nunca en GitHub.
