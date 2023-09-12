import onChange from 'on-change';

const watchedState = (state, form, textLib) => onChange(state, (path, value) => {
  const inputField = document.querySelector('#url-input');
  if (path === 'error') {
    inputField.classList.add('is-invalid');
  }
  if (path === 'flows') {
    form.reset();
    form.querySelector('input').focus();
    if (inputField.classList.contains('is-invalid')) {
      inputField.classList.remove('is-invalid');
    }
  }
  if (path === 'feeds') {
    const feedsContainer = document.querySelector('.feeds');
    if (feedsContainer.childNodes.length === 0) {
      const div11 = document.createElement('div');
      div11.classList.add('card', 'border-0');
      const div12 = document.createElement('div');
      div12.classList.add('card-body');
      const feedsTitle = document.createElement('h2');
      feedsTitle.classList.add('card-title', 'h4');
      feedsTitle.innerHTML = textLib.t('feedsTitle');
      div12.appendChild(feedsTitle);
      div11.appendChild(div12);
      const ul1 = document.createElement('ul');
      ul1.classList.add('list-group', 'border-0', 'rounded-0');
      div11.appendChild(ul1);
      feedsContainer.appendChild(div11);
    }

    const feedEl = document.createElement('li');
    const lastFeed = value[value.length - 1];
    feedEl.id = lastFeed.id;
    feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.innerHTML = lastFeed.title;
    const feedDescr = document.createElement('p');
    feedDescr.classList.add('m-0', 'small', 'text-black-50');
    feedDescr.innerHTML = lastFeed.description;
    feedEl.appendChild(feedTitle);
    feedEl.appendChild(feedDescr);
    const feedUl = feedsContainer.querySelector('ul');
    feedUl.appendChild(feedEl);
  }
  if (path === 'posts') {
    const postsContainer = document.querySelector('.posts');
    if (postsContainer.childNodes.length === 0) {
      const div21 = document.createElement('div');
      div21.classList.add('col-md-10', 'col-lg-8', 'order-1', 'mx-auto', 'posts');
      const div22 = document.createElement('div');
      div22.classList.add('card', 'border-0');
      const div3 = document.createElement('div');
      div3.classList.add('card-body');
      const postsTitle = document.createElement('h2');
      postsTitle.classList.add('card-title', 'h4');
      postsTitle.innerHTML = textLib.t('postsTitle');
      div3.appendChild(postsTitle);
      div22.appendChild(div3);
      div21.appendChild(div22);
      const ul2 = document.createElement('ul');
      ul2.classList.add('list-group', 'border-0', 'rounded-0');
      div22.appendChild(ul2);
      postsContainer.appendChild(div21);
    }

    const postEl = document.createElement('li');
    const lastPost = value[value.length - 1];
    postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const link = document.createElement('a');
    link.href = lastPost.link;
    link.setAttribute('class', 'fw-bold');
    link.setAttribute('data-id', `${lastPost.id}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = lastPost.title;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', `${lastPost.id}`);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.innerHTML = textLib.t('btnSm');
    postEl.appendChild(link);
    postEl.appendChild(button);
    const postUl = postsContainer.querySelector('ul');
    postUl.appendChild(postEl);
  }
});

export default watchedState;
