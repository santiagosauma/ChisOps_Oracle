// ========================================
// COMANDOS PERSONALIZADOS PARA API TESTING
// ========================================

// Comando para autenticación via API con credenciales REALES
Cypress.Commands.add('loginViaAPI', (email = Cypress.env('testUser').email, password = Cypress.env('testUser').password) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/usuarios/login`,
    body: {
      email: email, // hector.garza@empresa.com
      password: password // password123
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      return response.body;
    } else {
      throw new Error(`Login failed: ${response.body}`);
    }
  });
});

// Comando para crear tarea vía API
Cypress.Commands.add('createTaskViaAPI', (taskData = {}) => {
  const defaultTask = {
    title: Cypress.env('testTask').title,
    description: Cypress.env('testTask').description,
    priority: Cypress.env('testTask').priority,
    type: Cypress.env('testTask').type,
    status: Cypress.env('testTask').status,
    storyPoints: Cypress.env('testTask').storyPoints,
    estimatedHours: Cypress.env('testTask').estimatedHours,
    actualHours: Cypress.env('testTask').actualHours,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    deleted: 0,
    usuario: {
      userId: Cypress.env('testUser').userId
    },
    sprint: {
      sprintId: Cypress.env('testSprint').sprintId
    },
    ...taskData
  };
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/tareas`,
    body: defaultTask,
    headers: {
      'Content-Type': 'application/json'
    }
  });
});

// Comando para obtener tareas de usuario vía API
Cypress.Commands.add('getUserTasksViaAPI', (userId = Cypress.env('testUser').userId) => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/tareas/usuario/${userId}`
  });
});

// Comando para actualizar tarea vía API
Cypress.Commands.add('updateTaskViaAPI', (taskId, updateData) => {
  return cy.request({
    method: 'PUT',
    url: `${Cypress.env('apiUrl')}/tareas/${taskId}`,
    body: updateData,
    headers: {
      'Content-Type': 'application/json'
    }
  });
});

// Comando para obtener sprints vía API
Cypress.Commands.add('getSprintsViaAPI', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/sprints`
  });
});

// Comando para obtener proyectos vía API
Cypress.Commands.add('getProjectsViaAPI', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/proyectos`
  });
});

// Comando para limpiar datos de prueba
Cypress.Commands.add('cleanTestData', () => {
  cy.task('clearTestData');
});

// Comando para sembrar datos de prueba
Cypress.Commands.add('seedTestData', () => {
  cy.task('seedTestData');
});

// Comando para crear proyecto vía API
Cypress.Commands.add('createProjectViaAPI', (projectData = {}) => {
  const defaultProject = {
    name: 'Cypress Test Project',
    description: 'Project created by Cypress automation',
    status: 'Active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deleted: 0,
    ...projectData
  };
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/proyectos`,
    body: defaultProject
  });
});

// Comando para crear sprint vía API
Cypress.Commands.add('createSprintViaAPI', (sprintData = {}) => {
  const defaultSprint = {
    name: 'Cypress Test Sprint',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Pending',
    deleted: 0,
    proyecto: {
      projectId: Cypress.env('testProject').projectId
    },
    ...sprintData
  };
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/sprints`,
    body: defaultSprint
  });
});

// Comando para validar estructura de respuesta API
Cypress.Commands.add('validateApiResponse', (response, expectedKeys) => {
  expect(response.status).to.be.within(200, 299);
  expectedKeys.forEach(key => {
    expect(response.body).to.have.property(key);
  });
});
