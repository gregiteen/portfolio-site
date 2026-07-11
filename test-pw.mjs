import { chromium } from 'playwright';
async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<h1>Hello World</h1>');
  await page.pdf({ path: 'test.pdf' });
  await browser.close();
  console.log("Success");
}
run().catch(console.error);
