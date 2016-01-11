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
  renderEdit () {
    // TODO: add tags
    // TODO: add form
    // TODO: disable changing uri
    const article = this.props.article;

    let action = '/admin/post';

    if (article.id) {
      action = `${action}/${article.id}`;
    }

    return (
      <Layout title={article.hed}>
        <form method="post" action={action}>
          <Header title={article.hed} subtitle={article.dek} isLive={this.props.isLive}/>
          <article>
            <div className="container">
              <div className="row">
                <div className={`btn-group`}>
                  <button type="submit" className="btn btn-primary btn-sm">Save</button>
                </div>
                <div className={`input-group ${CONTENT_CLASSNAMES}`}>
                  <span className="input-group-addon">URI</span>
                  <input type="text" className="form-control" placeholder="something" defaultValue={article.uri} name="uri" />
                </div>

                <div className={`checkbox ${CONTENT_CLASSNAMES}`}>
                  <label><input type="checkbox" defaultChecked={article.published} name="published" /> Published</label>
                </div>
              </div>
              <hr/>
              <div className="row">
                <textarea rows="20" className={CONTENT_CLASSNAMES} defaultValue={article.body} name="body"></textarea>
              </div>
              <div className="row">
                <div className={`btn-group`}>
                  <button type="submit" className="btn btn-primary btn-sm">Save</button>
                </div>
              </div>
            </div>
          </article>
        </form>
        <Footer/>
      </Layout>
    );
  }
  renderLive () {
    const html = {
      __html: toHtml(this.props.article.body || '')
    };

    return (
      <Layout title={this.props.article.hed}>
        <Header title={this.props.article.hed} subtitle={this.props.article.dek} />
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

Article.defaultProps = { isLive: true };
module.exports = Article;
