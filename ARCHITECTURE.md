# 📚 Arquitectura del Proyecto SearchPaper

## 🏗️ Estructura General

Este proyecto es una aplicación web para buscar papers científicos usando la API de PLOS. Está construido con una arquitectura **Cliente-Servidor** usando **Docker** para la contenerización.

```
┌─────────────┐      HTTP      ┌─────────────┐      HTTPS     ┌─────────────┐
│  Frontend   │ ───────────────> │   Server   │ ─────────────> │  PLOS API   │
│   (Nginx)   │                 │  (Node.js)  │                │  (Externa)  │
│   Vue.js    │ <─────────────── │  Express    │ <────────────── │             │
└─────────────┘      JSON       └─────────────┘      JSON      └─────────────┘
   Puerto 8080                      Puerto 3000
```

---

## 🎯 BACKEND - Arquitectura MVC (Modelo-Vista-Controlador)

### 📂 Estructura de Archivos Backend

```
backend/
├── server.js              # Servidor principal Express
├── routes/
│   └── search.js          # CONTROLADOR - Endpoints HTTP
├── services/
│   └── plosService.js     # MODELO - Lógica de negocio y API externa
├── package.json           # Dependencias del proyecto
└── Dockerfile             # Configuración de contenedor
```

---

### 🎮 **CONTROLADOR** - `routes/search.js`

El controlador maneja las **peticiones HTTP** y orquesta las respuestas.

#### **Endpoints Disponibles:**

#### 1️⃣ `GET /api/search`
**Búsqueda de papers científicos**

**Parámetros de Query:**
- `q` (requerido): Término de búsqueda
- `page` (opcional): Número de página (default: 1)
- `rows` (opcional): Resultados por página (default: 10)

**Ejemplo:**
```
GET /api/search?q=cancer&page=1&rows=10
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "query": "cancer",
  "totalResults": 45000,
  "page": 1,
  "rowsPerPage": 10,
  "totalPages": 4500,
  "papers": [...]
}
```

**Respuesta de error (400):**
```json
{
  "error": "Search query is required",
  "message": "Please provide a search term using the 'q' parameter"
}
```

#### 2️⃣ `GET /api/search/article/:doi`
**Obtener detalles de un artículo específico**

**Parámetros de URL:**
- `doi`: DOI del artículo (puede contener barras)

**Ejemplo:**
```
GET /api/search/article/10.1371/journal.pone.0123456
```

**Responsabilidades del Controlador:**
- ✅ Validar parámetros de entrada
- ✅ Manejar errores HTTP (400, 500)
- ✅ Delegar lógica al servicio
- ✅ Formatear respuestas JSON

---

### 📊 **MODELO** - `services/plosService.js`

El servicio es la **capa de acceso a datos** que interactúa con la API externa de PLOS.

#### **Funciones Principales:**

#### 1️⃣ `searchPapers(query, page, rows)`

**Responsabilidades:**
- Construir parámetros para PLOS API
- Calcular paginación (`start = (page - 1) * rows`)
- Realizar petición HTTP con Axios
- Transformar datos de respuesta
- Enriquecer con URLs de descarga y visualización

**Campos solicitados a PLOS API:**
```javascript
fl: 'id,title,author,abstract,publication_date,journal,article_type,score'
```

**Transformación de datos:**
```javascript
papers: data.docs.map(doc => ({
  id: doc.id,
  doi: doc.id,
  title: doc.title,
  authors: doc.author || [],
  abstract: doc.abstract ? doc.abstract[0] : '',
  publicationDate: doc.publication_date,
  journal: doc.journal,
  articleType: doc.article_type,
  score: doc.score,
  downloadUrl: `https://journals.plos.org/plosone/article/file?id=${doc.id}&type=printable`,
  viewUrl: `https://journals.plos.org/plosone/article?id=${doc.id}`
}))
```

#### 2️⃣ `getArticleByDoi(doi)`

**Responsabilidades:**
- Buscar artículo específico usando DOI
- Validar existencia del artículo
- Retornar detalles completos

**Responsabilidades del Modelo:**
- ✅ Comunicación con API externa (PLOS)
- ✅ Transformación y mapeo de datos
- ✅ Cálculos de paginación
- ✅ Enriquecimiento de datos
- ✅ Manejo de errores de API

---

### 🔄 Flujo de Datos en Backend

```
1. Cliente hace petición HTTP
         ↓
2. server.js recibe la petición
         ↓
3. Middleware (CORS, JSON parsing)
         ↓
4. Router (/api/search) → search.js (CONTROLADOR)
         ↓
5. Validación de parámetros
         ↓
6. plosService.js (MODELO) → Llamada a PLOS API
         ↓
7. Transformación de datos
         ↓
