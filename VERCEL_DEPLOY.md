# Guía de Publicación en Vercel

Este proyecto está 100% configurado para desplegarse en **Vercel** con frontend estático de alto rendimiento (Vite/React) y funciones serverless (`/api`) para el motor narrativo de Gemini.

---

### Paso 1: Subir el proyecto a GitHub
1. Inicializa el repositorio si no lo has hecho:
   ```bash
   git add .
   git commit -m "Motor de ficción interactiva listo para Vercel"
   git push origin main
   ```

---

### Paso 2: Importar en Vercel
1. Ingresa a [vercel.com](https://vercel.com) e inicia sesión.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Selecciona tu repositorio de GitHub e impórtalo.
4. Vercel detectará automáticamente la configuración definida en `vercel.json`:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

---

### Paso 3: Configurar Variables de Entorno (Environment Variables)
En la sección **"Environment Variables"** antes de presionar Deploy (o en *Settings > Environment Variables*):

- **Nombre:** `GEMINI_API_KEY`
- **Valor:** Tu clave de API de Google Gemini (obtenida gratis en [Google AI Studio](https://aistudio.google.com/app/apikey)).

---

### Paso 4: Desplegar
- Haz clic en **"Deploy"**.
- En menos de un minuto tu aplicación estará en vivo con un dominio `.vercel.app`.

---

### Archivos de configuración incluidos:
- `vercel.json`: Reglas de compilación y enrutamiento SPA + Serverless Functions.
- `/api/story/generate.ts`: Endpoint serverless para procesar turnos de la historia.
- `/api/engine/status.ts`: Verificación de salud y estado del motor.
- `src/server/engine.ts`: Lógica compartida con cascada de modelos Gemini y reserva procedural.
