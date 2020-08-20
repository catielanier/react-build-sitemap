const babelParser = require("@babel/parser");
//import babelParser from "@babel/parser";
import fs from "fs";
import PropTypes from "prop-types";

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
  if (fileType === undefined) {
    throw new Error(
      "The passed file is neither Javascript nor Typescript. Skipping."
    );
  }
  const plugins = ["jsx", "classProperties"];
  if (fileType === "tsx") {
    plugins.push("typescript");
  }
  const jsxFile = fs.readFileSync(fileName, "utf8");
  const sitemapElements = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  // if component does not exist, throw error and skip.
  if (fileName === undefined || fileName === null) {
    throw new Error("Component does not exist to generate sitemap. Skipping.");
  }
  // read through jsx
  const jsxTree = JSON.stringify(
    babelParser.parse(jsxFile, {
      sourceType: "unambiguous",
      plugins,
    })
  );
  const jsxObj = JSON.parse(jsxTree);
  jsxObj.program.body.forEach((item) => {
    if (item.declaration === undefined) {
      item.declaration = {
        type: "",
      };
    }
  });
  const functionObj = [];
  const classObj = [];
  jsxObj.program.body.forEach((item) => {
    if (
      item.declaration.type === "FunctionDeclaration" ||
      item.type === "FunctionDeclaration"
    ) {
      functionObj.push(item);
    }
    if (
      item.declaration.type === "ClassDeclaration" ||
      item.type === "ClassDeclaration"
    ) {
      classObj.push(item);
    }
    if (
      item.type === "VariableDeclaration" &&
      item.declarations[0].init.type === "ArrowFunctionExpression"
    ) {
      functionObj.push(item.declarations[0].init);
    }
  });
  if (functionObj.length === 0 && classObj.length === 0) {
    throw new Error(
      "There is no function declaration in this file: Perhaps it is not a React Component? Skipping."
    );
  }
  // find the 'router', 'browserrouter', or 'switch' element.
  const mapJson = (json) => {
    json.forEach((item) => {
      if (item.type === "ConditionalExpression") {
        if (item.consequent.type === "JSXFragment") {
          const children = item.consequent.children.filter(
            (x) => x.type === "JSX Element" || x.type === "JSXFragment"
          );
          mapJson(children);
        } else {
          //check for router in the item name.
          if (
            item.consequent.openingElement.name.name !== undefined &&
            (item.consequent.openingElement.name.name === "Router" ||
              item.consequent.openingElement.name.name === "BrowserRouter" ||
              item.consequent.openingElement.name.name === "Switch")
          ) {
            //if it exsits, filter it for only elements that are routes and return it.
            router = item.consequent.children.filter(
              (child) =>
                child.type === "JSXElement" &&
                child.openingElement.name.name === "Route"
            );
          }
        }
        //if it doesn't, check for children
        if (
          router === undefined &&
          item.consequent.children &&
          item.consequent.children.length > 0
        ) {
          //if it has children, rerun the function on the children that are actually elements
          const children = item.consequent.children.filter(
            (x) => x.type === "JSXElement" || x.type === "JSXFragment"
          );
          mapJson(children);
        }
      } else {
        if (item.type === "JSXFragment") {
          const children = item.children.filter(
            (x) => x.type === "JSX Element" || x.type === "JSXFragment"
          );
          mapJson(children);
        } else {
          //check for router in the item name.
          if (
            item.openingElement.name.name !== undefined &&
            (item.openingElement.name.name === "Router" ||
              item.openingElement.name.name === "BrowserRouter" ||
              item.openingElement.name.name === "Switch")
          ) {
            //if it exsits, filter it for only elements that are routes and return it.
            router = item.children.filter(
              (child) =>
                child.type === "JSXElement" &&
                child.openingElement.name.name === "Route"
            );
          }
        }
        //if it doesn't, check for children
        if (router === undefined && item.children && item.children.length > 0) {
          //if it has children, rerun the function on the children that are actually elements
          const children = item.children.filter(
            (x) => x.type === "JSXElement" || x.type === "JSXFragment"
          );
          mapJson(children);
        }
      }
    });
  };
  let router;
  const renderJson = [];
  if (functionObj.length > 0) {
    functionObj.forEach((obj) => {
      if (obj.type === "ArrowFunctionExpression") {
        if (obj.body.body === undefined) {
          return;
        }
        obj.body.body.forEach((item) => {
          if (item.type === "ReturnStatement") {
            renderJson.push(item.argument);
          }
        });
        return;
      }
      if (obj.declaration.type === "FunctionDeclaration") {
        obj.declaration.body.body.forEach((item) => {
          if (item.type === "ReturnStatement") {
            renderJson.push(item.argument);
          }
        });
      }
      if (obj.type === "FunctionDeclaration") {
        obj.body.body.forEach((item) => {
          if (item.type === "ReturnStatement") {
            renderJson.push(item.argument);
          }
        });
      }
    });
  }
  if (classObj.length > 0) {
    classObj.forEach((obj) => {
      let renderIndex;
      if (obj.declaration.type === "ClassDeclaration") {
        obj.declaration.body.body.forEach((item, index) => {
          if (item.key.name === "render") {
            renderIndex = index;
          }
        });
        if (renderIndex !== undefined) {
          obj.declaration.body.body[renderIndex].body.body.forEach((item) => {
            if (item.type === "ReturnStatement") {
              returnObj.push(item.argument);
            }
          });
        }
      }
      if (obj.type === "ClassDeclaration") {
        obj.body.body.forEach((item, index) => {
          if (item.key.name === "render") {
            renderIndex = index;
          }
        });
        if (renderIndex !== undefined) {
          obj.body.body[renderIndex].body.body.forEach((item) => {
            if (item.type === "ReturnStatement") {
              returnObj.push(item.argument);
            }
          });
        }
      }
    });
  }
  if (renderJson.length === 0) {
    throw new Error(
      "There is no return statement in this file: Have you written any JSX? Skipping."
    );
  }
  mapJson(renderJson);

  // if the above elements exist, map through all routes.
  if (router !== undefined) {
    router.forEach((item) => {
      const pathIndex = item.openingElement.attributes.findIndex(
        (x) => x.name.name === "path"
      );
      const newUrl = `<url>
      <loc>${url}${item.openingElement.attributes[pathIndex].value.value}</loc>
      </url>`;
      sitemapElements.push(newUrl);
    });
  }
  // if does not exist, throw an error saying it doesn't exist and skip running.
  if (router === undefined) {
    throw new Error(
      "The component you passed has no router to iterate through. Skipping."
    );
  }
  // generate xml file string.
  sitemapElements.push("</urlset>");
  const xml = sitemapElements.join("");
  // write sitemap.xml file to build path.
  fs.writeFile(`${buildPath}/sitemap.xml`, xml, (err) => {
    if (err) {
      console.error(`Error ❌: (react-build-sitemap) ${err}`);
    } else {
      console.log(
        `> ✔️ Sitemap successfully generated at ${buildPath}/sitemap.xml`
      );
    }
  });
};

buildSitemap.propTypes = {
  fileName: PropTypes.string,
  buildPath: PropTypes.string,
  url: PropTypes.string,
};

export default buildSitemap;
