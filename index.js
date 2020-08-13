import babelParser from "@babel/parser";
import fs from "fs";
import PropTypes from "prop-types";
import { warn } from "console";

// TODO: Test case #1: Sitemap generates more than one route. ✔️
// TODO: Test case #2: Router is nested inside of another element. ✔️
// TODO: Test case #3: Component has declarations in it before the return. ✔️
// TODO: Test case #4: Component is class-based. ✔️
// TODO: Test case #5: File has multiple components. ✔️
// TODO: Test case #6: File is a typescript file.
// TODO: Test case #7: export default is on the same line as the function declaration
// TODO: Test case #8: Class is not default exported on the same line as the declaration. ✔️
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
      plugins: [fileType, "classProperties"],
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
  let functionObj;
  let classObj;
  jsxObj.program.body.forEach((item) => {
    if (
      item.declaration.type === "FunctionDeclaration" ||
      item.type === "FunctionDeclaration"
    ) {
      functionObj = item;
    }
    if (
      item.declaration.type === "ClassDeclaration" ||
      item.type === "ClassDeclaration"
    ) {
      classObj = item;
    }
  });
  console.log(functionObj);
  if (functionObj === undefined && classObj === undefined) {
    throw new warn(
      "There is no function declaration in this file: Perhaps it is not a React Component? Skipping."
    );
  }
  // find the 'router', 'browserrouter', or 'switch' element.
  const mapJson = (json) => {
    json.forEach((item) => {
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
      //if it doesn't, check for children
      if (router === undefined && item.children && item.children.length > 0) {
        //if it has children, rerun the function on the children that are actually elements
        const children = item.children.filter((x) => x.type === "JSXElement");
        mapJson(children);
      }
    });
  };
  let router;
  let returnObj;
  let renderJson;
  if (functionObj !== undefined) {
    if (functionObj.declaration.type === "FunctionDeclaration") {
      functionObj.declaration.body.body.forEach((item) => {
        if (item.type === "ReturnStatement") {
          returnObj = item.argument;
        }
      });
    }
    if (functionObj.type === "FunctionDeclaration") {
      functionObj.body.body.forEach((item) => {
        if (item.type === "ReturnStatement") {
          returnObj = item.argument;
        }
      });
    }
  }
  if (classObj !== undefined) {
    let renderIndex;
    if (classObj.declaration.type === "ClassDeclaration") {
      classObj.declaration.body.body.forEach((item, index) => {
        if (item.key.name === "render") {
          renderIndex = index;
        }
      });
      classObj.declaration.body.body[renderIndex].body.body.forEach((item) => {
        if (item.type === "ReturnStatement") {
          returnObj = item.argument;
        }
      });
    }
    if (classObj.type === "ClassDeclaration") {
      classObj.body.body.forEach((item, index) => {
        if (item.key.name === "render") {
          renderIndex = index;
        }
      });
      classObj.body.body[renderIndex].body.body.forEach((item) => {
        if (item.type === "ReturnStatement") {
          returnObj = item.argument;
        }
      });
    }
  }
  if (returnObj === undefined) {
    throw new warn(
      "There is no return statement in this file: Have you written any JSX? Skipping."
    );
  }
  renderJson = [returnObj];
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
  url: PropTypes.url,
};

buildSitemap("./src/BasicRouter.jsx", "./src", "https://icloudhospital.com");
//buildSitemap("./src/ClassRouter.jsx", "./src", "https://icloudhospital.com");

export default buildSitemap;
