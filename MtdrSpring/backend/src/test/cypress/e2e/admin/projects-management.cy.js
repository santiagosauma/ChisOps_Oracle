describe('Admin Projects Management Tests', () => {
  
  beforeEach(() => {
    cy.cleanTestData();
    cy.seedTestData();
    cy.loginAsAdmin();
  });

  it('should access projects management from sidebar', () => {
    cy.visit('/');
    
    cy.useSidebar('Projects');
    
    cy.contains('Projects').should('be.visible');
    cy.get('[data-testid="projects-table"]').should('be.visible');
  });

  it('should display project details when selecting a project', () => {
    cy.visit('/');
    cy.useSidebar('Projects');
    
    cy.get('[data-testid="project-row"]').first().click();
    
    cy.get('[data-testid="project-header"]').should('be.visible');
    cy.get('[data-testid="project-tasks"]').should('be.visible');
    cy.get('[data-testid="project-users"]').should('be.visible');
  });

  it('should show active projects in admin home', () => {
    cy.visit('/');
    
    cy.verifyAdminHome();
    
    cy.get('[data-testid="active-projects-table"]').should('be.visible');
    cy.get('[data-testid="project-progress"]').should('have.length.at.least', 1);
  });

  it('should display project statistics correctly', () => {
    cy.visit('/');
    
    cy.contains('General Overview').should('be.visible');
    cy.get('[data-testid="incomplete-count"]').should('be.visible');
    cy.get('[data-testid="in-progress-count"]').should('be.visible');
    cy.get('[data-testid="completed-count"]').should('be.visible');
  });

  it('should handle project navigation correctly', () => {
    cy.visit('/');
    cy.useSidebar('Projects');
    
    cy.get('[data-testid="project-row"]').first().click();
    
    cy.get('[data-testid="back-button"]').click();
    
    cy.get('[data-testid="projects-table"]').should('be.visible');
  });
});
