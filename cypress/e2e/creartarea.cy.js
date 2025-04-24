describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
    // Seleccionar la opción de "Crear tarea"
    cy.get('.dropdown-toggle').click()
    cy.get('.dropdown-menu').contains('Crear tarea').click()
    // Escribir el nombre de la tarea en el campo de texto
    cy.get('.form-control').type('Tarea de prueba')
    //Enviar
    cy.get('.btn').contains('Enviar').click()
    // Escribir la descripción de la tarea en el campo de texto
    cy.get('.form-control').eq(1).type('Descripción de prueba')
    // Elegir prioridad "BAJA"
    cy.get('.form-select').select('BAJA')
    // Elegir el tipo "BUG"
    cy.get('.form-select').eq(1).select('BUG')
    // Escribir 1 para los puntos de historia
    cy.get('.form-control').eq(2).type('1')
    // Escribir 1 para las horas estimadas
    cy.get('.form-control').eq(3).type('1')
    // Escribir 0 para las horas reales
    cy.get('.form-control').eq(4).type('0')
    // Seleccionar el usuario que esté hasta arriba en la lista
    cy.get('.form-select').eq(2).select('Usuario 1')
    // Seleccionar el sprint que esté hasta arriba en la lista
    cy.get('.form-select').eq(3).select('Sprint 1')
    
  })
})