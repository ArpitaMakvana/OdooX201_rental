describe('Standard user authentication and RBAC', () => {
  it('logs in and lands on the user dashboard', () => {
    cy.loginAs('user')
    cy.location('pathname').should('eq', '/dashboard')
    cy.get('[data-testid="user-dashboard-stats"]').should('be.visible')
  })

  it('can browse and request a rental', () => {
    cy.loginAs('user')
    cy.get('[data-testid="nav-user-browse"]').click()
    cy.get('[data-testid="browse-rentals-grid"]').should('be.visible')
    cy.get('[data-testid^="request-rental-"]').first().click()
  })

  it('is redirected to 403 when attempting to access an admin route', () => {
    cy.loginAs('user')
    cy.visit('/admin/users')
    cy.location('pathname').should('eq', '/403')
    cy.get('[data-testid="forbidden-page"]').should('be.visible')
  })

  it('shows a validation error on failed login', () => {
    cy.visit('/login')
    cy.get('[data-testid="login-branch"]').select('gandhinagar')
    cy.get('[data-testid="login-identifier"]').type('devon@example.com')
    cy.get('[data-testid="login-password"]').type('wrong-password')
    cy.get('[data-testid="login-submit"]').click()
    cy.get('[data-testid="login-error"]').should('be.visible')
  })
})
