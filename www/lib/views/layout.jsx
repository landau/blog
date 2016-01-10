'use strict';

const React = require('react');

class Nav extends React.Component {
  render() {
    return (
      <nav className="navbar navbar-default navbar-custom navbar-fixed-top">
        <div className="container-fluid">

          <div className="navbar-header page-scroll">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="index.html">{this.props.title || ''}</a>
          </div>

          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav navbar-right">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

class Head extends React.Component {
  _getTitle() {
    let title = 'Blog';

    if (this.props.title) {
      title = `${this.props.title} | ${title}`
    }

    return title;
  }

  render() {
    return (
      <head>
        <meta charSet="utf-8"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="description" content=""/>
        <meta name="author" content=""/>

        <title>{this._getTitle()}</title>

        <link href="/css/bootstrap.min.css" rel="stylesheet"/>
        <link href="/css/clean-blog.min.css" rel="stylesheet"/>

        <link href="http://maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet" type="text/css"/>
        <link href='http://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic' rel='stylesheet' type='text/css'/>
        <link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800' rel='stylesheet' type='text/css'/>
      </head>
    );
  }
}

class Layout extends React.Component {
  render() {
    return (
      <html lang="en">
        <Head title={this.props.title} />
        <body>
          <Nav/>
          {this.props.children}
        </body>
      </html>
    );
  }
}

module.exports = Layout;
