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
  const jsxTree = babelParser.parse(fileName, {
    sourceType: "module",
    plugins: ["jsx"],
  });
  //find the 'router', 'browserrouter', or 'switch' element.
  const router = mapJson(jsxTree);
  //if the above elements exist, map through all routes.
  if (router !== undefined) {
    router.forEach((item) => {
      console.log(item);
    });
  }
  //if does not exist, throw a warning saying it doesn't exist and skip running.
  //generate xml file string.
  //write sitemap.xml file to build path.
};

buildSitemap.propTypes = {
  fileName: PropTypes.string,
  buildPath: PropTypes.string,
  url: PropTypes.url,
};

export default buildSitemap;
