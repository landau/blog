'use strict';

const React = require('react');
const Layout = require('./layout.jsx');
const Footer = require('./footer.jsx');

//<!-- Page Header -->
//<!-- Set your background image for this header on the line below. -->

//

class Header extends React.Component {
  render() {
    return (
      <header className="intro-header" style={{'background-image': 'url(\'img/home-bg.jpg\')'}}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
              <div className="site-heading">
                <h1>Clean Blog</h1>
                <hr className="small"/>
                <span className="subheading">A Clean Blog Theme by Start Bootstrap</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

class ArticlePreview extends React.Component {
  render() {
    return (
      <div className="post-preview">
        <a href="post.html">
          <h2 className="post-title">
            Man must explore, and this is exploration at its greatest
          </h2>
          <h3 className="post-subtitle">
            Problems look mighty small from 150 miles up
          </h3>
        </a>
        <p className="post-meta">
          Posted by
          <a href="#">Start Bootstrap</a>
          on September 24, 2014
        </p>
      </div>
    );
  }
}
// use <hr> to separate Article Preview

class ArticlePreviewList extends React.Component {
  render() {
    let articles = this.props.articles.map((a) => <ArticlePreview article={a}/>);

    return (
      <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
        {articles}
        <ul className="pager">
          <li className="next">
            <a href="#">Older Posts &rarr;</a>
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
        <Header/>
        <div className="container">
          <div className="row">
            <ArticlePreviewList articles={this.props.articles}/>
          </div>
        </div>
        <hr/>
        <Footer/>

      </Layout>
    );
  }
}

module.exports = Home;
