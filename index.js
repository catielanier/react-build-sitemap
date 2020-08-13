import babelParser from "@babel/parser";
import fs from "fs";
import PropTypes from "prop-types";
import { warn } from "console";

const buildSitemap = (fileName, buildPath, url) => {
  // check for file type (typescript/javascript)
  const typescriptCheck = /\.(tsx|ts)$/;
  const javascriptCheck = /\.(jsx|js)$/;
  let fileType;
  if (typescriptCheck.exec(fileName)) {
    fileType = "tsx";
  }
  if (javascriptCheck.exec(fileName)) {
    fileType = "jsx";
  }
  if (!fileType) {
    throw new warn(
      "The passed file is neither Javascript nor Typescript. Skipping."
    );
  }
  const jsxFile = fs.readFileSync(fileName, "utf8");
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
    babelParser.parse(jsxFile, {
      sourceType: "unambiguous",
      plugins: [fileType],
    })
  );
  const jsxObj = JSON.parse(jsxTree);
  let functionIndex = -1;
  jsxObj.program.body.forEach((item, index) => {
    if (item.declaration !== undefined) {
      if (item.declaration.type === "FunctionDeclaration") {
        functionIndex = index;
      }
    }
  });
  if (functionIndex === -1) {
    throw new warn(
      "There is no function declaration in this file: Perhaps it is not a React Component? Skipping."
    );
  }
  const returnIndex = jsxObj.program.body[
    functionIndex
  ].declaration.body.body.findIndex((x) => x.type === "ReturnStatement");
  console.log(returnIndex);
  console.log(
    jsxObj.program.body[functionIndex].declaration.body.body[returnIndex]
      .argument.openingElement.name.name
  );
  if (returnIndex === -1) {
    throw new warn(
      "There is no return statement in this file: Have you written any JSX? Skipping."
    );
  }
  const renderJson = [
    jsxObj.program.body[functionIndex].declaration.body.body[returnIndex]
      .argument,
  ];
  // find the 'router', 'browserrouter', or 'switch' element.
  const mapJson = (json) => {
    json.forEach((item) => {
      //check for router in the item name.
      if (
        item.openingElement.name.name === "Router" ||
        item.openingElement.name.name === "BrowserRouter" ||
        item.openingElement.name.name === "Switch"
      ) {
        //if it exsits, return it.
        router = item.children;
      }
      //if it doesn't, check for children
      if (router === undefined && item.children && item.children.length > 0) {
        //if it has children, rerun the function on the children
        mapJson(item.children);
      }
    });
  };
  let router;
  mapJson(renderJson);

  console.log(router);
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
