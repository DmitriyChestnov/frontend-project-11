import { differenceBy, uniqueId } from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';

import watcher from './view.js';
import ru from './locales/ru.js';
import parse from './parser.js';

const timeout = 5000;

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
    .trim()
    .required()
    .url()
    .notOneOf(urlsList);

  return schema.validate(url);
};

const createPosts = (watchedState, addedPosts, id) => {
  const newPosts = addedPosts.map((post) => ({ ...post, id: uniqueId(), feedId: id }));
  watchedState.posts = [...newPosts, ...watchedState.posts];
};

const updatesTracker = (watchedState) => {
  const { feeds, posts } = watchedState;
  const promises = feeds.map(({ url, id }) => axios.get(addProxy(url))
    .then(({ data }) => {
      const [, receivedPosts] = parse(data.contents);
      const oldPosts = posts.filter((post) => post.feedId === id);
      const addedPosts = differenceBy(receivedPosts, oldPosts, 'link');
      if (addedPosts.length !== 0) {
        createPosts(watchedState, addedPosts, id);
      }
    })
    .catch(console.error));
  Promise.all(promises)
    .finally(() => setTimeout(() => updatesTracker(watchedState), timeout));
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
    processState: 'filling',
    feeds: [],
    posts: [],
    valid: true,
    error: null,
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
  updatesTracker(watchedState);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.processState = 'filling';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urlsList = watchedState.feeds.map((feed) => feed.url);
    validateUrl(url, urlsList, i18n)
      .then((validUrl) => {
        watchedState.error = null;
        watchedState.processState = 'loading';
        return axios.get(addProxy(validUrl));
      })
      .then(({ data }) => {
        const [feed, posts] = parse(data.contents);
        const newFeed = { ...feed, id: uniqueId(), url };
        const newPosts = posts.map((post) => ({ ...post, id: uniqueId(), feedId: newFeed.id }));
        watchedState.feeds = [newFeed, ...watchedState.feeds];
        watchedState.posts = [...newPosts, ...watchedState.posts];
        watchedState.processState = 'success';
      })
      .catch((err) => {
        watchedState.valid = false;
        watchedState.error = err.message ?? 'defaultError';
        watchedState.processState = 'filling';
      });
  });

  elements.posts.addEventListener('click', (e) => {
    if (e.target.closest('button')) {
      const { id } = e.target.dataset;
      watchedState.uiState.visitedPosts.add(id);
      watchedState.uiState.modalId = id;
    }
    if (e.target.closest('a')) {
      const { id } = e.target.dataset;
      watchedState.uiState.visitedPosts.add(id);
    }
  });
};
