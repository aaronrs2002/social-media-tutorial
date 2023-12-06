const SaveTheme = (whichTheme) => {
    localStorage.setItem("theme", whichTheme);
    document
      .querySelector("link[data-bootswatch='true']")
      .setAttribute("href", whichTheme);
  }

  export default SaveTheme;