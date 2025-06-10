// Importar comandos personalizados para API testing
import './commands'

// Configuración global para API testing
beforeEach(() => {
  // Interceptar llamadas a APIs para mejor debugging
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

// Configuración global para manejo de errores en API testing
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar errores de red comunes durante testing de APIs
  if (err.message.includes('Network Error')) {
    return false
  }
  
  // Ignorar errores de CORS durante testing local
  if (err.message.includes('CORS')) {
    return false
  }
  
  // Para otros errores, permitir que fallen el test
  return true
})
