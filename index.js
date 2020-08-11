import babelParser from "@babel/parser";
import fs from "fs";
import PropTypes from "prop-types";
import { warn } from "console";
import jsx from "jsx";
const buildSitemap = (fileName, buildPath, url) => {
  const sitemapElements = [
    '<?xml version="1.0" encoding="UTF-8?">',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  // if component does not exist, throw warning and skip.
  if (fileName === undefined || fileName === null) {
    throw new warn("Component does not exist to generate sitemap. Skipping.");
  }
  // read through jsx
  const jsxTree = JSON.stringify(
    babelParser.parse(`${fileName}`, {
      sourceType: "unambiguous",
      plugins: ["jsx"],
    })
  );
  // find the 'router', 'browserrouter', or 'switch' element.
  const mapJson = (json) => {
    json.map((item) => {
      //check for router in the item name.
      if (
        item.name.name === "Router" ||
        item.name.name === "BrowserRouter" ||
        item.name.name === "Switch"
      ) {
        //if it exsits, return it.
        return item;
      }
      //if it doesn't, check for children
      if (item.children && item.children.length > 0) {
        //if it has children, rerun the function on the children
        mapJson(item.children);
      }
    });
  };
  const router = mapJson(jsxTree);
  // if the above elements exist, map through all routes.
  if (router !== undefined) {
    router.forEach((item) => {
      console.log(item);
    });
  }
  // if does not exist, throw a warning saying it doesn't exist and skip running.
  if (router === undefined) {
    throw new warn(
      "The component you passed has no router to iterate through. Skipping."
    );
  }
  // generate xml file string.
  sitemapElements.push("</urlset>");
  const xml = sitemapElements.join("");
  // write sitemap.xml file to build path.
  fs.writeFile(`${buildPath}/sitemap.xml`, xml);
};

buildSitemap.propTypes = {
  fileName: PropTypes.string,
  buildPath: PropTypes.string,
  url: PropTypes.url,
};

buildSitemap("./src/BasicRouter.jsx", "./src/", "https://coreylanier.com");

export default buildSitemap;