8. Respuesta JSON al cliente
```

---

## 🎨 FRONTEND - Aplicación Vue.js

### 📂 Estructura de Archivos Frontend

```
frontend/
├── index.html           # Página principal HTML
├── css/
│   └── style.css        # Estilos CSS
├── js/
│   └── app.js           # Lógica de la aplicación Vue.js
├── nginx.conf           # Configuración del servidor Nginx
└── Dockerfile           # Configuración de contenedor
```

---

### 🔌 **LLAMADAS AL BACKEND** - `js/app.js`

El frontend usa **Axios** para consumir el backend.

#### **Configuración de la URL:**

```javascript
data() {
    return {
        apiUrl: '/api/search'  // Ruta relativa (Nginx hace proxy)
    }
}
```

#### **Método de Búsqueda:**

```javascript
async fetchResults() {
    this.loading = true;
    this.error = null;
    
    try {
        // 🔥 LLAMADA AL BACKEND
        const response = await axios.get(this.apiUrl, {
            params: {
                q: this.searchQuery,      // Término de búsqueda
                page: this.currentPage,   // Página actual
                rows: this.rowsPerPage    // Resultados por página
            }
        });
        
        this.results = response.data;
        this.sortResults();
    } catch (err) {
        this.error = err.response?.data?.message || 
                     'Error searching articles. Make sure the server is running.';
        console.error('Search error:', err);
    } finally {
        this.loading = false;
    }
}
```

#### **¿Cómo funciona el llamado?**

1. **Usuario escribe "cancer" y presiona buscar**
2. **Frontend hace:** `GET /api/search?q=cancer&page=1&rows=10`
3. **Nginx (frontend) redirige** la petición a `http://backend:3000/api/search?q=cancer&page=1&rows=10`
4. **Backend procesa** y retorna JSON
5. **Frontend recibe datos** y actualiza la interfaz

---

### 🔀 Nginx como Proxy Reverso

El archivo `nginx.conf` configura Nginx para:

1. **Servir archivos estáticos** (HTML, CSS, JS)
2. **Hacer proxy** de `/api/*` al backend

```nginx
# Proxy para el API del backend
location /api/ {
    proxy_pass http://backend:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

**Ventajas:**
- ✅ El frontend no necesita conocer la IP del backend
- ✅ Evita problemas de CORS
- ✅ Centraliza las peticiones HTTP

---

## 🐳 DOCKER - Arquitectura de Contenedores

### 📦 Contenedores

El proyecto usa **2 contenedores Docker** que se comunican a través de una red privada.

```
┌────────────────────────────────────────────────────────┐
│              Red Docker (searchpaper-network)          │
│                                                        │
│  ┌──────────────────────┐    ┌──────────────────────┐│
│  │  searchpaper-backend │    │ searchpaper-frontend ││
│  │   (Node.js/Express)  │◄───┤    (Nginx/Vue.js)   ││
│  │                      │    │                      ││
│  │  Puerto Interno:     │    │  Puerto Interno:     ││
│  │       3000           │    │       80             ││
│  └──────────────────────┘    └──────────────────────┘│
│           │                            │              │
└───────────│────────────────────────────│──────────────┘
            │                            │
      [Host:3000]                  [Host:8080]
```

---

### 🛠️ `docker-compose.yml`

Archivo maestro que orquesta los contenedores.

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: searchpaper-backend
    restart: unless-stopped
    ports:
      - "3000:3000"  # Host:Contenedor
    environment:
      - NODE_ENV=production
      - PORT=3000
      - PLOS_API_URL=https://api.plos.org/search
    volumes:
      - ./backend:/app        # Sincroniza código
      - /app/node_modules     # Protege node_modules
    command: npm start
    networks:
      - searchpaper-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: searchpaper-frontend
    restart: unless-stopped
    ports:
      - "8080:80"  # Host:Contenedor
    depends_on:
      - backend  # Se inicia después del backend
    networks:
      - searchpaper-network

networks:
  searchpaper-network:
    driver: bridge  # Red privada entre contenedores
```

#### **Características Clave:**

- **`ports`**: Mapea puertos del host a contenedor
- **`volumes`**: Sincroniza código en desarrollo (hot-reload)
- **`networks`**: Red privada para comunicación inter-contenedor
- **`depends_on`**: Define orden de inicio
- **`restart: unless-stopped`**: Auto-reinicio en caso de fallo

---

### 📦 `backend/Dockerfile`

Contenedor para el servidor Node.js:

```dockerfile
# Imagen base ligera de Node.js
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar solo package.json primero (cache de Docker)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Puerto que expone el contenedor
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["npm", "start"]
```

#### **Optimizaciones:**
- ✅ Usa `node:18-alpine` (imagen ligera de 40MB vs 900MB)
- ✅ Copia `package.json` primero para aprovechar cache de Docker
- ✅ Solo instala dependencias de producción

---

### 📦 `frontend/Dockerfile`

Contenedor para Nginx sirviendo archivos estáticos:

```dockerfile
# Imagen base de Nginx (ligera)
FROM nginx:alpine

# Copiar archivos estáticos al directorio de Nginx
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Puerto expuesto
EXPOSE 80

# Comando por defecto (Nginx en primer plano)
CMD ["nginx", "-g", "daemon off;"]
```

#### **¿Por qué Nginx?**
- ✅ Servidor web altamente eficiente
- ✅ Maneja miles de conexiones concurrentes
- ✅ Sirve archivos estáticos con cache
- ✅ Actúa como proxy reverso al backend

---

### 🚀 Comandos Docker

