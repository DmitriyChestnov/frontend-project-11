import onChange from 'on-change';

const watchedState = (data, form) => onChange(data, (path) => {
  const inputField = document.querySelector('#url-input');
  if (path === 'linksCount') {
    form.reset();
    form.querySelector('input').focus();
    if (inputField.classList.contains('is-invalid')) {
      inputField.classList.remove('is-invalid');
    }
  } else {
    inputField.classList.add('is-invalid');
  }
});

export default watchedState;
