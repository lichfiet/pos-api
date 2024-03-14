# import config.
cnf ?= .env
include $(cnf)
export $(shell sed 's/=.*//' $(cnf))

# HELP
.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "%-30s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

##
## DOCKER TASKS 
##

## CONRAINER BUILDS
build: ## Build the container
	@echo "\n...Building Dev Container Image... \n"
	docker build -t $(APP_NAME):dev --platform linux/amd64 --target dev .

build-nc: ## Build the container
	@echo "\n...Building Dev Container Image Without Cache... \n"
	docker build -t $(APP_NAME):dev --platform linux/amd64 --target dev --no-cache .

buildProd: ## Build production container
	@echo "\n...Building Production Container Image Without Cache... \n"
	docker build -t $(APP_NAME):latest --platform linux/amd64 --target prod .

buildProd-nc: ## Build production container
	@echo "\n...Building Production Container Image Without Cache... \n"
	docker build -t $(APP_NAME):latest --platform linux/amd64 --target prod --no-cache .

run: ## Run container on port configured in `config.env`
	docker run -i -t --rm --env-file=./config.env -p=$(PORT):$(PORT) -p=$(PORT2):$(PORT2) --name="$(APP_NAME)" $(APP_NAME)

start:
	@echo "\n...Launching Dev Server... \n"
	docker compose -f ./docker/compose.yaml up -d

stop:
	@echo "\n...Stopping Docker Containers... \n"
	docker compose -f ./docker/compose.yaml down

# HELPERS
version: ## Output the current version
	@echo "Version: $(VERSION)"

# Clean Up
clean: # Remove images, modules, and cached build layers
	rm -rf node_modules

init: # Initailize development environment and start it
	chmod u+x ./make/dev-init.sh
	./make/dev-init.sh
	@echo "\n...Building Web Container Image... \n"
	docker build -t $(APP_NAME):dev --platform linux/amd64 -f ./docker/build.Dockerfile .
