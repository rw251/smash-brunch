// const { expect } = require('chai');

// describe('sample test', () => {
//   let page;

//   before(async () => {
//     page = await browser.newPage();
//     await page.goto('http://localhost:7674');
//   });

//   after(async () => {
//     await page.close();
//   });

//   it('should have the correct page title', async () => {
//     expect(await page.title()).to.eql('SMASH');
//   });

//   it('should have a heading', async () => {
//     const HEADING_SELECTOR = 'h1';
//     let heading;

//     await page.waitFor(HEADING_SELECTOR);
//     heading = await page.$eval(HEADING_SELECTOR, h => h.innerText);

//     expect(heading).to.eql('SMASH');
//   });

//   it('should have a single content section', async () => {
//     const BODY_SELECTOR = '#mainContent';

//     await page.waitFor(BODY_SELECTOR);

//     expect(await page.$$(BODY_SELECTOR)).to.have.lengthOf(1);
//   });
// });
