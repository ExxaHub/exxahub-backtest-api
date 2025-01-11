up:
	docker-compose \
        -f docker-compose.yml \
        -f docker-compose.local.yml \
        up --force-recreate --remove-orphans

build:
	docker-compose \
        -f docker-compose.yml \
        -f docker-compose.local.yml \
        build        

down:
	docker-compose \
        -f docker-compose.yml \
        -f docker-compose.local.yml \
        down --remove-orphans

destroy:
	docker-compose \
        -f docker-compose.yml \
        -f docker-compose.local.yml \
        down -v --remove-orphans		