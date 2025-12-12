.PHONY: up down logs test clean restart

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f

test:
	./scripts/test.sh

clean:
	docker-compose down -v
	docker system prune -f

restart: down up

health:
	curl http://localhost:8000/health
	curl http://localhost:3000
