import onChange from 'on-change';

const handleProcessState = (processState, elements, i18n) => {
  switch (processState) {
    case 'filling':
      elements.input.readOnly = false;
      elements.button.disabled = false;
      break;
    case 'loading':
      elements.input.readOnly = true;
      elements.button.disabled = true;
      break;
    case 'success':
      elements.input.readOnly = false;
      elements.button.disabled = false;
      elements.button.innerHTML = '';
      elements.button.textContent = 'Добавить';
      elements.form.reset();
      elements.form.focus();
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18n.t('success');
      break;
    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const handleModal = (elements, posts, modalWindowId) => {
  const post = posts.find(({ id }) => modalWindowId === id.toString());

  elements.modal.title.textContent = post.title;
  elements.modal.body.textContent = post.description;
  elements.modal.footer.firstElementChild.href = post.link;
};

const handleVisitedLinks = (setID) => {
  const currentVisitedID = [...setID.values()][setID.size - 1];
  const currentLink = document.querySelector(`[data-id="${currentVisitedID}"]`);
  currentLink.classList.replace('fw-bold', 'fw-normal');
  currentLink.classList.add('link-secondary');
};

const handleFeeds = (state, elements, i18n) => {
  elements.feeds.innerHTML = '';

  const divEl = document.createElement('div');
  divEl.classList.add('card', 'border-0');
  elements.feeds.append(divEl);

  const divTitleEl = document.createElement('div');
  divTitleEl.classList.add('card-body');
  divEl.append(divTitleEl);

  const h2El = document.createElement('h2');
  h2El.classList.add('card-title', 'h4');
  h2El.textContent = i18n.t('feeds');
  divTitleEl.append(h2El);

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');

  state.feeds.forEach((feed) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3El = document.createElement('h3');
    h3El.classList.add('h6', 'm-0');
    h3El.textContent = feed.title;
    liEl.append(h3El);

    const pEl = document.createElement('p');
    pEl.classList.add('m-0', 'small', 'text-black-50');
    pEl.textContent = feed.description;
    liEl.append(pEl);

    ulEl.prepend(liEl);
  });

  divEl.append(ulEl);
};

const handlePosts = (state, elements, i18n) => {
  elements.posts.innerHTML = '';
  const divEl = document.createElement('div');
  divEl.classList.add('card', 'border-0');
  elements.posts.prepend(divEl);

  const divTitleEl = document.createElement('div');
  divTitleEl.classList.add('card-body');
  divEl.append(divTitleEl);

  const h2El = document.createElement('h2');
  h2El.classList.add('card-title', 'h4');
  h2El.textContent = i18n.t('posts');
  divTitleEl.prepend(h2El);

  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  state.posts.forEach(({ id, title, link }) => {
    const classes = state.uiState.visitedPosts.has(id) ? 'fw-normal link-secondary' : 'fw-bold';
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const aEl = document.createElement('a');
    aEl.setAttribute('class', classes);
    aEl.setAttribute('href', link);
    aEl.dataset.id = id;
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = title;
    liEl.append(aEl);

    const buttonEl = document.createElement('button');
    buttonEl.setAttribute('type', 'button');
    buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonEl.dataset.id = id;
    buttonEl.dataset.bsToggle = 'modal';
    buttonEl.dataset.bsTarget = '#modal';
    buttonEl.textContent = i18n.t('button');
    liEl.append(buttonEl);

    ulEl.append(liEl);
  });
  divEl.append(ulEl);
};

const handleError = (error, elements, i18n) => {
  elements.feedback.textContent = '';
  if (error) {
    elements.input.readOnly = false;
    elements.button.disabled = false;
    elements.button.innerHTML = '';
    elements.button.textContent = 'Добавить';
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');

    if (error === 'notValidRss') {
      elements.feedback.textContent = i18n.t('errors.notValidRss');
      return;
    }
    if (error === 'Network Error') {
      elements.feedback.textContent = i18n.t('errors.network');
      return;
    }
    elements.feedback.textContent = i18n.t(error);
  }
};

export default (state, elements, i18n) => onChange(state, (path, value) => {
  switch (path) {
    case 'uiState.modalId':
      handleModal(elements, state.posts, value);
      break;
    case 'uiState.visitedPosts':
      handleVisitedLinks(value, state.posts);
      break;
    case 'feeds':
      handleFeeds(state, elements, i18n);
      break;
    case 'posts':
      handlePosts(state, elements, i18n);
      break;
    case 'error':
      handleError(value, elements, i18n);
      break;
    case 'processState':
      handleProcessState(value, elements, i18n);
      break;
    case 'valid':
      if (!value) {
        elements.input.classList.add('is-invalid');
        return;
      }
      elements.input.classList.remove('is-invalid');
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }
});
