const mapJson = (json) => {
  json.map((item) => {
    if (
      item.name.name === "Router" ||
      item.name.name === "BrowserRouter" ||
      item.name.name === "Switch"
    ) {
      return item;
    }
    mapJson(item.children);
  });
};

export default mapJson;
