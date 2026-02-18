.PHONY: dev feasible infeasible repair test clean help

help:
	@echo "🏥 Comandos disponibles del Hospital Shift Optimizer:"
	@echo "  make dev          -> Inicia entorno de desarrollo completo"
	@echo "  make web          -> Inicia el FRONTEND (Web)"
	@echo "  make feasible     -> Inicia escenario FACTIBLE"
	@echo "  make infeasible   -> Inicia escenario INFACTIBLE (Min-Cut)"
	@echo "  make repair       -> Inicia escenario REPARACIÓN"
	@echo "  make test         -> Inicia entorno de pruebas manuales"
	@echo "  make test-web     -> Corre tests del FRONTEND (Web)"
	@echo "  make test-api     -> Corre tests del BACKEND (API)"
	@echo "  make test-all     -> Corre TODOS los tests automatizados (API + Web)"
	@echo "  make prod         -> Inicia entorno de PRODUCCIÓN (Docker)"
	@echo "  make stop         -> Detiene entorno de PRODUCCIÓN (Docker)"
	@echo "  make clean        -> Limpia binarios generados"

dev:
	./scripts/start_dev.sh

prod:
	docker-compose up --build -d
	@echo "🐳 Producción iniciada en segundo plano."

stop:
	docker-compose down
	@echo "🛑 Producción detenida."

feasible:
	./scripts/start_scenario_feasible.sh

infeasible:
	./scripts/start_scenario_infeasible.sh

repair:
	./scripts/start_scenario_repair.sh

test:
	./scripts/start_test_env.sh

clean:
	cd apps/core && make clean

web:
	./scripts/start_web.sh

test-all:
	./scripts/run_all_tests.sh

test-web:
	cd apps/web && npm test

test-api:
	cd apps/api && npm test
