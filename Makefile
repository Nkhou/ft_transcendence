NAME: up

up:
		docker-compose -f docker-compose.yml up

down:
		docker-compose -f docker-compose.yml down

start:
		docker-compose -f docker-compose.yml start