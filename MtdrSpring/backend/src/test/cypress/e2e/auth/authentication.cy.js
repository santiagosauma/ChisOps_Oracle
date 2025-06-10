describe('Authentication Flow Tests', () => {
  
  beforeEach(() => {
    cy.cleanTestData();
    cy.seedTestData();
  });

  it('should login successfully with valid credentials', () => {
    cy.loginViaAPI().then((user) => {
      expect(user).to.have.property('userId');
      expect(user).to.have.property('email');
      expect(user.email).to.eq(Cypress.env('testUser').email);
    });
  });

  it('should fail login with invalid credentials', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/usuarios/login`,
      body: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('should login via UI successfully', () => {
    cy.loginViaUI();
    cy.verifyAuthenticated();
    
    // Verificar que se muestra el nombre del usuario
    cy.get('[data-cy="user-name"]').should('contain', Cypress.env('testUser').firstName);
  });

  it('should show error message for invalid UI login', () => {
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('invalid@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="login-button"]').click();
    
    cy.get('[data-cy="error-message"]').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    cy.loginViaUI();
    cy.get('[data-cy="logout-button"]').click();
    
    cy.url().should('include', '/login');
    cy.window().its('localStorage').should('not.have.property', 'currentUser');
  });
});
