# Extra beställning

Formulario web para rellenar el pedido "Extra beställning", recoger la firma del responsable,
generar el PDF y guardarlo en Google Drive + registrar el pedido en Google Sheets.

- `index.html` + `config.js`: la web (se publica con GitHub Pages)
- `apps-script/Code.gs`: API en Google Apps Script (guarda PDF en Drive y fila en Sheets)

## Instalación

### 1. Google Sheets + Apps Script
1. Crea una hoja de Google Sheets. **Extensiones → Apps Script**.
2. Pega `apps-script/Code.gs` en `Código.gs`.
3. **Configuración del proyecto (engranaje) → Propiedades del script → Añadir** dos propiedades:
   - `ADMIN_CODE`: tu código de administrador (ve todos los PDF y gestiona usuarios).
   - `USER_CODE`: el código que darás a cada persona para que se cree su usuario.
4. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: *Yo*. Quién tiene acceso: *Cualquier persona*.
5. Acepta los permisos y copia la URL que termina en `/exec`.

### 2. GitHub Pages
1. Pega la URL en `config.js` (`APPS_SCRIPT_URL`).
2. Sube el repositorio a GitHub.
3. **Settings → Pages → Branch: main, carpeta / (root) → Save**.
4. El enlace queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Usuarios y permisos
- **Administrador:** en la pestaña *Administrador* escribe `ADMIN_CODE`. Ve los PDF de todos, el botón *Usuarios* y el enlace a la carpeta de Drive.
- **Usuarios:** en la pestaña *Crear usuario* cada persona escribe el código de usuarios (`USER_CODE`), su nombre, un usuario y una contraseña. Después entra con usuario y contraseña. Solo ve sus propios PDF.
- Las contraseñas se guardan cifradas (hash con sal) en la hoja **Usuarios**, nunca en claro.
- Tras 5 intentos fallidos se bloquea el acceso 10 minutos.
- Si alguien olvida su contraseña: el administrador lo elimina en *Usuarios* y la persona se registra de nuevo con el mismo nombre de usuario (recupera sus PDF).
- Los pedidos anteriores a esta versión no tienen propietario: solo los ve el administrador.
- Si cambias `USER_CODE` o `ADMIN_CODE`, las sesiones abiertas siguen válidas hasta caducar (30 días usuarios, 12 horas administrador). Los usuarios existentes no se ven afectados.

## Dónde están los PDF
- **Desde la app:** botón **PDF guardados** (arriba). Lista los últimos 300 pedidos (los tuyos; el administrador ve todos), con buscador por nombre, habitación o fecha. Pulsa **Abrir** para ver el PDF. No hace falta tener acceso a la carpeta de Drive.
- Carpeta de Drive **Extra beställningar (PDF)** (la crea el script la primera vez, en el Drive de quien lo implementó).
- Nombre de archivo: **iniciales + fecha + hora**, por ejemplo `JCP_2026-10-20_2115.pdf`.
- La hoja de Sheets tiene una columna **PDF** con el enlace directo de cada pedido.
- Para que otras personas vean la carpeta, compártela desde Drive (Compartir → añadir personas).
- La app muestra el enlace "Abrir carpeta de PDFs" tras el primer guardado. Opcional: pegar el enlace en `FOLDER_URL` de `config.js`.

## Actualizar
- **La web** (`index.html`, `config.js`): edita en GitHub o haz `git push`. Pages se actualiza en ~1 minuto.
- **El servidor** (`Code.gs`): pega el nuevo código en Apps Script y ve a
  **Implementar → Administrar implementaciones → lápiz → Versión: Nueva versión → Implementar**.
  La URL no cambia.

## Versión y actualización automática
- La versión de la app y la del servidor aparecen en el pie del menú lateral (`App v1.8.0 · Server v1.7.0`).
- La app comprueba sola si hay una versión nueva: al abrirla, al volver a ella desde otra app y cada 5 minutos. Si la hay y no estás en medio de un pedido, se recarga sola. Si estás escribiendo, muestra un aviso con el botón **Actualizar**.
- El pie tiene el enlace **Buscar actualización** para comprobarlo a mano.
- Si la versión del servidor (`Code.gs`) no coincide con la que necesita la app, el pie del menú se pone en rojo y el administrador ve un aviso.
- Al hacer cambios: sube `APP_VERSION` (y `EXPECTED_SERVER`) en `index.html`, y `SERVER_VERSION` en `Code.gs` si cambia el servidor.

## Menú lateral, logo e instalación como app
- La app abre con una pantalla con el logo de ISS y sigue al inicio de sesión (una vez por sesión). Se adapta a móvil, tablet y escritorio; en móvil el menú lateral se abre con el botón de las tres rayas.
- Es una PWA: en Android y Chrome de escritorio aparece **Instalar app** en el menú; en iPhone/iPad: Compartir → **Añadir a pantalla de inicio**. El icono es el logo de ISS.
- Archivos que deben subirse juntos: `index.html`, `config.js`, `manifest.webmanifest`, `sw.js` y la carpeta `assets/` (logo e iconos). El logo también sale arriba a la derecha del PDF.
- El color azul marino (#0D132D) sale del logo. Comprueba con ISS que se puede usar su logo.

## Privacidad
Los PDF y la hoja contienen datos personales. No subas PDF ni exportaciones de la hoja al repositorio.
Los códigos (`ADMIN_CODE`, `USER_CODE`) viven solo en las propiedades del script, nunca en GitHub.
