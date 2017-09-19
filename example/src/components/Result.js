import React, { Component } from 'react';

class Result extends Component {
  render() {
    let json = this.props.json;
    return (
      <div className="result">
        <pre>
          {json === null ? '' : JSON.stringify(json, undefined, 2)}
        </pre>
      </div>
    );
  }
}

export {Result};