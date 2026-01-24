.PHONY: dev feasible infeasible repair test clean help

help:
	@echo "🏥 Comandos disponibles del Hospital Shift Optimizer:"
	@echo "  make dev          -> Inicia entorno de desarrollo completo"
	@echo "  make feasible     -> Inicia escenario FACTIBLE"
	@echo "  make infeasible   -> Inicia escenario INFACTIBLE (Min-Cut)"
	@echo "  make repair       -> Inicia escenario REPARACIÓN"
	@echo "  make test         -> Inicia entorno de pruebas manuales"
	@echo "  make clean        -> Limpia binarios generados"

dev:
	./scripts/start_dev.sh

feasible:
	./scripts/start_scenario_feasible.sh

infeasible:
	./scripts/start_scenario_infeasible.sh

repair:
	./scripts/start_scenario_repair.sh

test:
	./scripts/start_test_env.sh

clean:
	cd core && make clean
