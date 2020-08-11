import babelParser from "@babel/parser";
import fs from "fs";
import PropTypes from "prop-types";

const buildSitemap = (fileName, buildPath) => {
  //open component
  //if component does not exist, throw warning and skip.
  //read through jsx
  //find the 'router', 'browserrouter', or 'switch' element.
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
