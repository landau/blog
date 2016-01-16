'use strict';

const React = require('react');
const Layout = require('./layout.jsx');
const Header = require('./header.jsx');
const Footer = require('./footer.jsx');
const TagList = require('./tags.jsx');
const _ = require('lodash');

class ArticleCreated extends React.Component {
  render() {
    const CONTENT_CLASSNAMES = 'col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1';
    const STATUS_CODE = this.props.statusCode;

    return (
      <Layout title={STATUS_CODE}>
        <article>
          <div className="container">
            <div className="row">
              <div className={CONTENT_CLASSNAMES}>
                <TagList tags={this.props.tags}/>
                <hr/>
              </div>

              <div className={CONTENT_CLASSNAMES}>
                <h2>{STATUS_CODE} | {this.props.message}</h2>
              </div>

              <div className={CONTENT_CLASSNAMES}>
                <hr/>
                <TagList tags={this.props.tags}/>
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
