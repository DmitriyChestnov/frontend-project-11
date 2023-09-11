import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import watchedState from './watcher';

const validateUrl = (text, model) => {
  const schema = yup.string()
    .url('Please enter a valid URL')
    .required('URL is required')
    .notOneOf(model.links, 'This URL is already in the base');
  return schema
    .validate(text)
    .then(() => null)
    .catch((e) => e.message);
};

const app = () => {
  const form = document.querySelector('form');
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
    validateUrl(url, watcher).then((err) => {
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

app();
