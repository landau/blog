'use strict';

const React = require('react');
const _ = require('lodash');

class Tag extends React.Component {
  render() {
    return (
      <li role="presentation">
        <a href={`/tags/${this.props.tag}`}>
          <span className="badge">{this.props.tag}</span>
        </a>
      </li>
    );
  }
}

class TagList extends React.Component {
  render() {
    const tags = this.props.tags.map((t) => <Tag tag={t} key={t}/>);

    return (
      <ul className="nav nav-pills" role="tablist">
        <li>
          <h4>Tags</h4>
        </li>
        {tags}
      </ul>
    );
  }
}

module.exports = TagList;
