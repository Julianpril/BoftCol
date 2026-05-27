# 5. Arquitectura del Sistema

## 5.1. Metodología CSS

Para el desarrollo del proyecto se aplicó la metodología de **Utility-First CSS** mediante el uso del framework **Tailwind CSS** (versión 4). 

Esta metodología permite construir interfaces directamente en el HTML/JSX empleando clases de utilidad predefinidas, lo cual asegura el encapsulamiento de estilos y evita los tradicionales problemas de especificidad y de sobreescritura ('side-effects') que suceden en CSS convencional. Además, en el archivo base (`index.css`) se integró un **Design System híbrido** basado en variables de CSS (`@theme`), lo que otorga un alto nivel de escalabilidad para manejar esquemas de colores (colores primarios, secundarios, superficies, etc.), garantizando que la estructura sea mantenible, fácil de refactorizar y totalmente coherente en todas las vistas de la aplicación.

## 5.2. Framework / Librería de Desarrollo

El proyecto emplea una arquitectura moderna dividida en un entorno Frontend y Backend, contenidos en un mismo repositorio (Monorepo).

*   **Frontend**: Desarrollado utilizando **React.js** (versión 19) como librería principal para la creación de interfaces de usuario junto con **Vite** para un empaquetado ultra rápido. Se complementa fuertemente con **React Router DOM** para la navegación.
*   **Backend**: Construido mediante **Node.js** utilizando el framework **Express.js** (versión 5) para la creación de la API REST, acoplado con **Prisma ORM** como herramienta de gestión e interacción con la base de datos (PostgreSQL).

## 5.3. Listado de Librerías

A continuación, se listan las principales dependencias estructurales utilizadas:

**Frontend** (Instaladas vía gestor de dependencias - npm/pnpm)
*   **React / React DOM**
    *   **Función/Propósito**: Librerías núcleo (Core) para la construcción de interfaces mediante componentes.
    *   **Integración**: Instalación por npm/yarn (`npm install react react-dom`).
*   **React Router DOM**
    *   **Función/Propósito**: Manejo del enrutamiento ("routing") desde el lado del cliente (SPA) para navegar entre pantallas como /checkout, /upload, /admin, etc.
    *   **Integración**: Instalación por npm/yarn.
*   **Tailwind CSS**
    *   **Función/Propósito**: Framework de CSS para aplicar estilos con clases utilitarias enfocadas en Responsive Design.
    *   **Integración**: Instalación por npm/yarn como plugin de Vite.

**Backend** (Instaladas vía gestor de dependencias - npm/pnpm)
*   **Express.js**
    *   **Función/Propósito**: Framework core de Node.js para levantar el servidor y gestionar el ciclo de vida de peticiones HTTP, rutas y middleware.
    *   **Integración**: Instalación por npm/yarn.
*   **Prisma (@prisma/client)**
    *   **Función/Propósito**: ORM (Object-Relational Mapping) para modelar y consultar la base de datos fuertemente tipada de manera interactiva.
    *   **Integración**: Instalación por npm/yarn.
*   **Multer**
    *   **Función/Propósito**: Middleware para Node.js destinado a capturar subidas de archivos (archivos e imágenes multiparte) realizadas por el cliente.
    *   **Integración**: Instalación por npm/yarn.
*   **Archiver**
    *   **Función/Propósito**: Empaquetar y comprimir múltiples fotografías subidas o generadas en un archivo `.zip`.
    *   **Integración**: Instalación por npm/yarn.
*   **Bcryptjs & JsonWebToken (JWT)**
    *   **Función/Propósito**: Cifrado seguro de contraseñas de administradores y generación de tokens de autenticación digital mediante JWT para validar accesos protegidos a la API.
    *   **Integración**: Instalación por npm/yarn.
*   **Googleapis**
    *   **Función/Propósito**: Software Development Kit (SDK) oficial de Google que interactúa y consume la API de integración con Drive/Google Cloud.
    *   **Integración**: Instalación por npm/yarn.
*   **OpenaAI**
    *   **Función/Propósito**: SDK oficial destinado a realizar llamadas a los modelos LLM de OpenAI directamente desde el backend para operaciones de soporte/chat.
    *   **Integración**: Instalación por npm/yarn.
*   **Nodemailer**
    *   **Función/Propósito**: Módulo para procesar y despachar envío seguro de correos electrónicos transaccionales a usuarios (Ej: E-mails comprobantes de la orden).
    *   **Integración**: Instalación por npm/yarn.

## 5.4. Listado de APIs

La solución se apoya en consumo de servicios y APIs tercerizadas para nutrir su funcionamiento, gestionadas predominantemente a nivel Backend.

*   **Google Drive API**
    *   **Función o propósito**: Permite consolidar almacenamiento remoto (Cloud Storage) organizado por carpetas. Se utiliza para guardar las altas volumetrías de fotografías enviadas por los clientes que realizan las órdenes y comprobantes de la operación.
    *   **Método de Conexión**: REST (Ejecutado con el Client OAuth2 Server-to-Server official `googleapis`).
*   **OpenAI API**
    *   **Función o propósito**: Integración de inteligencia artificial en funciones de soporte o analítica que brinda información dinámica según prompts predeterminados a los usuarios del sistema (en su Support Chat).
    *   **Método de Conexión**: REST.
*   *(Interna)* **API de Gateway de Pagos** (Ej. Nequi/PSE según lo contemplado en el ecosistema/código transaccional)
    *   **Función o propósito**: Generación y comprobación de pagos en línea, códigos QR y reconciliación transaccional.
    *   **Método de Conexión**: REST vía Backend Webhooks.

## 5.5. Modelo Cliente - Servidor

Para este proyecto se optó por un modelo altamente desacoplado entre Cliente y Servidor que dialoga por medio de una arquitectura RESTful.

*   **Frontend (Cliente)**: Desarrollado bajo la combinación robusta de **React + Tailwind CSS** encapsulado en un Single Page Application (SPA). El cliente asume exclusivamente responsabilidades sobre la interfaz visual, interacciones de usuario de carga (drag & drop, formularios de check-out) y navegación asíncrona.  
*   **Backend (Servidor)**: Construido en **Node.js con Express.js y acoplado a PostgreSQL (mediante Prisma)**. Es la capa de lógica de negocio, validación de reglas transaccionales de las fotografías, protección contra accesos indebidos (Middlewares de Autenticación de Administradores) e interacciones seguras a las API externas.

Ambos lados operan en un esquema **JSON-over-HTTP**, en el cual el Frontend construye y envía solicitudes de red (Requests en formato JSON) al Servidor (API endpoints, por ejemplo: subidas de fotografías al módulo `photoRoutes`, manejo de carritos en `orderRoutes` o generación de códigos en `printCodeRoutes`). El Servidor resuelve dichas acciones validando permisos, se comunica a la Base de Datos PostgreSQL o al entorno Cloud Drive, y responde el estado y la Data resultante al Cliente para que este actualice los estados visuales correspondientes.