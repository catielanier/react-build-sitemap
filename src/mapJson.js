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

export default mapJson;
