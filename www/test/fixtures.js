'use strict';

exports.article = {
  id: 'fakeid',
  hed: 'hed',
  dek: 'dek',
  body: '#body',
  tags: ['foo', 'bar'],
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  published: false
};

exports.publishedArticle = {
  id: 'fakeid2',
  hed: 'hed',
  dek: 'dek',
  body: '#body',
  tags: ['foo', 'bar'],
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  published: true,
  uri: 'foo-to-the-bar'
};
