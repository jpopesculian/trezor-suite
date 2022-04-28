// eslint-disable @typescript-eslint/naming-convention
// @group:suite
// @retry=2

describe('Stories of bug report forms', () => {
    beforeEach(() => {
        cy.task('startEmu', { wipe: true, version: '2.4.3' });
        cy.task('setupEmu', { mnemonic: 'all all all all all all all all all all all all' });

        cy.task('startBridge');
        cy.viewport(1080, 1440).resetDb();
        cy.prefixedVisit('/');
    });

    afterEach(() => {
        cy.task('stopEmu');
    });

    it(`Open Report form, fill bug report, submit report`, () => {
        // goes to feedback
        cy.getTestElement('@guide/button-open', { timeout: 20000 }).click();
        cy.getTestElement('@guide/panel').should('exist');
        cy.getTestElement('@guide/button-feedback').click();
        cy.getTestElement('@guide/feedback/bug').click();

        // gets first input in dropdown
        cy.get('[class^=Select__Wrapper]').click();
        cy.get('[id=react-select-2-option-0]').click();

        // writes into  field
        cy.getTestElement('@guide/feedback/suggestion-form').type(
            'Henlo this is testy test writing hangry test user report',
        );

        // submits angry Franta User report
        cy.getTestElement('@guide/feedback/submit-button').click();
        // cy.getTestElement('@toast/user-feedback-send-success').should('be.visible'); is NOT present in localhost versions
        cy.getTestElement('@guide/feedback/submit-button').should('not.exist');
    });
});
