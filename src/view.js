const renderCommonParts = (type, i18n) => {
  const container = document.querySelector(`.${type}`);
  container.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');
  container.append(div);
  const cardBody = `<div class="card-body"><h2 class="card-title h4">${i18n.t(type)}</h2></div>`;
  div.innerHTML = cardBody;

  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  div.append(list);

  return list;
};

const renderPosts = (posts, list, direction) => {
  posts.forEach((post) => {
    const listEl = document.createElement('li');
    listEl.classList.add('list-group-item', 'd-flex', 'justify-content-between');
    listEl.classList.add('align-items-start', 'border-0', 'border-end-0');
    if (direction === 'append') {
      list.append(listEl);
    } else if (direction === 'prepend') {
      list.prepend(listEl);
    }

    const link = document.createElement('a');
    link.setAttribute('href', post.link);
    link.classList.add('fw-bold');
    link.dataset.id = post.id;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;
    listEl.append(link);
  });
};

export default (state, form, i18n) => (path, value, prevValue) => {
  if (path === 'validity') {
    const input = form.elements.url;
    if (value === 'invalid') {
      input.classList.add('is-invalid');
    } else if (value === 'valid') {
      input.classList.remove('is-invalid');
      form.reset();
      input.focus();
    }
  }
  if (path === 'feeds') {
    const list = renderCommonParts('feeds', i18n);
    state.feeds.forEach((feed) => {
      const listEl = document.createElement('li');
      listEl.classList.add('list-group-item', 'border-0', 'border-end-0');
      list.prepend(listEl);

      const title = document.createElement('h3');
      title.classList.add('h6', 'm-0');
      title.textContent = feed.title;
      listEl.append(title);

      const description = document.createElement('p');
      description.classList.add('m-0', 'small', 'text-black-50');
      description.textContent = feed.description;
      listEl.append(description);
    });
  }
  if (path === 'newFeedId' && !prevValue) {
    const list = renderCommonParts('posts', i18n);
    const { posts } = state;
    renderPosts(posts, list, 'append');
  }
  if (path === 'newFeedId' && prevValue) {
    const list = document.querySelector('.posts ul');
    const posts = state.posts.filter(({ feedId }) => value === feedId).reverse();
    renderPosts(posts, list, 'prepend');
  }
  if (path === 'trackingPosts') {
    const list = document.querySelector('.posts ul');
    const existingPosts = state.posts.map(({ id }) => id);
    const posts = state.trackingPosts.filter(({ id }) => !existingPosts.includes(id)).reverse();
    renderPosts(posts, list, 'prepend');
  }
};
