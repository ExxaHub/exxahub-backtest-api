PROJECT_NAME := exxahub

.PHONY: loadtest

create-network:
	docker network create exxahub_network || true

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
		run --rm exxahub_loadtester run /app/test.js

generate-creds: create-network
	docker-compose \
		-f docker-compose.yml \
		-p ${PROJECT_NAME} \
		run --rm exxahub_backtest_api bun run generate:dbcreds

tickers-backfill:
	docker-compose \
		-f docker-compose.yml \
		-p ${PROJECT_NAME} \
		run --rm exxahub_backtest_api bun run tickers:backfill