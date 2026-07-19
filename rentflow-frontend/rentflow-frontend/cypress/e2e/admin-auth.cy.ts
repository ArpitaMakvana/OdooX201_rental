describe('Admin authentication and RBAC', () => {
  it('logs in and lands on the admin operations dashboard', () => {
    cy.loginAs('admin')
    cy.location('pathname').should('eq', '/admin')
    cy.get('[data-testid="admin-dashboard-stats"]').should('be.visible')
  })

  it('can navigate to User Management and Configuration', () => {
    cy.loginAs('admin')
    cy.get('[data-testid="nav-admin-users"]').click()
    cy.get('[data-testid="users-table"]').should('be.visible')

    cy.get('[data-testid="nav-admin-configuration"]').click()
    cy.get('[data-testid="config-hourly-rate"]').should('be.visible')
  })

  it('updates the hourly late fee rate and sees the policy preview update', () => {
    cy.loginAs('admin')
    cy.visit('/admin/configuration')
    cy.get('[data-testid="config-hourly-rate"]').clear().type('20')
    cy.get('[data-testid="preview-late-fine"]').should('contain.text', '60.00')
    cy.get('[data-testid="config-save"]').click()
  })

  it('redirects unauthenticated visitors away from admin routes', () => {
    cy.visit('/admin')
    cy.location('pathname').should('eq', '/login')
  })
})
