'use strict';

const React = require('react');
const Layout = require('./layout.jsx');
const Header = require('./header.jsx');
const Footer = require('./footer.jsx');
const TagList = require('./tags.jsx');
const _ = require('lodash');

class ArticleCreated extends React.Component {
  render() {
    const article = this.props.article
    const CONTENT_CLASSNAMES = 'col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1';

    return (
      <Layout title={article.hed}>
        <article>
          <div className="container">
            <div className="row">
              <div className={CONTENT_CLASSNAMES}>
                <TagList tags={article.tags}/>
                <hr/>
              </div>

              <div className={CONTENT_CLASSNAMES}>
                <div className="alert alert-success" role="alert">Article Created</div>
                <div className="alert alert-info" role="alert">
                  <a href={`/admin/post/${article.id}?live=true`} className="alert-link">View Live Version</a>
                </div>
                <hr/>
                <div className="alert alert-info" role="alert">
                  <a href={`/admin/post/${article.id}`} className="alert-link">Edit this post</a>
                </div>
                <hr/>
                <div className="alert alert-info" role="alert">
                  <a href={`/admin/post`} className="alert-link">New post</a>
                </div>
              </div>

              <div className={CONTENT_CLASSNAMES}>
                <hr/>
                <TagList tags={article.tags}/>
              </div>
            </div>
          </div>
        </article>
        <Footer/>
      </Layout>
    );
  }
}

module.exports = ArticleCreated
