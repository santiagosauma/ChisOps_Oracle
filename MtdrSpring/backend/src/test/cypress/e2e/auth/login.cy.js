describe('Authentication Tests', () => {
  
  beforeEach(() => {
    cy.cleanTestData()
    cy.seedTestData()
  })

  it('should login successfully with valid credentials', () => {
    cy.visit('/login')
    
    cy.get('[data-cy="email-input"]').type(Cypress.env('testUser').email)
    cy.get('[data-cy="password-input"]').type(Cypress.env('testUser').password)
    cy.get('[data-cy="login-button"]').click()
    
    // Verificar redirección al dashboard
    cy.url().should('include', '/dashboard')
    cy.get('[data-cy="welcome-message"]').should('contain', Cypress.env('testUser').firstName)
  })

  it('should show error with invalid credentials', () => {
    cy.visit('/login')
    
    cy.get('[data-cy="email-input"]').type('invalid@example.com')
    cy.get('[data-cy="password-input"]').type('wrongpassword')
    cy.get('[data-cy="login-button"]').click()
    
    cy.get('[data-cy="error-message"]').should('be.visible')
    cy.url().should('include', '/login')
  })

  it('should logout successfully', () => {
    cy.login()
    cy.goToDashboard()
    
    cy.get('[data-cy="logout-button"]').click()
    cy.url().should('include', '/login')
    cy.window().its('localStorage').should('not.have.property', 'authToken')
  })
})
