# Docker Deployment Guide

This guide will help you deploy the Google Account Manager application using Docker. Whether you're new to Docker or an experienced user, we'll get you up and running quickly.

## Prerequisites

Before you begin, make sure you have these installed:

- **Docker**: Version 20.10 or higher ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.0 or higher (usually included with Docker Desktop)

To verify your installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

The fastest way to get the application running is with Docker Compose:

```bash
# Build and start the application
docker-compose up -d

# Check if it's running
docker-compose ps
```

That's it! The application should now be accessible at `http://localhost:8002`.

## Building the Image

If you prefer to build the Docker image manually:

```bash
docker build -t google-manager .
```

This will:
1. Build the React frontend using Vite
2. Install Python dependencies
3. Package everything into a single optimized image

The build process uses multi-stage builds to keep the final image size small by excluding development dependencies.

## Running the Container

### Using Docker Compose (Recommended)

Docker Compose makes it easy to manage the application and its configuration:

```bash
# Start in the background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Using Docker CLI

If you prefer to use Docker directly:

```bash
# Run the container
docker run -d \
  --name google-manager \
  -p 8002:8002 \
  -v $(pwd)/instance:/app/instance \
  google-manager

# View logs
docker logs -f google-manager

# Stop the container
docker stop google-manager
docker rm google-manager
```

## Configuration

### Environment Variables

You can customize the application behavior using environment variables. Create a `.env` file in the project root:

```env
FLASK_ENV=production
DATABASE_URL=sqlite:///instance/accounts.db
SECRET_KEY=your-secret-key-here
```

Then update your `docker-compose.yml` to load it:

```yaml
services:
  app:
    env_file:
      - .env
```

Or pass them directly with Docker CLI:

```bash
docker run -d \
  -e FLASK_ENV=production \
  -e SECRET_KEY=your-secret-key \
  -p 8002:8002 \
  -v $(pwd)/instance:/app/instance \
  google-manager
```

### Available Environment Variables

- `FLASK_ENV`: Set to `production` for production deployments (default: `production`)
- `DATABASE_URL`: Database connection string (default: `sqlite:///instance/accounts.db`)
- `SECRET_KEY`: Flask secret key for session management (auto-generated if not set)

## Database Persistence

The application uses SQLite for data storage. To ensure your data persists across container restarts, we mount the `instance/` directory as a volume.

**Important**: The volume mount `./instance:/app/instance` ensures that:
- Your database file (`accounts.db`) is stored on your host machine
- Data survives container restarts and rebuilds
- You can backup your data by copying the `instance/` directory

If you're using Docker Compose, this is already configured for you. If using Docker CLI, make sure to include the `-v $(pwd)/instance:/app/instance` flag.

## Accessing the Application

Once the container is running, you can access the application:

- **Web Interface**: Open your browser and go to `http://localhost:8002`
- **API Endpoints**: Available at `http://localhost:8002/api/*`

To verify the application is running:

```bash
# Check the health of the application
curl http://localhost:8002/api/accounts

# Or visit in your browser
open http://localhost:8002
```

## Troubleshooting

### Container won't start

**Check the logs first**:
```bash
docker-compose logs
# or
docker logs google-manager
```

**Common issues**:

1. **Port 8002 already in use**:
   ```bash
   # Find what's using the port
   lsof -i :8002
   
   # Either stop that service or change the port mapping
   docker-compose up -d -p 8003:8002
   ```

2. **Permission issues with instance/ directory**:
   ```bash
   # Ensure the directory exists and is writable
   mkdir -p instance
   chmod 755 instance
   ```

3. **Build fails during frontend build**:
   ```bash
   # Clear Docker cache and rebuild
   docker-compose build --no-cache
   ```

### Database is empty after restart

Make sure the volume mount is configured correctly. Check your `docker-compose.yml`:

```yaml
volumes:
  - ./instance:/app/instance
```

The `./instance` directory on your host should contain `accounts.db`.

### Application is slow to start

The first startup may take longer as the database is being initialized. Subsequent starts should be faster.

### Cannot connect to the application

1. Verify the container is running:
   ```bash
   docker-compose ps
   ```

2. Check the container is listening on the correct port:
   ```bash
   docker-compose logs | grep "访问地址"
   ```

3. Make sure no firewall is blocking port 8002.

## Stopping and Cleaning Up

### Stop the application

```bash
# With Docker Compose
docker-compose down

# With Docker CLI
docker stop google-manager
docker rm google-manager
```

### Remove the image

```bash
docker rmi google-manager
```

### Clean up everything (including volumes)

**Warning**: This will delete your database!

```bash
# With Docker Compose (removes containers, networks, and volumes)
docker-compose down -v

# Or manually
docker stop google-manager
docker rm google-manager
docker rmi google-manager
rm -rf instance/
```

## Production Deployment

For production deployments, consider these additional steps:

1. **Use a reverse proxy**: Place Nginx or Traefik in front of the application for SSL/TLS termination
2. **Set a strong SECRET_KEY**: Generate a secure random key for Flask sessions
3. **Regular backups**: Backup the `instance/` directory regularly
4. **Resource limits**: Add resource constraints to prevent resource exhaustion:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

5. **Health checks**: Add health check configuration:

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8002/api/accounts"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Need Help?

If you run into issues not covered here:

1. Check the application logs for error messages
2. Verify your Docker and Docker Compose versions are up to date
3. Review the main README.md for application-specific documentation
4. Check that all prerequisites are properly installed

---

**Quick Reference**:
```bash
# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild
docker-compose build --no-cache

# Access
http://localhost:8002
```
