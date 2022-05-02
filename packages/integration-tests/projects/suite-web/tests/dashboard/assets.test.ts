// @group:suite
// @retry=2
// 1. navigate to the `Dashboard` page
// 2. check the `Assets` part of the page
// 1. the modal is rendered correctly and shows 1-n coins
// 3. click on a coin name (eg `Bitcoin`)
// 1. user is transferred to a bitcoin account

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
    });
});
