describe('User Home Dashboard Tests', () => {
  
  beforeEach(() => {
    cy.cleanTestData();
    cy.seedTestData();
    cy.loginViaAPI();
  });

  it('should display user dashboard correctly', () => {
    cy.visit('/');
    
    cy.verifyUserHome();
    
    cy.contains('Home').should('be.visible');
    cy.get('[data-testid="overdue-tasks"]').should('be.visible');
    cy.get('[data-testid="pending-tasks"]').should('be.visible');
    cy.get('[data-testid="completed-tasks"]').should('be.visible');
  });

  it('should load and display projects in dropdown', () => {
    cy.visit('/');
    
    cy.get('[data-testid="projects-dropdown"]').click();
    cy.get('[data-testid="project-option"]').should('have.length.at.least', 1);
  });

  it('should filter tasks by sprint selection', () => {
    cy.visit('/');
    
    cy.get('[data-testid="projects-dropdown"]').select(Cypress.env('testProject').name);
    
    cy.get('[data-testid="sprint-dropdown"]').should('be.visible');
    cy.get('[data-testid="sprint-dropdown"]').select(Cypress.env('testSprint').name);

    cy.get('[data-testid="task-list"]').should('be.visible');
  });

  it('should use task filters correctly', () => {
    cy.visit('/');
    
    cy.useTaskFilters('High', 'In Progress');
    
    cy.get('[data-testid="active-filters"]').should('contain', 'High');
    cy.get('[data-testid="active-filters"]').should('contain', 'In Progress');
  });

  it('should show task statistics correctly', () => {
    cy.visit('/');
    
    cy.get('[data-testid="overdue-count"]').should('contain.text', /\d+/);
    cy.get('[data-testid="pending-count"]').should('contain.text', /\d+/);
    cy.get('[data-testid="completed-count"]').should('contain.text', /\d+/);
  });

  it('should handle empty task list gracefully', () => {
    cy.visit('/');
    
    cy.get('[data-testid="projects-dropdown"]').select('Empty Project');

    cy.contains('No tienes tareas').should('be.visible');
  });
});
