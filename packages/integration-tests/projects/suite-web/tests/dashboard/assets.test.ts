// @group:suite
// @retry=2

describe('Dashboard', () => {
    beforeEach(() => {
        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu', {
            needs_backup: false,
            mnemonic: 'all all all all all all all all all all all all',
        });
        cy.task('startBridge');

        cy.viewport(1080, 1440).resetDb();
        cy.prefixedVisit('/');
        cy.passThroughInitialRun();
    });

    it('Assets', () => {
        // waiting until discovery finishes
        cy.discoveryShouldFinish();
        // opens btc account through assets table
        cy.contains('div[class*="AssetTable"]', 'Bitcoin').should('be.visible').click();
        //
    });
});
