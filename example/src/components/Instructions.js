import React, { Component } from 'react';

const Modal = require('react-bootstrap').Modal;
const Button = require('react-bootstrap').Button;

class Instructions extends Component {
	constructor(props) {
		super(props);
		this.state = {showModal: false};
		this.close = this.close.bind(this);
		this.open = this.open.bind(this);
	}

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  render() {
    return (
      <div id="footer">
        <Button bsStyle="warning" onClick={this.open}>Instructions</Button>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Instructions</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              <li><b>Adding requests</b>: click "Add Request" to add a request which will fire unconditionally. The order you add requests is the order they will fire in.</li>
              <li><b>Using previous values as params in your requests</b>: prefix params with <em>n</em> tildes (~) to refer back <em>n</em> results. For example, <code>login=~~hello.world</code> would pass the value of <code>hello.world</code> from two requests prior as the value of <code>login</code>.</li>
              <li><b>Conditional requests</b>: you can have requests which only fire if some conditions are met. To add a conditional request, click 'Add Conditions' next to a request to specify conditions which determine whether that request fires or not. Type the number <emph>n</emph> of the request it depends upon. Conditions are specified like <code>key0.key1 = val</code> or <code>key0.key1 != val</code>; respectively, the request will only fire if the value of <code>key0.key1</code> of request <emph>n</emph> was <code>val</code>, or the value of <code>key0.key1</code> of request <emph>n</emph> was not <code>val</code>. You can use <code>AND</code> for logical AND, and <code>OR</code> for logical OR in conditions, disambiguating with parens (if you od not use parens, <code>AND</code> has higher operator precedence than <code>OR</code>). If you click "Add Conditions" again, you can add conditions which depend on another previous request. The request will only fire if the conditions evaluate to true for every previous request which a request depends on. Currently the only supported operators are <code>=</code> and <code>!=</code>. If you want more, please implement it and make a pull request.</li>
              <li><b>Zooming in and out</b>: use <code>ctrl shift =</code> to zoom in, and <code>ctrl -</code> to zoom out.</li>
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <a href="https://rbcgithub.fg.rbc.com/ziv0/postmen">Check Postmen out on Git!</a>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export {Instructions};