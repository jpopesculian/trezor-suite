// @group:suite
// @retry=2




describe('Dashboard', () => {
    beforeEach(() => {
        cy.task('stopEmu');

        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu', {
            needs_backup: true,
            mnemonic: 'all all all all all all all all all all all all',
        });
        cy.task('startBridge');

        cy.viewport(1080, 1440).resetDb();
        cy.prefixedVisit('/');
        cy.passThroughInitialRun();
    });

    afterEach(() =>{
        cy.task('stopEmu');

    });

    it('Discreet mode checkbox', () => {
      
               // disabled until discovery ends
        cy.discoveryShouldFinish();
        cy.getTestElement('@dashboard/security-card/discreet/button', { timeout: 30000 }).click();
        cy.wait(5000);
        cy.get('[class*="SecurityCard__CheckIconWrapper"]').should('exist');
       

    });

   
});
