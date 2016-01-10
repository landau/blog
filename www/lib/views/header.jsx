'use strict';

const React = require('react');
const _ = require('lodash');

class Header extends React.Component {
  onChangeHed(e) {
    this.props.onChangeHed(e.target.value);
  }

  onChangeDek(e) {
    this.props.onChangeDek(e.target.value);
  }

  renderEdit() {
    return (
      <div className="site-heading">
        <h1><input type="text" onChange={this.onChangeHed} value={this.props.title}/></h1>
        <hr className="small"/>
        <span className="subheading">
          <input type="text" onChange={this.onChangeDek} value={this.props.subtitle}/>
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

Header.defaultProps = {isLive: true, onChangeHed: _.noop, onChangeDek: _.noop};
module.exports = Header;
