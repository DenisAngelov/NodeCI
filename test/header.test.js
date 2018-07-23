const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("Header contains logo title", async () => {
  // const text = await page.$eval("a.brand-logo", el => el.innerHTML);
  const brandText = await page.getContents("a.brand-logo");
  expect(brandText).toEqual("Blogster");
});

test("Log in flow redirects to google", async () => {
  await page.click(".right a");

  const url = await page.url();

  expect(url).toMatch(/accounts.google.com/);
});

test("Logout button appears after login", async () => {
  await page.login();
  const logoutText = await page.getContents(".right a[href='/auth/logout']");
  expect(logoutText).toEqual("Logout");
});
