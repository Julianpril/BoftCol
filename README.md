# BOFT Colombia - Plataforma de Impresión de Fotos

![BOFT Banner](https://via.placeholder.com/1200x300?text=BOFT+Colombia+-+Impresion+Digital+Polaroid)

**BOFT Colombia** es una plataforma digital de impresión fotográfica (estilo polaroid) que permite a los clientes subir sus fotografías desde cualquier dispositivo, visualizar y ajustar su pedido, y solicitar el envío a nivel nacional pagando mediante Nequi o transferencia bancaria.

Este proyecto fue desarrollado como parte de la entrega final del **Taller de Diseño Multimedia** por el equipo **Debug Squad**.

## Equipo (Debug Squad)
- **Karen Yulieth Amaya Rodríguez** - Product Owner
- **Andres Santiago Ferrucho Espitia** - Scrum Master
- **Julian Abril Herrera** - Desarrollador FullStack
- **Laura Estefany Rivera Perez** - Desarrolladora y QA

---

## Enlaces Importantes del Proyecto (Revisar Evaluación)

Para facilitar la calificación de los entregables del examen final, a continuación se listan los recursos principales:

- **Despliegue en Vivo (Frontend):** [https://boft-col-client.vercel.app](https://boft-col-client.vercel.app)
- **Despliegue de la API (Backend):** 
- **Wireframes (Baja, Media y Alta Fidelidad):** [Haz clic aquí para ver el figma de los Wireframes](https://www.figma.com/design/ZehCHx0h3EYYR1QkaKUJpF/boftCol?node-id=0-1&t=5UWwiRuAmxDfFIDt-1)
- **Informe Final:** [Haz clic aquí para ver el Informe Final](./Informe_Final_BOFT_DebugSquad.docx)

---

## Stack Tecnológico

El proyecto utiliza una arquitectura **Monorepo** moderna, separando el cliente del servidor.

### Frontend (Aplicación React)
- **React 19 + Vite**: Librería principal y empaquetador para una Single Page Application (SPA) ultra rápida.
- **Tailwind CSS 4**: Implementación de la metodología **Atomic CSS (Atomic Design)** para un sistema de diseño escalable y modo oscuro.
- **React Router DOM**: Para el manejo de rutas del lado del cliente.

### Backend (API REST)
- **Node.js + Express 5**: Servidor robusto para el manejo de rutas y lógica de negocio.
- **PostgreSQL + Prisma ORM**: Base de datos relacional con tipado estricto.
- **Multer & Archiver**: Para la recepción y compresión masiva (ZIP) de fotografías.
- **Bcryptjs & JWT**: Para la encriptación de contraseñas y autenticación del panel de administrador.
- **Integraciones IA & Nube**: OpenAI API (Soporte) y Google Drive API (Almacenamiento).

---

## Instrucciones para Correr el Proyecto Localmente

Para descargar, instalar y ejecutar el proyecto en tu máquina local, sigue estos pasos al pie de la letra:

### 1. Requisitos Previos
Asegúrate de tener instalado en tu computadora:
- [Node.js](https://nodejs.org/es/) (Versión 18 o superior).
- `npm` o `pnpm` (El gestor de paquetes de tu preferencia).
- PostgreSQL (opcional localmente, pero recomendado si quieres levantar la base de datos tú mismo).

### 2. Clonar el Repositorio
Abre tu terminal y ejecuta:
```bash
git clone https://github.com/Julianpril/BoftCol.git
cd boftCol
```

### 3. Instalar Dependencias
Al ser un monorepo, puedes instalar todas las dependencias (tanto de cliente como servidor) desde la raíz:
```bash
npm install
# o pnpm: pnpm install
```

### 4. Configurar Variables de Entorno (.env)
Debes configurar las variables de entorno en el Backend. Dirígete a la carpeta del servidor:
```bash
cd apps/server
```
Crea un archivo llamado `.env` basándote en el archivo de ejemplo (si existe) y agrega tus credenciales:
```env
# Ejemplo de variables requeridas
PORT=3000
DATABASE_URL="postgresql://usuario:password@localhost:5432/boft"
JWT_SECRET="tu_secreto_seguro"
OPENAI_API_KEY="tu_api_key_de_openai"
```

### 5. Configurar la Base de Datos
Desde la misma carpeta del servidor (`apps/server`), inicializa Prisma y aplica las migraciones:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Ejecutar el Proyecto
Vuelve a la raíz del proyecto y ejecuta el comando de inicio en paralelo para encender tanto el Frontend como el Backend:
```bash
cd ../../
npm run dev
```

- El **Frontend** estará disponible en: `http://localhost:5173`
- El **Backend** (API) estará escuchando en: `http://localhost:3000`

---

## Características Principales y Usabilidad
1. **Flujo de Checkout y Subida de Fotos:** Sistema drag-and-drop rápido con vista previa tipo Polaroid.
2. **Identidad y Accesibilidad:** Contraste superior a 4.5:1 (WCAG AA) para lectura cómoda, diseño Dark Mode corporativo y estructura 100% navegable con teclado.
3. **Panel Administrativo (Dashboard):** Vista protegida por login para que el negocio apruebe los pagos Nequi y descargue directamente un `.zip` con el pedido listo para imprimir.
4. **Soporte IA (Human Takeover):** Chatbot entrenado con los datos del negocio, con capacidad de pasar a un agente humano en tiempo real.

---
Hecho por Debug Squad para el Taller de Diseño Multimedia.
