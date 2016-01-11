'use strict';

const React = require('react');
const _ = require('lodash');

class Header extends React.Component {
  renderEdit() {
    return (
      <div className="site-heading">
        <h1><input type="text" defaultValue={this.props.title} name="hed"/></h1>
        <hr className="small"/>
        <span className="subheading">
          <input type="text" defaultValue={this.props.subtitle} name="dek"/>
        </span>
      </div>
    );
  }

  renderLive() {
    return (
      <div className="site-heading">
        <h1>{this.props.title}</h1>
        <hr className="small"/>
        <span className="subheading">{this.props.subtitle}</span>
      </div>
    );
  }

  render () {
    const style = {'backgroundImage': 'url(\'/img/home-bg.jpg\')'};

    return (
      <header className="intro-header" style={style}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
              {this.props.isLive ? this.renderLive(): this.renderEdit()}
            </div>
          </div>
        </div>
      </header>
    );
  }
}

Header.defaultProps = {isLive: true};
module.exports = Header;
