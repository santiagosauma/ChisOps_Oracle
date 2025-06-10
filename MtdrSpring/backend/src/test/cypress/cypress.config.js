const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    
    supportFile: 'support/e2e.js',
    specPattern: 'e2e/api/**/*.cy.{js,jsx,ts,tsx}', 
    fixturesFolder: 'fixtures',
    
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    video: true,
    screenshotOnRunFailure: true,
    
    env: {
      apiUrl: 'http://localhost:8080',
      
      testUser: {
        userId: 1,
        email: 'hector.garza@empresa.com',
        password: 'password123',
        firstName: 'Hector',
        lastName: 'Garza',
        rol: 'user',
        telegramUsername: 'hectorgarza'
      },
      
      testAdmin: {
        userId: 2,
        email: 'admin@empresa.com',
        password: 'adminpass',
        firstName: 'Admin',
        lastName: 'Test',
        rol: 'admin'
      },
      
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
      
      testSprint: {
        sprintId: 1,
        name: 'Sprint Test 1'
      },
      
      testProject: {
        projectId: 1,
        name: 'Test Project'
      }
    },
    
    setupNodeEvents(on, config) {
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
