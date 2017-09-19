import React, { Component } from 'react';

class ProxySetup extends Component {
  constructor(props) {
    super(props);
    this.onUserChange = this.onUserChange.bind(this);
    this.onPassChange = this.onPassChange.bind(this);
  }
  
  onUserChange(event) {
    this.props.onAuthChange(event, 'user');
  }

  onPassChange(event) {
    this.props.onAuthChange(event, 'pass');
  }

  render() {
    return (
      <div className="authInput">
        <input 
          type="text" 
          id="userInput"
          size={50}
          placeholder="username for proxy"
          onChange={this.onUserChange}
        />
        <input 
          type="password" 
          id="passInput"
          size={50}
          placeholder="password for proxy"
          onChange={this.onPassChange}
        />
        <br/>
        <hr/>
      </div>
    );
  }
}

export {ProxySetup};