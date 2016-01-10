'use strict';

const React = require('react');
const Layout = require('./layout.jsx');
const Header = require('./header.jsx');
const Footer = require('./footer.jsx');
const moment = require('moment');
const toHtml = require('../utils').toHtml;
const _ = require('lodash');

// Can I give h2s a section-heading class
// Images with an img-responsive class
// image captions are  <span className="caption text-muted">

const CONTENT_CLASSNAMES = 'col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1';

class Article extends React.Component {
  onContentChange (e) {
    this.props.onContentChange(e.target.value);
  }

  onPublish (e) {
    this.props.onPublish(e.target.value);
  }

  onChangeUri (e) {
    this.props.onChangeUri(e.target.value);
  }

  onSave (e) {
    this.props.onSave();
  }

  renderEdit () {
    // TODO: add tags

    let body = this.props.article.body;

    return (
      <Layout title={this.props.article.hed}>
        <Header title={this.props.article.hed} subtitle={this.props.article.dek} isLive={this.props.isLive}/>

        <article>
          <div className="container">
            <div className="row">
              <div className={`input-group ${CONTENT_CLASSNAMES}`}>
                <span className="input-group-addon">URI</span>
                <input type="text" className="form-control" placeholder="something" value={this.props.uri} onChange={this.onChangeUri}/>
              </div>

              <div className={`checkbox ${CONTENT_CLASSNAMES}`}>
                <label><input type="checkbox" checked={this.props.article.published} onChange={this.onPublish} /> Published</label>
              </div>
            </div>
            <hr/>
            <div className="row">
              <textarea rows="20" className={CONTENT_CLASSNAMES} onChange={this.onContentChange} defaultValue={body}></textarea>
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={this.onSave}>Save</button>
        </article>
        <Footer/>
      </Layout>
    );
  }
  renderLive () {
    const html = {
      __html: toHtml(this.props.article.body)
    };

    return (
      <Layout title={this.props.article.hed}>
        <Header title={this.props.article.hed} subtitle={this.props.article.dek} onContentChange={this.props.onContentChange} onChangeUri={this.props.onChangeUri} onPublish={this.props.onPublish}/>
        <article>
          <div className="container">
            <div className="row">
              <div className={CONTENT_CLASSNAMES} dangerouslySetInnerHTML={html}></div>
            </div>
          </div>
        </article>
        <Footer/>
      </Layout>
    );
  }

  render () {
    return this.props.isLive ? this.renderLive() : this.renderEdit();
  }
}

Article.defaultProps = [
  'onSave',
  'onContentChange',
  'onPublish',
  'onChangeUri'
].reduce((props, methodName) => {
  props[methodName] = _.noop;
  return props;
}, {});

Article.defaultProps.isLive = true;
module.exports = Article;
