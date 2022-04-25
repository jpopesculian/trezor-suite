/* eslint-disable @typescript-eslint/naming-convention */


// @group:suite
// @retry=2

describe('Stories of bug report forms', function () {
    beforeEach(function() {
        cy.task('startEmu', { wipe: true, version: '2.4.3' });
        cy.task('setupEmu', { mnemonic: 'all all all all all all all all all all all all' });
        cy.task('startBridge');

        cy.viewport(1080, 1440).resetDb();
        cy.prefixedVisit('/');

    });

    // todo: this test should fill report bug in Suite Guide
    it(`Open Report form, fill bug report, submit report`, function () {
        //goes to feedback
        cy.getTestElement('@guide/button-open', { timeout: 40000 }).click();
        cy.getTestElement('@guide/panel').should('exist');
        cy.getTestElement('@guide/button-feedback', { timeout : 10000 }).click();
        cy.getTestElement('@guide/feedback/bug').click();
      
       //gets first input in dropdown
        cy.get('[class^=Select__Wrapper]').click();
        cy.get('[id=react-select-2-option-0]').click();
        
        // writes into  field
        cy.getTestElement('@guide/feedback/suggestion-form').type('Henlo this is testy test writing hangry test user report');
       
        
        //submits angry Franta User report
        cy.getTestElement('@guide/feedback/submit-button').click();
        //cy.getTestElement('@toast/user-feedback-send-success').should('be.visible'); is NOT present in localhost versions
        cy.getTestElement('@guide/feedback/submit-button').should('not.exist');
    });

    afterEach(function() {
        cy.task('stopEmu');
    });
        

    
});
