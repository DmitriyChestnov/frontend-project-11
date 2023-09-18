import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import ru from './locales/ru.js';
import render from './view.js';
import parser from './parser.js';

const trackingUpdate = (state, url, feedId) => {
  const modifiedUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  const iter = () => {
    axios.get(modifiedUrl)
      .then((response) => parser(state, response.data, 'existing', feedId))
      .catch((err) => console.error(err))
      .then(() => setTimeout(() => iter(), 5000));
  };
  setTimeout(() => iter(), 5000);
};

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    resources: {
      ru,
    },
  });

  const state = {
    fields: {
      url: '',
    },
    feeds: [],
    posts: [],
    newFeedId: '',
    error: '',
    parsingErrors: [],
    addedUrls: [],
    trackingPosts: [],
    viewedPost: '',
  };
  const form = document.querySelector('form.rss-form');
  const watchedState = onChange(state, render(state, form, i18nInstance));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    state.fields.url = url;

    yup.setLocale({
      mixed: {
        notOneOf: i18nInstance.t('errors.addedRss'),
        default: 'field_invalid',
      },
      string: {
        url: i18nInstance.t('errors.invalidUrl'),
      },
    });
    const schema = yup.object().shape({
      url: yup.string().url().nullable().notOneOf(state.addedUrls),
    });
    schema.validate(state.fields)
      .then(() => {
        const modifiedUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
        return axios.get(modifiedUrl);
      })
      .then((response) => {
        const id = uniqueId();
        parser(watchedState, response.data, 'new', id);
        return id;
      })
      .then((id) => {
        watchedState.newFeedId = id;
        state.addedUrls.push(url);
        trackingUpdate(watchedState, url, id);
      })
      .catch((err) => {
        watchedState.error = err;
      });
  });
};
