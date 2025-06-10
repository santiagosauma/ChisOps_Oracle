describe('Task CRUD Operations', () => {
  
  beforeEach(() => {
    cy.cleanTestData()
    cy.seedTestData()
    cy.login()
    cy.goToDashboard()
  })

  it('should create a new task successfully', () => {
    cy.get('[data-cy="create-task-button"]').click()
    
    cy.get('[data-cy="task-title"]').type('New Cypress Task')
    cy.get('[data-cy="task-description"]').type('Task created by Cypress test')
    cy.get('[data-cy="task-priority"]').select('High')
    cy.get('[data-cy="task-type"]').select('Feature')
    cy.get('[data-cy="story-points"]').type('5')
    cy.get('[data-cy="estimated-hours"]').type('10')
    
    cy.get('[data-cy="save-task-button"]').click()
    
    cy.wait('@createTask')
    cy.get('[data-cy="success-message"]').should('be.visible')
    cy.get('[data-cy="task-list"]').should('contain', 'New Cypress Task')
  })

  it('should display task list correctly', () => {
    cy.get('[data-cy="task-list"]').should('be.visible')
    cy.get('[data-cy="task-item"]').should('have.length.at.least', 1)
    
    cy.get('[data-cy="task-item"]').first().within(() => {
      cy.get('[data-cy="task-title"]').should('be.visible')
      cy.get('[data-cy="task-status"]').should('be.visible')
      cy.get('[data-cy="task-priority"]').should('be.visible')
    })
  })

  it('should filter tasks by priority', () => {
    cy.get('[data-cy="priority-filter"]').select('High')
    cy.wait('@getTasks')
    
    cy.get('[data-cy="task-item"]').each(($task) => {
      cy.wrap($task).find('[data-cy="task-priority"]').should('contain', 'High')
    })
  })

  it('should update task status', () => {
    cy.get('[data-cy="task-item"]').first().within(() => {
      cy.get('[data-cy="status-dropdown"]').select('In progress')
    })
    
    cy.wait('@updateTask')
    cy.get('[data-cy="success-message"]').should('be.visible')
  })
})
