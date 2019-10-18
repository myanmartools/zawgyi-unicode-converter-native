// tslint:disable-next-line: no-implicit-dependencies
import { browser, logging } from 'protractor';

import { AppPage } from './app.po';

describe('workspace-project App', () => {
    let page: AppPage;

    beforeEach(() => {
        page = new AppPage();
    });

    it('should display title text', () => {
        // tslint:disable-next-line: no-floating-promises
        page.navigateTo();

        // tslint:disable-next-line: no-floating-promises
        expect(page.getTitleText()).toEqual('Zawgyi Unicode Converter');
    });

    afterEach(async () => {
        // Assert that there are no errors emitted from the browser
        const logs = await browser.manage().logs().get(logging.Type.BROWSER);
        // tslint:disable-next-line: no-object-literal-type-assertion
        expect(logs).not.toContain(jasmine.objectContaining({
            level: logging.Level.SEVERE,
        } as logging.Entry));
    });
});
