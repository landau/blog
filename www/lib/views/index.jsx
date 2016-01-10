'use strict';

const React = require('react');
const Layout = require('./layout.jsx');
const Header = require('./header.jsx');
const Footer = require('./footer.jsx');
const moment = require('moment');
const toHtml = require('../utils').toHtml;

class ArticlePreview extends React.Component {
  render() {
    const MAX_BODY_LEN = 120;
    let body = this.props.article.body;

    if (body.length > MAX_BODY_LEN) {
      body = `${body.slice(0, MAX_BODY_LEN - 3)}...`;
    }

    return (
      <div className="post-preview">
        <a href={`/post/${this.props.article.uri}`}>
          <h2 className="post-title">
            {this.props.article.hed}
          </h2>
          <h3 className="post-subtitle">
            {this.props.article.dek}
          </h3>
        </a>
        <p className="post-meta">
          Posted on {moment(this.props.article.modifiedAt).format('MMMM D, YYYY')}
        </p>
      </div>
    );
  }
}

class ArticlePreviewList extends React.Component {
  render() {
    let articles = this.props.articles
      .map((a) => <ArticlePreview article={a} key={a.id}/>)
      .reduce((articles, article) => {
        return articles.concat(article, <hr key={'hr' + article.props.article.id} />); // separate articles by hr
      }, []);

    return (
      <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
        {articles}
        <ul className="pager">
          <li className="next">
            <a href={`/?page=${this.props.nextPage}`}>Older Posts &rarr;</a>
          </li>
        </ul>
      </div>
    );
  }
}

class Home extends React.Component {
  render() {
    return (
      <Layout>
        <Header title='Blog' subtitle='Random thoughts and such...'/>
        <div className="container">
          <div className="row">
            <ArticlePreviewList articles={this.props.articles} nextPage={this.props.nextPage}/>
          </div>
        </div>
        <hr/>
        <Footer/>
      </Layout>
    );
  }
}

module.exports = Home;
