import babelParser from "@babel/parser";
import fs from "fs";
import PropTypes from "prop-types";
import { warn } from "console";

const buildSitemap = (fileName, buildPath) => {
  //open component
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
  const routerIndex = jsxTree.findIndex(
    (x) =>
      x.name.name === "Router" ||
      x.name.name === "BrowserRouter" ||
      x.name.name === "Switch"
  );
  // TODO: work on logic for finding router nested in elements.
  //if the above elements exist, map through all routes.
  //if does not exist, throw a warning saying it doesn't exist and skip running.
  //generate xml file string.
  //write sitemap.xml file to build path.
};

buildSitemap.propTypes = {
  fileName: PropTypes.string,
  buildPath: PropTypes.string,
};

export default buildSitemap;
