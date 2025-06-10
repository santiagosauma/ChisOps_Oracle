const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // URL base apuntando directamente al backend Spring Boot
    baseUrl: 'http://localhost:8080',
    
    // Configuración de archivos - Solo para API testing
    supportFile: 'support/e2e.js',
    specPattern: 'e2e/api/**/*.cy.{js,jsx,ts,tsx}', 
    fixturesFolder: 'fixtures',
    
    // Timeouts para API calls
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Video y screenshots solo para debugging API failures
    video: true,
    screenshotOnRunFailure: true,
    
    // Variables de entorno específicas para tu app
    env: {
      // URL del backend Spring Boot 
      apiUrl: 'http://localhost:8080',
      
      // Datos de prueba REALES que existen en tu BD
      testUser: {
        userId: 1, // Ajustar según tu BD
        email: 'hector.garza@empresa.com', // ✅ Credencial real
        password: 'password123', // ✅ Credencial real  
        firstName: 'Hector',
        lastName: 'Garza',
        rol: 'user',
        telegramUsername: 'hectorgarza' // Ajustar según tu BD
      },
      
      testAdmin: {
        userId: 2, // Ajustar según tu BD
        email: 'admin@empresa.com', // Cambiar por admin real si existe
        password: 'adminpass', // Cambiar por password real si existe
        firstName: 'Admin',
        lastName: 'Test',
        rol: 'admin'
      },
      
      // Datos para testing de tareas
      testTask: {
        title: 'Cypress API Test Task',
        description: 'Task created by Cypress API automation',
        priority: 'Medium',
        type: 'Task',
        status: 'Incomplete',
        storyPoints: 5,
        estimatedHours: 8.0,
        actualHours: 0.0
      },
      
      // IDs de prueba (ajustar según tu BD de testing)
      testSprint: {
        sprintId: 1,
        name: 'Sprint Test 1'
      },
      
      testProject: {
        projectId: 1,
        name: 'Test Project'
      }
    },
    
    // Configuración para API testing
    setupNodeEvents(on, config) {
      // Tasks para manejo de base de datos de testing
      on('task', {
        clearTestData() {
          console.log('Clearing test database...');
          return null;
        },
        
        seedTestData() {
          console.log('Seeding test database...');
          return null;
        },
        
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    },
  },
})
