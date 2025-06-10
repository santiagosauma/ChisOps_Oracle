describe('Pruebas de API de Proyecto', () => {
  
  beforeEach(() => {
    cy.cleanTestData();
    cy.seedTestData();
  });

  it('debería obtener todos los proyectos', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/proyectos`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      if (response.body.length > 0) {
        const project = response.body[0];
        expect(project).to.have.property('projectId');
        expect(project).to.have.property('name');
        expect(project).to.have.property('description');
        expect(project).to.have.property('status');
        expect(project).to.have.property('startDate');
        expect(project).to.have.property('endDate');
      }
    });
  });

  it('debería obtener proyecto por ID', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/proyectos/${Cypress.env('testProject').projectId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('projectId', Cypress.env('testProject').projectId);
      expect(response.body).to.have.property('name');
      expect(response.body).to.have.property('status');
    });
  });

  it('debería obtener proyectos activos detallados', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/proyectos/activos-detallados`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('activeProjects');
      expect(response.body).to.have.property('totalProjects');
      expect(response.body).to.have.property('activeCount');
      expect(response.body).to.have.property('statusCounts');
      
      expect(response.body.activeProjects).to.be.an('array');
      expect(response.body.totalProjects).to.be.a('number');
      expect(response.body.activeCount).to.be.a('number');
      expect(response.body.statusCounts).to.be.an('object');
    });
  });

  it('debería obtener proyectos por estado', () => {
    const testStatus = 'Active';
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/proyectos/estado/${testStatus}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      // Verificar que todos los proyectos tienen el status correcto
      response.body.forEach(project => {
        expect(project.status).to.eq(testStatus);
      });
    });
  });

  it('debería obtener proyectos activos', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/proyectos/activos`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      // Verificar que todos son proyectos activos
      response.body.forEach(project => {
        expect(['En progreso', 'In Progress', 'Activo', 'Active']).to.include(project.status);
      });
    });
  });

  it('debería buscar proyectos por término', () => {
    const searchTerm = 'Test';
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/proyectos/buscar?term=${searchTerm}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      // Verificar que los resultados contienen el término de búsqueda
      response.body.forEach(project => {
        const containsInName = project.name && project.name.toLowerCase().includes(searchTerm.toLowerCase());
        const containsInDescription = project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase());
        expect(containsInName || containsInDescription).to.be.true;
      });
    });
  });

  it('debería obtener proyectos por usuario', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/proyectos/usuario/${Cypress.env('testUser').userId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      // Cada proyecto debe tener la estructura correcta
      response.body.forEach(project => {
        expect(project).to.have.property('projectId');
        expect(project).to.have.property('name');
        expect(project).to.have.property('status');
      });
    });
  });

  it('debería obtener proyectos simplificados por usuario', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/proyectos/usuario/${Cypress.env('testUser').userId}/simplificados`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      // Verificar estructura simplificada
      response.body.forEach(project => {
        expect(project).to.have.property('projectId');
        expect(project).to.have.property('name');
        expect(project).to.have.property('startDate');
        expect(project).to.have.property('endDate');
        expect(project).to.have.property('status');
        
        // No debe tener campos adicionales como description completa
        expect(project).to.not.have.property('usuarios');
        expect(project).to.not.have.property('sprints');
      });
    });
  });

  it('debería obtener usuarios por proyecto', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/proyectos/${Cypress.env('testProject').projectId}/usuarios`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      // Verificar estructura de usuarios
      response.body.forEach(user => {
        expect(user).to.have.property('userId');
        expect(user).to.have.property('firstName');
        expect(user).to.have.property('lastName');
        expect(user).to.have.property('email');
      });
    });
  });
});
