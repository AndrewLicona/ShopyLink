FROM nginx:alpine

# Copy the configuration file to the container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 3200
EXPOSE 3200

CMD ["nginx", "-g", "daemon off;"]
