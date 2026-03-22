# Usamos la imagen oficial de Nginx basada en Alpine Linux por ser más ligera
FROM nginx:alpine

# Copiamos todos los archivos de nuestra carpeta actual (CRM)
# a la carpeta desde la que Nginx sirve el contenido estático
COPY . /usr/share/nginx/html

# Exponemos el puerto 80 que es el estándar para HTTP
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]
