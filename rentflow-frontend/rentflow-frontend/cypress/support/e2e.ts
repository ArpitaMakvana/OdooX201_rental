/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'admin' | 'user'): Chainable<void>
    }
  }
}

const CREDENTIALS = {
  admin: { branch: 'main-branch', identifier: 'admin@rentflow.io', password: 'admin123' },
  user: { branch: 'gandhinagar', identifier: 'devon@example.com', password: 'user123' },
}

Cypress.Commands.add('loginAs', (role: 'admin' | 'user') => {
  const creds = CREDENTIALS[role]
  cy.visit('/login')
  cy.get('[data-testid="login-branch"]').select(creds.branch)
  cy.get('[data-testid="login-identifier"]').type(creds.identifier)
  cy.get('[data-testid="login-password"]').type(creds.password)
  cy.get('[data-testid="login-submit"]').click()
})

export {}
