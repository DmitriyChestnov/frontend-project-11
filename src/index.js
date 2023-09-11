import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import i18n from 'i18next';
import watchedState from './watcher';
import ru from './locales/ru';

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
    .notOneOf(model.links, textLibrary.t('notOneOfError'));
  return schema
    .validate(text)
    .then(() => null)
    .catch((e) => e.message);
};

const app = (textLib) => {
  const form = document.querySelector('form');
  const label = document.querySelector('label');
  label.innerHTML = textLib.t('label');
  const button = document.querySelector('button');
  button.innerHTML = textLib.t('button');

  const state = {
    form: {
      error: '',
      valid: true,
    },
    links: [],
    linksCount: 0,
  };

  const watcher = watchedState(state, form);

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
          error: '',
          valid: true,
        };
        watcher.links.push(url);
        watcher.linksCount += 1;
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

outerApp();
