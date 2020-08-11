import babelParser from "@babel/parser";
import fs from "fs";
import PropTypes from "prop-types";
import { warn } from "console";
import mapJson from "./src/mapJson";

const buildSitemap = (fileName, buildPath, url) => {
  const sitemapElements = [
    '<?xml version="1.0" encoding="UTF-8?">',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  //if component does not exist, throw warning and skip.
  if (fileName === undefined || fileName === null) {
    throw new warn("Component does not exist to generate sitemap. Skipping.");
  }
  //read through jsx
  const jsxTree = JSON.stringify(
    babelParser.parse(fileName, {
      sourceType: "module",
      plugins: ["babel-plugin-transform-react-jsx"],
    })
  );
  //find the 'router', 'browserrouter', or 'switch' element.
  const router = mapJson(jsxTree);
  //if the above elements exist, map through all routes.
  if (router !== undefined) {
    router.forEach((item) => {
      console.log(item);
    });
  }
  //if does not exist, throw a warning saying it doesn't exist and skip running.
  if (router === undefined) {
    throw new warn(
      "The component you passed has no router to iterate through. Skipping."
    );
  }
  //generate xml file string.
  sitemapElements.push("</urlset>");
  const xml = sitemapElements.join("");
  //write sitemap.xml file to build path.
  fs.writeFile(`${buildPath}/sitemap.xml`, xml);
};

buildSitemap.propTypes = {
  fileName: PropTypes.string,
  buildPath: PropTypes.string,
  url: PropTypes.url,
};

import React from "react";

export default function BasicRouter() {
  return (
    <Router>
      <Route exact path="/" component={Home} />
    </Router>
  );
}

buildSitemap(BasicRouter, "./src/", "https://coreylanier.com");

export default buildSitemap;
