const parser = (data) => {
  const parserDOM = new DOMParser();
  const dom = parserDOM.parseFromString(data, 'text/xml');

  const parseError = dom.querySelector('parsererror');
  if (parseError) {
    const error = new Error();
    error.isResource = true;
    throw error;
  }

  const title = dom.querySelector('channel > title');
  const titleText = title.textContent;
  const description = dom.querySelector('channel > description');
  const descriptionText = description.textContent;

  const itemElems = dom.querySelectorAll('item');
  const items = [...itemElems].map((item) => {
    const titleItem = item.querySelector('title');
    const titleItemText = titleItem.textContent;
    const linkItem = item.querySelector('link');
    const linkItemText = linkItem.textContent;
    const descrItem = item.querySelector('description');
    const descrItemText = descrItem.textContent;
    return { title: titleItemText, link: linkItemText, description: descrItemText };
  });
  return { title: titleText, description: descriptionText, items };
};

export default parser;
