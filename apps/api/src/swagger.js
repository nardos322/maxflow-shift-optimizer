const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MaxFlow Shift Optimizer API',
      version: '1.0.0',
      description:
        'API central del sistema de asignación de guardias. Gestiona la orquestación de datos, autenticación y comunicación con el Solver C++ (Edmonds-Karp). Incluye funcionalidades de reparación inteligente (Shift Repair) y diagnóstico de infactibilidad (Min-Cut Analysis).',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Asignacion: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            medicoId: { type: 'integer' },
            periodoId: { type: 'integer' },
            fecha: { type: 'string', format: 'date' },
            medico: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                nombre: { type: 'string' },
              },
            },
            periodo: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                nombre: { type: 'string' },
              },
            },
          },
        },
        ResultadoSolver: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['FEASIBLE', 'INFEASIBLE'] },
            asignacionesCreadas: { type: 'integer' },
            message: { type: 'string' },
            minCut: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  razon: { type: 'string' },
                  tipo: { type: 'string' },
                },
              },
            },
          },
        },
        ReporteEquidad: {
          type: 'object',
          properties: {
            fechaGeneracion: { type: 'string', format: 'date-time' },
            estadisticasGlobales: {
              type: 'object',
              properties: {
                totalGuardias: { type: 'integer' },
                medicosActivos: { type: 'integer' },
                promedioPorMedico: { type: 'number' },
                desviacionEstandar: { type: 'number' },
              },
            },
            detallePorMedico: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  nombre: { type: 'string' },
                  totalGuardias: { type: 'integer' },
                  periodosCubiertos: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            email: { type: 'string', format: 'email' },
            rol: { type: 'string', enum: ['ADMIN', 'MEDICO', 'LECTOR'] },
          },
        },
        Medico: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            email: { type: 'string', format: 'email' },
            activo: { type: 'boolean' },
            userId: { type: 'integer' },
          },
        },
        Disponibilidad: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            medicoId: { type: 'integer' },
            fecha: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
