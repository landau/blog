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
      <div>

        <ul className="nav nav-pills" role="tablist">
          <li><h3>Tags</h3></li>
          {tags}
        </ul>
        <hr/>
      </div>
    );
  }
}

module.exports = TagList;