#### **Iniciar todos los servicios:**
```bash
docker-compose up -d
```

#### **Ver logs:**
```bash
docker-compose logs -f
```

#### **Detener servicios:**
```bash
docker-compose down
```

#### **Reconstruir contenedores:**
```bash
docker-compose up -d --build
```

#### **Ver contenedores activos:**
```bash
docker ps
```

---

## 🔒 Comunicación Entre Contenedores

### Resolución DNS Interna

Docker Compose crea una **red privada** donde los contenedores se comunican usando **nombres de servicio** como hostnames.

```javascript
// En nginx.conf
proxy_pass http://backend:3000/api/;
//                ↑
//         Nombre del servicio en docker-compose.yml
```

Docker resuelve `backend` a la IP interna del contenedor backend (ej: `172.18.0.2:3000`).

---

## 📊 Flujo Completo de una Búsqueda

```
1. Usuario visita: http://localhost:8080/papersearch
         ↓
2. Nginx sirve index.html, CSS, JS (Vue.js)
         ↓
3. Usuario escribe "cancer" y presiona buscar
         ↓
4. Vue.js hace: axios.get('/api/search?q=cancer')
         ↓
5. Nginx intercepta /api/* y redirige a http://backend:3000/api/search?q=cancer
         ↓
6. Express (backend) recibe petición → Controlador (search.js)
         ↓
7. Controlador llama plosService.searchPapers('cancer', 1, 10)
         ↓
8. plosService hace petición HTTPS a https://api.plos.org/search
         ↓
9. PLOS API retorna JSON con papers
         ↓
10. plosService transforma datos (añade URLs, mapea campos)
         ↓
11. Controlador retorna JSON a Nginx
         ↓
12. Nginx retorna JSON al navegador
         ↓
13. Vue.js actualiza la interfaz con los resultados
```

---

## 🔧 Tecnologías Utilizadas

### Backend
- **Node.js 18**: Runtime de JavaScript
- **Express**: Framework web minimalista
- **Axios**: Cliente HTTP para peticiones a PLOS API
- **dotenv**: Gestión de variables de entorno
- **CORS**: Middleware para permitir peticiones cross-origin

### Frontend
- **Vue.js 3**: Framework progresivo de JavaScript
- **Axios**: Cliente HTTP para peticiones al backend
- **Nginx**: Servidor web y proxy reverso

### DevOps
- **Docker**: Contenerización de aplicaciones
- **Docker Compose**: Orquestación multi-contenedor

---

## 🌐 Puertos y URLs

### Entorno de Producción
| Servicio | Puerto | URL de Acceso |
|----------|--------|---------------|
| Frontend | 8080   | http://35.222.67.75:8080/papersearch |
| Backend  | 3000   | http://35.222.67.75:3000/api/health |
| Backend API | 3000 | http://35.222.67.75:3000/api/search |

### Entorno Local (Desarrollo)
| Servicio | Puerto Host | Puerto Contenedor | URL de Acceso |
|----------|-------------|-------------------|---------------|
| Frontend | 8080        | 80                | http://localhost:8080/papersearch |
| Backend  | 3000        | 3000              | http://localhost:3000/api/health |
| Backend API | 3000     | 3000              | http://localhost:3000/api/search |

---

## 📝 Variables de Entorno

### Backend `.env` (opcional)
```env
NODE_ENV=production
PORT=3000
PLOS_API_URL=https://api.plos.org/search
```

## 🌍 Configuración de Producción

### Servidor Actual
- **IP Pública**: `35.222.67.75`
- **Frontend**: http://35.222.67.75:8080/papersearch
- **Backend API**: http://35.222.67.75:3000/api/search
- **Health Check**: http://35.222.67.75:3000/api/health

### Requisitos para Producción
1. Asegurar que los puertos 3000 y 8080 estén abiertos en el firewall
2. Docker y Docker Compose instalados
3. Ejecutar: `docker-compose up -d`
4. Verificar logs: `docker-compose logs -f`

### Consideraciones de Seguridad
- ⚠️ Considerar usar HTTPS en producción
- ⚠️ Implementar rate limiting en el backend
- ⚠️ Configurar firewall para restringir acceso si es necesario
- ⚠️ Usar variables de entorno para configuración sensible

---

## ✅ Ventajas de esta Arquitectura

1. **Escalabilidad**: Cada servicio puede escalar independientemente
2. **Mantenibilidad**: Separación clara de responsabilidades
3. **Portabilidad**: Docker permite ejecutar en cualquier entorno
4. **Desarrollo**: Hot-reload con volúmenes Docker
5. **Seguridad**: Red privada entre contenedores
6. **Performance**: Nginx optimizado para servir archivos estáticos

---

## 🐛 Endpoints de Debugging

### Backend Health Check
```
GET http://localhost:3000/api/health
```

**Respuesta:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## 📖 Referencias

- **PLOS API**: https://api.plos.org/solr/examples/
- **Express.js**: https://expressjs.com/
- **Vue.js 3**: https://vuejs.org/
- **Docker Compose**: https://docs.docker.com/compose/
- **Nginx**: https://nginx.org/en/docs/
