describe('Authentication Flow Tests', () => {
  
  beforeEach(() => {
    cy.cleanTestData();
    cy.seedTestData();
  });

  it('should display login form on initial visit', () => {
    cy.visit('/');
    
    // Verificar que se muestra el login form
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    cy.contains('ChisOps Project').should('be.visible'); // Del title en index.html
  });

  it('should login user and redirect to UserHome', () => {
    cy.loginViaUI();
    
    // Verificar redirección según rol
    cy.verifyAuthenticated('user');
    cy.verifyUserHome();
  });

  it('should login admin and show admin dashboard', () => {
    cy.loginViaUI(Cypress.env('testAdmin').email, Cypress.env('testAdmin').password);
    
    cy.verifyAuthenticated('admin');
    cy.verifyAdminHome();
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/');
    
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Verificar que se mantiene en login y muestra error
    cy.get('input[type="email"]').should('be.visible');
    cy.contains('error', { matchCase: false }).should('be.visible');
  });

  it('should logout successfully using sidebar', () => {
    cy.loginViaUI();
    cy.verifyAuthenticated();
    
    // Usar el sidebar para hacer logout
    cy.logout();
    
    // Verificar que vuelve al login
    cy.get('input[type="email"]').should('be.visible');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('user')).to.be.null;
    });
  });

  it('should persist session on page reload', () => {
    cy.loginViaUI();
    cy.verifyAuthenticated();
    
    // Recargar página
    cy.reload();
    
    // Verificar que sigue autenticado
    cy.verifyAuthenticated();
    cy.verifyUserHome();
  });
});
