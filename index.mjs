import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import fs from "fs";
import { minify } from "html-minifier";

const MAX = 120;
let i = 114;
/* https://stackoverflow.com/questions/48608119/javascript-remove-all-occurrences-of-a-value-from-an-array */
async function removeItem(array, item) {
  var i = array.length;

  while (i--) {
    if (array[i] === item) {
      array.splice(array.indexOf(item), 1);
    }
  }
}

(async () => {
  if (process.argv[2]) {
    if (process.argv[2] == "--clean") {
      for (let i = 0; i <= MAX; i++) {
        fs.unlinkSync("assets/level-" + i + ".json");
      }
      return;
    }
  }

  // for (let i = 0; i <= MAX; i++) {
  if (fs.existsSync("assets/level-" + i + ".json")) {
    console.log("assets/level-" + i + ".json already exists. Skipping...");
    // continue;
  } else {
    const response = await fetch(
      "http://backrooms-wiki.wikidot.com/level-" + i
    );
    const data = await response.text();
    let dom;
    dom = new JSDOM(data);
    console.clear();

    const levelData = await {
      title: dom.window.document
        .querySelector("#page-title")
        .textContent.toString()
        .replaceAll("\n", "")
        .replaceAll("  ", ""),
      description: dom.window.document
        .querySelector("#page-content")
        .textContent.replaceAll(
          "\n",
          `
`
        ),
      images: [],
      exits: dom.window.document
        .evaluate(
          "//span[text()='Exits']",
          dom.window.document,
          null,
          dom.window.XPathResult.ANY_TYPE,
          null
        )
        .iterateNext()
        .parentElement.nextElementSibling.textContent.split("\n")
        .filter((el) => el !== ""),
      entrances: [
        dom.window.document
          .evaluate(
            "//span[text()='Entrances']",
            dom.window.document,
            null,
            dom.window.XPathResult.ANY_TYPE,
            null
          )
          .iterateNext()
          .parentElement.nextElementSibling.textContent.split("\n")
          .filter((el) => el !== ""),
      ],
    };
    dom.window.document
      .querySelector("#page-content")
      .querySelectorAll("img")
      .forEach((img) => {
        img.removeAttribute("style");
        levelData.images.push({
          src: img.getAttribute("src"),
          alt: img.getAttribute("alt"),
        });
        img.remove();
      });
    console.log(levelData.title);
    fs.writeFile(
      "assets/level-" + i + ".json",
      JSON.stringify(levelData),
      (err) => {
        if (err) return console.log("ERROR: " + err);
      }
    );
  }
  // }
})();
