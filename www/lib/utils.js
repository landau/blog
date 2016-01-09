'use strict';

const commonmark = require('commonmark');
const reader = new commonmark.Parser();
const writer = new commonmark.HtmlRenderer();

exports.toHtml = (md) => {
  return writer.render(reader.parse(md));
};
