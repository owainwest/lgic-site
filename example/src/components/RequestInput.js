import React, { Component } from 'react';

const Button = require('react-bootstrap').Button;

class RequestInput extends Component {
  constructor(props) {
    super(props);
    this.onUrlChange = this.onUrlChange.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onParamChange = this.onParamChange.bind(this);
    this.onHeadersChange = this.onHeadersChange.bind(this);
    this.onConditionsChange = this.onConditionsChange.bind(this);
    this.onConditionsDelete = this.onConditionsDelete.bind(this);
  }

  onUrlChange(event) {
    this.props.onUrlChange(event, this.props.i);
  }

  onTypeChange(event) {
    this.props.onTypeChange(event, this.props.i);
  }

  onParamChange(event) {
    this.props.onParamChange(event, this.props.i);
  }

  onHeadersChange(event) {
    this.props.onHeadersChange(event, this.props.i);
  }

  onConditionsChange(event) {
    this.props.onConditionsChange(event, this.props.i);
  }

  onConditionsDelete(event) {
    this.props.onConditionsDelete(event, this.props.i);
  }

  render() {
    return (
      <div className="requestForm">
        <h4>Request {this.props.i}</h4>
        {this.props.conditions && this.props.conditions.map((condition, j) =>
          <h5 key={j}>Depends on {condition.number} - needs {condition.string}</h5>
        )}
        <input 
          className="requestUrl"
          type="text" 
          size={91}
          placeholder="Base URL" 
          onChange={this.onUrlChange} 
        />
        <select type="select" onChange={this.onTypeChange} className="typeSelect">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        <input 
          className="requestParameters"
          type="text"
          size={100}
          placeholder="Params (format: k0=v0,k1=v1,etc)"
          onChange={this.onParamChange}
        />
        <input 
          className="requestHeaders"
          type="text"
          size={100}
          placeholder="Headers (format: k0=v0,k1=v1,etc)"
          onChange={this.onHeadersChange}
        />
        { this.props.i > 0 &&
          <div>
            <Button bsStyle="primary" onClick={this.onConditionsChange}>Add Conditions</Button>
            <Button bsStyle="danger" onClick={this.onConditionsDelete}>Remove Conditions</Button>
          </div>
        }
        <hr />
      </div>
    );
  }
}

export {RequestInput};