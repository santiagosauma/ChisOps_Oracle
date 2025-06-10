describe('Pruebas de API de Tarea', () => {
  
  beforeEach(() => {
    cy.cleanTestData();
    cy.seedTestData();
  });

  it('debería obtener todas las tareas', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/tareas`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      if (response.body.length > 0) {
        const task = response.body[0];
        expect(task).to.have.property('taskId');
        expect(task).to.have.property('title');
        expect(task).to.have.property('description');
        expect(task).to.have.property('status');
        expect(task).to.have.property('priority');
        expect(task).to.have.property('type');
      }
    });
  });

  it('debería obtener tareas por usuario', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/tareas/usuario/${Cypress.env('testUser').userId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      response.body.forEach(task => {
        expect(task).to.have.property('usuario');
        expect(task.usuario.userId).to.eq(Cypress.env('testUser').userId);
      });
    });
  });

  it('debería obtener tareas por sprint', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/tareas/sprint/${Cypress.env('testSprint').sprintId}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      if (response.body.length > 0) {
        response.body.forEach(task => {
          expect(task).to.have.property('taskId');
          expect(task).to.have.property('title');
          expect(task).to.have.property('status');
          
          cy.log(`Task ${task.taskId} was returned by sprint ${Cypress.env('testSprint').sprintId} endpoint`);
        });
      }
    });
  });

  it('debería obtener tareas por estado', () => {
    const testStatus = 'Incomplete';
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/tareas/estado/${testStatus}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      response.body.forEach(task => {
        expect(task.status).to.eq(testStatus);
      });
    });
  });

  it('debería obtener tareas por prioridad', () => {
    const testPriority = 'High';
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/tareas/prioridad/${testPriority}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      response.body.forEach(task => {
        expect(task.priority).to.eq(testPriority);
      });
    });
  });

  it('debería obtener tareas por tipo', () => {
    const testType = 'Bug';
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/tareas/tipo/${testType}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      response.body.forEach(task => {
        expect(task.type).to.eq(testType);
      });
    });
  });

  it('debería buscar tareas por término', () => {
    const searchTerm = 'test';
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/tareas/buscar?term=${searchTerm}`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      
      response.body.forEach(task => {
        const containsInTitle = task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const containsInDescription = task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase());
        expect(containsInTitle || containsInDescription).to.be.true;
      });
    });
  });

  it('debería obtener tareas organizadas por usuario y proyecto', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/tareas/usuario/${Cypress.env('testUser').userId}/proyecto/${Cypress.env('testProject').projectId}/organizadas`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('projectId');
      expect(response.body).to.have.property('projectName');
      expect(response.body).to.have.property('sprints');
      expect(response.body.sprints).to.be.an('array');
      
      response.body.sprints.forEach(sprint => {
        expect(sprint).to.have.property('sprintId');
        expect(sprint).to.have.property('sprintName');
        expect(sprint).to.have.property('tasks');
        expect(sprint.tasks).to.be.an('array');
        
        sprint.tasks.forEach(task => {
          expect(task).to.have.property('taskId');
          expect(task).to.have.property('title');
          expect(task).to.have.property('status');
          expect(task).to.have.property('priority');
        });
      });
    });
  });

  it('debería crear una nueva tarea', () => {
    const newTask = {
      title: 'Cypress API Test Task',
      description: 'Task created by Cypress API automation',
      priority: 'Medium',
      type: 'Task',
      status: 'Incomplete',
      storyPoints: 3,
      estimatedHours: 6.0,
      actualHours: 0.0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deleted: 0,
      usuario: {
        userId: Cypress.env('testUser').userId
      },
      sprint: {
        sprintId: Cypress.env('testSprint').sprintId
      }
    };

    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/tareas`,
      body: newTask
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers).to.have.property('location');
      
      const taskId = response.headers.location;
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/tareas/${taskId}`
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200);
        expect(getResponse.body.title).to.eq(newTask.title);
        expect(getResponse.body.priority).to.eq(newTask.priority);
        expect(getResponse.body.status).to.eq(newTask.status);
      });
    });
  });

  it('debería actualizar una tarea existente', () => {
    const newTask = {
      title: 'Task to Update',
      description: 'Original description',
      priority: 'Low',
      type: 'Task',
      status: 'Incomplete',
      storyPoints: 2,
      estimatedHours: 4.0,
      actualHours: 0.0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deleted: 0,
      usuario: {
        userId: Cypress.env('testUser').userId
      },
      sprint: {
        sprintId: Cypress.env('testSprint').sprintId
      }
    };

    cy.request('POST', `${Cypress.env('apiUrl')}/tareas`, newTask).then((createResponse) => {
      const taskId = createResponse.headers.location;
      
      cy.request('GET', `${Cypress.env('apiUrl')}/tareas/${taskId}`).then((getResponse) => {
        const updatedTask = {
          ...getResponse.body,
          status: 'In Progress',
          priority: 'High',
          actualHours: 2.5
        };

        cy.request({
          method: 'PUT',
          url: `${Cypress.env('apiUrl')}/tareas/${taskId}`,
          body: updatedTask
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200);
          expect(updateResponse.body.status).to.eq('In Progress');
          expect(updateResponse.body.priority).to.eq('High');
          expect(updateResponse.body.actualHours).to.eq(2.5);
        });
      });
    });
  });

  it('debería eliminar una tarea', () => {
    const newTask = {
      title: 'Task to Delete',
      description: 'This task will be deleted',
      priority: 'Low',
      type: 'Task',
      status: 'Incomplete',
      storyPoints: 1,
      estimatedHours: 2.0,
      actualHours: 0.0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deleted: 0,
      usuario: {
        userId: Cypress.env('testUser').userId
      },
      sprint: {
        sprintId: Cypress.env('testSprint').sprintId
      }
    };

    cy.request('POST', `${Cypress.env('apiUrl')}/tareas`, newTask).then((createResponse) => {
      const taskId = createResponse.headers.location;

      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/tareas/${taskId}`
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.eq(200);
        
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/tareas/${taskId}`,
          failOnStatusCode: false
        }).then((getResponse) => {
          expect([404, 200]).to.include(getResponse.status);
          
          if (getResponse.status === 200 && getResponse.body && typeof getResponse.body === 'object') {
            expect(getResponse.body).to.have.property('deleted');
            expect(getResponse.body.deleted).to.eq(1);
          }
        });
      });
    });
  });
});
