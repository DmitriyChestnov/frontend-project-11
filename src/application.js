import onChange from 'on-change';
import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';

import ru from './locales/ru.js';
import render from './view.js';
import parser from './parser.js';

const updateTracker = (state, url, i18Inst, feedId) => {
  const modifiedUrl = `${i18Inst.t('proxy')}${encodeURIComponent(url)}`;
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

  const state = {
    fields: {
      url: '',
    },
    feeds: [],
    posts: [],
    newFeedId: '',
    error: '',
    addedUrls: [],
    trackingPosts: [],
    validity: '',
  };
  const rssForm = document.querySelector('form.rss-form');
  const watchedState = onChange(state, render(state, rssForm, i18nInstance));
  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    state.fields.url = url;

    const schema = yup.object().shape({
      url: yup.string().url().nullable().notOneOf(state.addedUrls),
    });
    schema.validate(state.fields)
      .then(() => {
        const modifiedUrl = `${i18nInstance.t('proxy')}${encodeURIComponent(url)}`;
        return axios.get(modifiedUrl);
      })
      .then((response) => parser(watchedState, response.data, 'new'))
      .then((id) => {
        watchedState.validity = 'valid';
        watchedState.newFeedId = id;
        state.validity = '';
        state.addedUrls.push(url);
        updateTracker(watchedState, url, i18nInstance, id);
      })
      .catch((err) => {
        watchedState.validity = 'invalid';
        state.validity = '';
        watchedState.error = err;
      });
  });
};
