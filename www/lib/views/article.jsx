'use strict';

const React = require('react');
const Layout = require('./layout.jsx');
const Header = require('./header.jsx');
const Footer = require('./footer.jsx');
const moment = require('moment');
const toHtml = require('../utils').toHtml;

// Can I give h2s a section-heading class
// Images with an img-responsive class
// image captions are  <span className="caption text-muted">

class Article extends React.Component {
  render() {
    return (
      <Layout>
        <Header title={this.props.article.hed} subtitle={this.props.article.dek}/>
        <article>
          <div className="container">
            <div className="row">
              <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1" dangerouslySetInnerHTML={{__html: toHtml(this.props.article.body) }}></div>
            </div>
          </div>
        </article>
        <Footer/>
      </Layout>
    );
  }
}

module.exports = Article;
