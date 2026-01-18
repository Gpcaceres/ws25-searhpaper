# Usar imagen de nginx para servir archivos estáticos
FROM nginx:alpine

# Copiar archivos del frontend al directorio de nginx
COPY index.html /usr/share/nginx/html/
COPY README.md /usr/share/nginx/html/

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto de nginx
CMD ["nginx", "-g", "daemon off;"]
