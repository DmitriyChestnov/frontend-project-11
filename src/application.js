import { differenceBy, uniqueId } from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';

import watcher from './view.js';
import ru from './locales/ru.js';
import parse from './parser.js';

const addProxy = (url) => {
  const newUrl = new URL('https://allorigins.hexlet.app/get');
  const searchUrl = encodeURI(url);
  newUrl.searchParams.set('disableCache', 'true');
  newUrl.searchParams.set('url', searchUrl);
  return newUrl;
};

const validateUrl = (url, urlsList, i18n) => {
  yup.setLocale({
    string: {
      url: i18n.t('errors.notValidUrl'),
    },
    mixed: {
      required: i18n.t('errors.required'),
      notOneOf: i18n.t('errors.notUniqueUrl'),
    },
  });

  const schema = yup.string()
    .required()
    .url()
    .notOneOf(urlsList);

  return schema.validate(url);
};

const updatesTracker = (watchedState) => {
  const { feeds, posts } = watchedState;
  const promises = feeds.map(({ url, id }) => axios.get(addProxy(url))
    .then(({ data }) => {
      const [, receivedPosts] = parse(data.contents);
      const oldPosts = posts.filter((post) => post.feedId === id);
      const addedPosts = differenceBy(receivedPosts, oldPosts, 'link');
      if (addedPosts.length !== 0) {
        const newPosts = addedPosts.map((post) => ({ ...post, id: uniqueId(), feedId: id }));
        watchedState.posts = [...newPosts, ...posts];
      }
    })
    .catch(console.error));
  Promise.all(promises)
    .finally(() => setTimeout(() => updatesTracker(watchedState), 5000));
};

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      footer: document.querySelector('.modal-footer'),
    },
  };

  const state = {
    rssForm: {
      processState: 'filling',
      error: null,
      valid: true,
    },
    feeds: [],
    posts: [],
    uiState: {
      visitedPosts: new Set(),
      modalId: null,
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

  const watchedState = watcher(state, elements, i18n);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.rssForm.processState = 'filling';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urlsList = watchedState.feeds.map((feed) => feed.url);
    validateUrl(url, urlsList, i18n)
      .then((validUrl) => {
        watchedState.rssForm.error = null;
        watchedState.rssForm.processState = 'processing';
        return axios.get(addProxy(validUrl));
      })
      .then(({ data }) => {
        const [feed, posts] = parse(data.contents);
        const newFeed = { ...feed, id: uniqueId(), url };
        const newPosts = posts.map((post) => ({ ...post, id: uniqueId(), feedId: newFeed.id }));
        watchedState.feeds = [newFeed, ...watchedState.feeds];
        watchedState.posts = [...newPosts, ...watchedState.posts];
        watchedState.rssForm.processState = 'success';
      })
      .catch((err) => {
        watchedState.rssForm.valid = err.name !== 'ValidationError';
        if (err.name === 'ValidationError') {
          watchedState.rssForm.error = err.message;
        } else if (err.NotValidRss) {
          watchedState.rssForm.error = 'errors.notValidRss';
        } else if (axios.isAxiosError(err)) {
          watchedState.rssForm.error = 'errors.network';
        }
        watchedState.rssForm.processState = 'filling';
      });
  });

  elements.posts.addEventListener('click', ({ target }) => {
    if (target.closest('a')) {
      const { id } = target.dataset;
      watchedState.uiState.visitedPosts.add(id);
    }
    if (target.closest('button')) {
      const { id } = target.dataset;
      watchedState.uiState.visitedPosts.add(id);
      watchedState.uiState.modalId = id;
    }
  });

  setTimeout(() => updatesTracker(watchedState), 5000);
};
