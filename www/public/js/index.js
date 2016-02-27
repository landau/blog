'use strict';

function onDomReady(callback) {
  document.readyState === 'interactive' || document.readyState === 'complete' ? callback() : document.addEventListener('DOMContentLoaded', callback);
};

onDomReady(() => {
  var hed = document.querySelector('input[name=hed]');
  var uri = document.querySelector('input[name=uri]');
  console.log(hed, uri);

  document.addEventListener('keyup', (e) => {
    if (e.target === hed) {
      uri.value = hed.value.replace(/[\.,]/g, '').trim().replace(/\W+/g, '-').toLowerCase();
    }
  });
});
