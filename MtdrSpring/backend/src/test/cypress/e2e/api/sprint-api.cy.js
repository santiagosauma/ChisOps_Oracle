describe('Pruebas de API de Sprint', () => {
  
  beforeEach(() => {
    cy.cleanTestData();
    cy.seedTestData();
  });

  it('debería obtener todos los sprints', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/sprints`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      if (response.body.length > 0) {
        const sprint = response.body[0];
        expect(sprint).to.have.property('sprintId');
        expect(sprint).to.have.property('name');
        expect(sprint).to.have.property('status');
        expect(sprint).to.have.property('startDate');
        expect(sprint).to.have.property('endDate');
        
        expect(['Pending', 'In Progress', 'Completed']).to.include(sprint.status);
      }
    });
  });

  it('debería obtener sprint por ID', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/sprints/${Cypress.env('testSprint').sprintId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('sprintId', Cypress.env('testSprint').sprintId);
      expect(response.body).to.have.property('name');
      expect(response.body).to.have.property('status');
      
      expect(['Pending', 'In Progress', 'Completed']).to.include(response.body.status);
    });
  });

  it('debería obtener sprints por estado', () => {
    const testStatus = 'In Progress';
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/sprints/estado/${encodeURIComponent(testStatus)}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      response.body.forEach(sprint => {
        expect(sprint.status).to.eq(testStatus);
      });
    });
  });

  it('debería buscar sprints por nombre', () => {
    const searchName = 'Test';
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/sprints/buscar?name=${searchName}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      response.body.forEach(sprint => {
        expect(sprint.name.toLowerCase()).to.include(searchName.toLowerCase());
      });
    });
  });

  it('debería crear un nuevo sprint', () => {
    const newSprint = {
      name: 'Cypress Test Sprint',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
      deleted: 0,
      proyecto: {
        projectId: Cypress.env('testProject').projectId
      }
    };

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/sprints`,
      body: newSprint
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers).to.have.property('location');
      
      const sprintId = response.headers.location;
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/sprints/${sprintId}`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200);
        expect(getResponse.body.name).to.eq(newSprint.name);
        expect(getResponse.body.status).to.eq('Pending');
      });
    });
  });

  it('debería actualizar un sprint existente', () => {
    const newSprint = {
      name: 'Sprint to Update',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
      deleted: 0,
      proyecto: {
        projectId: Cypress.env('testProject').projectId
      }
    };

    cy.request('POST', `${Cypress.env('apiUrl')}/sprints`, newSprint).then((createResponse) => {
      const sprintId = createResponse.headers.location;
      
      cy.request('GET', `${Cypress.env('apiUrl')}/sprints/${sprintId}`).then((getResponse) => {
        const updatedSprint = {
          ...getResponse.body,
          name: 'Updated Sprint Name',
          status: 'In Progress'
        };
        
        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl')}/sprints/${sprintId}`,
          body: updatedSprint
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200);
          expect(updateResponse.body.name).to.eq('Updated Sprint Name');
          expect(updateResponse.body.status).to.eq('In Progress');
        });
      });
    });
  });

  it('debería normalizar los estados de sprint correctamente', () => {
    const statusTests = [
      { input: 'completado', expected: 'Completed' },
      { input: 'complete', expected: 'Completed' },
      { input: 'done', expected: 'Completed' },
      { input: 'finalizado', expected: 'Completed' },
      { input: 'in progress', expected: 'In Progress' },
      { input: 'en progreso', expected: 'In Progress' },
      { input: 'active', expected: 'In Progress' },
      { input: 'activo', expected: 'In Progress' },
      { input: 'pending', expected: 'Pending' },
      { input: 'pendiente', expected: 'Pending' },
      { input: 'to do', expected: 'Pending' },
      { input: 'planificado', expected: 'Pending' },
      { input: 'unknown_status', expected: 'Pending' }
    ];

    statusTests.forEach((test, index) => {
      const testSprint = {
        name: `Status Test Sprint ${index}`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: test.input,
        deleted: 0,
        proyecto: {
          projectId: Cypress.env('testProject').projectId
        }
      };

      cy.request('POST', `${Cypress.env('apiUrl')}/sprints`, testSprint).then((createResponse) => {
        const sprintId = createResponse.headers.location;
        
        cy.request('GET', `${Cypress.env('apiUrl')}/sprints/${sprintId}`).then((getResponse) => {
          expect(getResponse.body.status).to.eq(test.expected);
        });
      });
    });
  });
});
