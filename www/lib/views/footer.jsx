'use strict';

const React = require('react');
const moment = require('moment');

class Badge extends React.Component {
  render() {
    return (
      <li>
        <a href={this.props.href} target="_blank">
          <span className="fa-stack fa-lg">
            <i className="fa fa-circle fa-stack-2x"></i>
            <i className={`fa fa-${this.props.icon} fa-stack-1x fa-inverse`}></i>
          </span>
        </a>
      </li>
    );
  }
}

class Footer extends React.Component {
  render() {
    return (
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
              <p className="text-center"></p>
              
              <p className="copyright text-muted">
                <a href="/">Home</a> | Copyright &copy; Trevor Landau {moment().format('YYYY')}
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

module.exports = Footer;
