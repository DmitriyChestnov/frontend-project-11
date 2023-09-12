import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import { v4 } from 'uuid';
import watchedState from './watcher';
import ru from './locales/ru';
import parse from './parser.js';

const validateUrl = (text, model, textLibrary) => {
  yup.setLocale({
    string: {
      url: textLibrary.t('urlError'),
      required: textLibrary.t('requiredError'),
    },
  });

  const schema = yup.string()
    .url()
    .required()
    .notOneOf(model.flows, textLibrary.t('notOneOfError'));
  return schema
    .validate(text)
    .then(() => null)
    .catch((e) => e.message);
};

const app = (textLib) => {
  const form = document.querySelector('form');
  const label = document.querySelector('label');
  label.innerHTML = textLib.t('label');
  const button = document.querySelector('.btn-lg');
  button.innerHTML = textLib.t('button');
  const btnSecondary = document.querySelector('.btn-secondary');
  btnSecondary.innerHTML = textLib.t('btnSecondary');
  const fullArticle = document.querySelector('.full-article');
  fullArticle.innerHTML = textLib.t('fullArticle');
  const display3 = document.querySelector('.display-3');
  display3.innerHTML = textLib.t('display3');
  const lead = document.querySelector('.lead');
  lead.innerHTML = textLib.t('lead');

  const state = {
    form: {
      error: null,
      valid: true,
    },
    flows: [],
    feeds: [],
    posts: [],
  };

  const watcher = watchedState(state, form, textLib);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputField = document.querySelector('#url-input');
    const url = inputField.value;
    validateUrl(url, watcher, textLib).then((err) => {
      if (err) {
        watcher.form = {
          error: err,
          valid: false,
        };
      } else {
        watcher.form = {
          error: null,
          valid: true,
        };
        watcher.flows.push(url);
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
          .then((response) => {
            const data = parse(response.data.contents);
            const newFeed = { id: v4(), title: data.title, description: data.description };
            watcher.feeds.push(newFeed);
            data.items.forEach((item) => {
              let newPost = { feedID: newFeed.id, id: v4() };
              newPost = Object.assign(item, newPost);
              watcher.posts.push(newPost);
            });
          })
          .catch((error) => {
            alert(error);
          });
      }
    });
  });
};

const outerApp = () => {
  const i18nextInstance = i18n.createInstance();

  return i18nextInstance
    .init({
      lng: 'ru',
      debug: true,
      resources: {
        ru,
      },
    })
    .then(() => app(i18nextInstance));
};

export default outerApp();
