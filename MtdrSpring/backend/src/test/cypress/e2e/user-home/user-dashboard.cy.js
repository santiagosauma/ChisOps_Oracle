describe('User Home Dashboard Tests', () => {
  
  beforeEach(() => {
    cy.cleanTestData();
    cy.seedTestData();
    cy.loginViaAPI(); // Login como user normal
  });

  it('should display user dashboard correctly', () => {
    cy.visit('/');
    
    cy.verifyUserHome();
    
    // Verificar elementos específicos de UserHome
    cy.contains('Home').should('be.visible'); // Header del UserHome
    cy.get('[data-testid="overdue-tasks"]').should('be.visible');
    cy.get('[data-testid="pending-tasks"]').should('be.visible');
    cy.get('[data-testid="completed-tasks"]').should('be.visible');
  });

  it('should load and display projects in dropdown', () => {
    cy.visit('/');
    
    // Interactuar con dropdown de proyectos
    cy.get('[data-testid="projects-dropdown"]').click();
    cy.get('[data-testid="project-option"]').should('have.length.at.least', 1);
  });

  it('should filter tasks by sprint selection', () => {
    cy.visit('/');
    
    // Seleccionar un proyecto primero
    cy.get('[data-testid="projects-dropdown"]').select(Cypress.env('testProject').name);
    
    // Luego seleccionar un sprint
    cy.get('[data-testid="sprint-dropdown"]').should('be.visible');
    cy.get('[data-testid="sprint-dropdown"]').select(Cypress.env('testSprint').name);
    
    // Verificar que se cargan las tareas
    cy.get('[data-testid="task-list"]').should('be.visible');
  });

  it('should use task filters correctly', () => {
    cy.visit('/');
    
    // Usar filtros de tareas
    cy.useTaskFilters('High', 'In Progress');
    
    // Verificar que se aplicaron los filtros
    cy.get('[data-testid="active-filters"]').should('contain', 'High');
    cy.get('[data-testid="active-filters"]').should('contain', 'In Progress');
  });

  it('should show task statistics correctly', () => {
    cy.visit('/');
    
    // Verificar que se muestran las estadísticas
    cy.get('[data-testid="overdue-count"]').should('contain.text', /\d+/);
    cy.get('[data-testid="pending-count"]').should('contain.text', /\d+/);
    cy.get('[data-testid="completed-count"]').should('contain.text', /\d+/);
  });

  it('should handle empty task list gracefully', () => {
    // Crear usuario sin tareas
    cy.visit('/');
    
    // Seleccionar proyecto sin tareas
    cy.get('[data-testid="projects-dropdown"]').select('Empty Project');
    
    // Verificar mensaje de "no tareas"
    cy.contains('No tienes tareas').should('be.visible');
  });
});
