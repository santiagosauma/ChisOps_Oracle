describe('Pruebas de API de Usuario', () => {
  
  beforeEach(() => {
    cy.cleanTestData();
    cy.seedTestData();
  });

  it('debería autenticar usuario con credenciales válidas', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/usuarios/login`,
      body: {
        email: Cypress.env('testUser').email,
        password: Cypress.env('testUser').password
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('userId');
      expect(response.body).to.have.property('email');
      expect(response.body).to.have.property('firstName');
      expect(response.body).to.have.property('rol');
      expect(response.body.email).to.eq(Cypress.env('testUser').email);
    });
  });

  it('debería rechazar autenticación con credenciales inválidas', () => {
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
      expect(response.body).to.include('Invalid credentials');
    });
  });

  it('debería rechazar login sin credenciales completas', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/usuarios/login`,
      body: {
        email: Cypress.env('testUser').email
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.include('Email and password are required');
    });
  });

  it('debería obtener usuario por ID', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/usuarios/${Cypress.env('testUser').userId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('userId', Cypress.env('testUser').userId);
      expect(response.body).to.have.property('firstName');
      expect(response.body).to.have.property('lastName');
      expect(response.body).to.have.property('email');
    });
  });

  it('debería obtener usuario por email', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/usuarios/email/${Cypress.env('testUser').email}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('email', Cypress.env('testUser').email);
      expect(response.body).to.have.property('userId');
    });
  });

  it('debería retornar 404 para email inexistente', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/usuarios/email/nonexistent@example.com`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('debería buscar usuarios por nombre', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/usuarios/search?term=${Cypress.env('testUser').firstName}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      if (response.body.length > 0) {
        expect(response.body[0]).to.have.property('firstName');
        expect(response.body[0]).to.have.property('lastName');
      }
    });
  });

  it('debería obtener todos los usuarios', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/usuarios`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      
      const user = response.body[0];
      expect(user).to.have.property('userId');
      expect(user).to.have.property('firstName');
      expect(user).to.have.property('lastName');
      expect(user).to.have.property('email');
      expect(user).to.have.property('rol');
    });
  });
});
