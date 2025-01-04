up:
	docker-compose \
        -f docker-compose.yml \
        -f docker-compose.local.yml \
        up

build:
	docker-compose \
        -f docker-compose.yml \
        -f docker-compose.local.yml \
        build        

down:
	docker-compose \
        -f docker-compose.yml \
        -f docker-compose.local.yml \
        down

destroy:
	docker-compose \
        -f docker-compose.yml \
        -f docker-compose.local.yml \
        down -v --remove-orphans		