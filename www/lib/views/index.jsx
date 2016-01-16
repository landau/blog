'use strict';

const React = require('react');
const Layout = require('./layout.jsx');
const Header = require('./header.jsx');
const Footer = require('./footer.jsx');
const TagList = require('./tags.jsx');

const moment = require('moment');
const toHtml = require('../utils').toHtml;

const CONTENT_CLASSNAMES = 'col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1';

class ArticlePreview extends React.Component {
  render() {
    const MAX_BODY_LEN = 120;
    let body = this.props.article.body;

    if (body.length > MAX_BODY_LEN) {
      body = `${body.slice(0, MAX_BODY_LEN - 3)}...`;
    }

    let url = `/post/${this.props.article.uri}`;

    if (!this.props.isLive) {
      url = `/admin/post/${this.props.article.id}`;
    }

    return (
      <div className="post-preview">
        <a href={url}>
          <h2 className="post-title">
            {this.props.article.hed}
          </h2>
          <h3 className="post-subtitle">
            {this.props.article.dek}
          </h3>
        </a>
        <p className="post-meta">
          Posted on
          {moment(this.props.article.modifiedAt).format('MMMM D, YYYY')}
        </p>
      </div>
    );
  }
}

class ArticlePreviewList extends React.Component {
  render() {
    let articles = this.props.articles.map((a) => <ArticlePreview article={a} key={a.id} isLive={this.props.isLive}/>).reduce((articles, article) => {
      return articles.concat(article, < hr key = {
        'hr' + article.props.article.id
      } />); // separate articles by hr
    }, []);

    return (
      <div>
        {articles}
      </div>
    );
  }
}

class Pager extends React.Component {
  render() {
    if (!this.props.hasNextPage) {
      return null;
    }

    return (
      <ul className="pager">
        <li className="next">
          <a href={`/?page=${this.props.nextPage}`}>Older Posts &rarr;</a>
        </li>
      </ul>
    );
  }
}

class Index extends React.Component {
  render() {

    return (
      <Layout>
        <Header title='Blog' subtitle='Random thoughts and such...'/>
        <div className="container">
          <div className="row">
            <div className={CONTENT_CLASSNAMES}>
              <TagList tags={this.props.tags}/>
              <hr/>
            </div>

            <div className={CONTENT_CLASSNAMES}>
              <ArticlePreviewList {...this.props}/>
              <Pager hasNextPage={this.props.hasNextPage} nextPage={this.props.nextPage}/>
            </div>            

            <div className={CONTENT_CLASSNAMES}>
              <hr/>
              <TagList tags={this.props.tags}/>
            </div>
          </div>
        </div>
        <hr/>
        <Footer/>
      </Layout>
    );
  }
}

module.exports = Index;
