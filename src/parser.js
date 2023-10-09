export default (data) => {
  const doc = new DOMParser().parseFromString(data, 'application/xml');
  const parseError = doc.querySelector('parsererror');

  if (parseError) {
    const error = new Error('notValidRss');
    error.isParsingError = true;
    error.data = data;
    throw error;
  }

  const feed = {
    title: doc.querySelector('channel title').textContent,
    description: doc.querySelector('channel description').textContent,
  };

  const arrItems = Array.from(doc.querySelectorAll('item'));
  const posts = arrItems.map((item) => (
    {
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }
  ));
  return [feed, posts];
};
