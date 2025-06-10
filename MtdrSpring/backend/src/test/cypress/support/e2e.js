import './commands'

beforeEach(() => {
  cy.intercept('GET', '/usuarios/**').as('getUsers')
  cy.intercept('POST', '/usuarios/login').as('loginUser')
  cy.intercept('GET', '/tareas/**').as('getTasks')
  cy.intercept('POST', '/tareas').as('createTask')
  cy.intercept('PUT', '/tareas/**').as('updateTask')
  cy.intercept('DELETE', '/tareas/**').as('deleteTask')
  cy.intercept('GET', '/proyectos/**').as('getProjects')
  cy.intercept('POST', '/proyectos').as('createProject')
  cy.intercept('GET', '/sprints/**').as('getSprints')
  cy.intercept('POST', '/sprints').as('createSprint')
})

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Network Error')) {
    return false
  }

  if (err.message.includes('CORS')) {
    return false
  }
  return true
})
