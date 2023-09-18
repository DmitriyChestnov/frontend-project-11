import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';

import ru from './locales/ru.js';
import render from './view.js';
import parser from './parser.js';

const validateUrl = (url, listUrls) => {
  const schema = yup.string()
    .required()
    .url()
    .notOneOf(listUrls);
  return schema.validate(url);
};

const addProxy = (url) => {
  const urlProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlProxy.searchParams.set('url', url);
  urlProxy.searchParams.set('disableCache', 'true');
  return urlProxy.toString();
};

const updateTracker = (state, url, feedId) => {
  const modifiedUrl = addProxy(url);
  const iter = () => {
    axios.get(modifiedUrl)
      .then((response) => {
        parser(state, response.data, 'existing', feedId);
      })
      .catch((err) => console.log(err))
      .then(() => setTimeout(() => iter(), 5000));
  };
  iter();
};

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    resources: {
      ru,
    },
  });

  const elements = {
    form: document.querySelector('form'),
    submit: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    inputField: document.getElementById('url-input'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    openFull: document.querySelector('.full-article'),
  };

  const state = {
    url: '',
    feeds: [],
    posts: [],
    newFeedId: '',
    error: '',
    parsingErrors: [],
    addedUrls: [],
    trackingPosts: [],
    viewedPost: '',
  };
  // извлекаем форму
  // const form = document.querySelector('form.rss-form');
  // Вешаем контроллер
  const watchedState = onChange(state, render(state, elements, i18nInstance));
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    state.url = url;

    yup.setLocale({
      mixed: {
        notOneOf: i18nInstance.t('errors.addedRss'),
        default: 'field_invalid',
      },
      string: {
        url: i18nInstance.t('errors.invalidUrl'),
      },
    });

    validateUrl(state.url, state.addedUrls)
      .then(() => {
        elements.submit.disabled = true;
        elements.inputField.setAttribute('readonly', true);
        const newUrl = addProxy(url);
        return axios.get(newUrl);
      })
      .then((response) => {
        const id = uniqueId();
        parser(watchedState, response.data, 'new', id);
        return id;
      })
      .then((id) => {
        watchedState.newFeedId = id;
        state.addedUrls.push(url);
        updateTracker(watchedState, url, id);
      })
      .catch((err) => {
        watchedState.error = err;
      });
  });
};
