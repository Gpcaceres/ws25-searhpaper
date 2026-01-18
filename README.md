# SearchPaper 🔬

Aplicación web para buscar y descargar artículos científicos usando la API de PLOS (Public Library of Science).

## 📋 Características

- 🔍 **Búsqueda avanzada** de artículos científicos
- 📄 **Paginación** de resultados
- 📥 **Descarga directa** de papers en PDF
- 👁️ **Visualización** de artículos completos
- 🎨 **Interfaz moderna** con Vue.js
- 📱 **Diseño responsivo**

## 🛠️ Tecnologías

### Backend
- Node.js
- Express.js
- Axios
- PLOS API

### Frontend
- Vue.js 3
- Axios
- CSS3

## 🚀 Instalación y Uso

### Opción 1: Usando Docker (Recomendado) 🐳

1. Asegúrate de tener Docker instalado

2. Construye e inicia los contenedores:
```bash
docker compose up --build -d
```

3. Accede a la aplicación:
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:3000`

**Comandos útiles:**
```bash
# Iniciar (construir e iniciar en segundo plano)
docker compose up --build -d

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend

# Ver estado de los contenedores
docker compose ps

# Detener los contenedores
docker compose down

# Reiniciar los servicios
docker compose restart

# Detener y eliminar todo (contenedores, redes, volúmenes)
docker compose down -v
```

### Opción 2: Instalación Local

#### Backend

1. Navega a la carpeta del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Inicia el servidor:
```bash
npm start
```

O en modo desarrollo:
```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

#### Frontend

1. Navega a la carpeta del frontend:
```bash
cd frontend
```

2. Abre `index.html` en tu navegador web

O usa un servidor local:
```bash
# Con Python
python -m http.server 8080

# Con Node.js (si tienes http-server instalado)
npx http-server -p 8080
```

Luego abre `http://localhost:8080` en tu navegador

## 📖 API Endpoints

### Buscar artículos
```
GET /api/search?q=término&page=1&rows=10
```

Parámetros:
- `q` (requerido): Término de búsqueda
- `page` (opcional): Número de página (default: 1)
- `rows` (opcional): Resultados por página (default: 10)

### Obtener artículo por DOI
```
GET /api/search/article/:doi
```

### Health Check
```
GET /api/health
```

## 💡 Ejemplos de Búsqueda

- `climate change`
- `machine learning`
- `covid-19`
- `artificial intelligence`
- `cancer research`

## 📁 Estructura del Proyecto

```
ws25-searhpaper/
├── backend/
│   ├── routes/
│   │   └── search.js
│   ├── services/
│   │   └── plosService.js
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── nginx.conf
│   ├── Dockerfile
│   ├── .dockerignore
│   └── README.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔧 Configuración

### Backend (.env)
```env
PORT=3000
PLOS_API_URL=https://api.plos.org/search
```

## 📝 Notas

- La API de PLOS es pública y no requiere autenticación
- Los artículos disponibles son de acceso abierto
- La descarga de PDFs se realiza directamente desde los servidores de PLOS

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📄 Licencia

MIT