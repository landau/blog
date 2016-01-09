'use strict';

const React = require('react');

class Header extends React.Component {
  render() {
    return (
      <header className="intro-header" style={{'background-image': 'url(\'/img/home-bg.jpg\')'}}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
              <div className="site-heading">
                <h1>{this.props.title}</h1>
                <hr className="small"/>
                <span className="subheading">{this.props.subtitle}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

module.exports = Header;
