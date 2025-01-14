PROJECT_NAME := exxahub

.PHONY: loadtest

up: generate-creds
	docker-compose \
        -f docker-compose.yml \
		-p ${PROJECT_NAME} \
        up --force-recreate --remove-orphans

build:
	docker-compose \
        -f docker-compose.yml \
		-p ${PROJECT_NAME} \
        build        

down:
	docker-compose \
        -f docker-compose.yml \
		-p ${PROJECT_NAME} \
        down --remove-orphans

destroy:
	docker-compose \
        -f docker-compose.yml \
		-p ${PROJECT_NAME} \
        down -v --remove-orphans	

loadtest:
	docker-compose \
		-f docker-compose.yml \
		-f docker-compose.loadtest.yml \
		-p ${PROJECT_NAME} \
		run --rm loadtester run /app/test.js

generate-creds:
	docker-compose \
		-f docker-compose.yml \
		-p ${PROJECT_NAME} \
		run --rm backtester bun run generate:dbcreds