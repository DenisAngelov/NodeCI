const mongoose = require("mongoose");
const Blog = mongoose.model("Blog");

const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("can see create article form", async () => {
    const formFirstLabel = await page.getContents("form label");
    expect(formFirstLabel).toEqual("Blog Title");
  });

  describe("and using valid inputs", async () => {
    beforeEach(async () => {
      await page.type(".title input", "My Title");
      await page.type(".content input", "My Content");
      await page.click("form button");
    });

    test("submitting takes a user to review screen", async () => {
      const previewTitle = await page.getContents("h5");
      expect(previewTitle).toEqual("Please confirm your entries");
    });

    test("submitting and saving adds a blog to index page", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const title = await page.getContents(".card .card-title");
      const content = await page.getContents(".card p");

      expect(title).toEqual("My Title");
      expect(content).toEqual("My Content");

      const lastArticle = await Blog.find({})
        .sort({ createdAt: -1 })
        .limit(1)
        .then(articles => {
          articles[0].remove();
        });
    });
  });

  describe("and using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });

    test("the test form shows an error message", async () => {
      const titleError = await page.getContents(".title .red-text");
      const contentError = await page.getContents(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("When users is not logged in", async () => {
  const actions = [
    {
      method: "get",
      path: "/api/blogs"
    },
    {
      method: "post",
      path: "/api/blogs",
      data: {
        title: "My Fetch Title",
        content: "My Fetch Content"
      }
    }
  ];

  test("article actions are prohibited", async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: "You must log in!" });
    }
  });

  //   test("user can't create articles", async () => {
  //     const result = await page.post("/api/blogs", {
  //       title: "My Fetch Title",
  //       content: "My Fetch Content"
  //     });

  //     expect(result).toEqual({ error: "You must log in!" });
  //   });

  //   test("user can't retrieve blogs", async () => {
  //     const result = await page.get("/api/blogs");

  //     expect(result).toEqual({ error: "You must log in!" });
  //   });
});
