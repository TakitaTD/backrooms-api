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

  for (let i = 0; i <= MAX; i++) {
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

      const window = dom.window;
      function getBadFormattedText(text) {
        const elements = Array.from(
          window.document.querySelector("#page-content").childNodes
        );
        let element = elements.find((el) => el.textContent === text);
        let returnData = [];
        if (!element) {
          element = elements.find(
            (el) => el.textContent === text.replace(":", "")
          );
        }
        while (element.nextSibling.nodeName !== "HR") {
          element.textContent
            .split("\n")
            .filter((el) => el !== "")
            .filter((el) => el !== " ")
            .forEach((e) => returnData.push(e));
          element = element.nextSibling;
        }
        return returnData;
      }
      console.clear();

      console.log("Entrances:", getBadFormattedText("Entrances:"));

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
        exits: getBadFormattedText("Exits:"),
        entrances: getBadFormattedText("Entrances:"),
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
  }
})();
