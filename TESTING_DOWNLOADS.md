# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f app

# Run artisan commands
docker-compose exec app php artisan <command>

# Access shell
docker-compose exec app bash

# Rebuild after changes
docker-compose up -d --build
docker-compose --profile dev up -d