import React, { Component } from 'react';
import logo from './logo.svg';
import {Button, Modal, Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import courses from './courseList.js';

class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courses: courses
    };
  }

  render() {
    return (
      <div className="app">
        <div className="header">
          <Navbar />
          <h1>LGIC in Penn</h1>
        </div>
        <CourseList
          courses={this.state.courses}
        />
      </div>
    );
  }
}


class CourseList extends Component {
  constructor(props) {
    super(props);
    this.onCourseClick = this.onCourseClick.bind(this);
  }

  onCourseClick(event) {
    this.props.onCourseClick(event, this.props.courseNumber);
  }

  render() {
    return (
      <div className="courseList">
        <h2>Courses</h2>
        {this.props.courses && this.props.courses.map((course, j) => 
          <Course 
            number={course.number}
            name={course.name}
            description={course.description}
            onCourseClick={this.props.onCourseClick}
          />
        )}
      </div>
    );
  }
}

const Course = React.createClass ({
  getInitialState() {
    return {
      showModal: false
    };
  },  

  close() {
    this.setState({showModal: false});
  },

  open() {
    this.setState({showModal: true});
  },

  render() {
    const name = this.props.name;
    const number = this.props.number;
    const description = this.props.description;
    return (
      <div className="course" onClick={this.open}>
        <h4>{number} - {name}</h4>
        <Button
          onClick={this.open}
        />
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>{number} - {name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {description}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Back to Courses List</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});



const CourseModal = React.createClass ({
  getInitialState() {
    return {
      showModal: false
    };
  },

  close() {
    this.setState({showModal: false});
  },

  open() {
    this.setState({showModal: true});
  },

  render() {
    const name = this.props.name;
    const number = this.props.number;
    const description = this.props.description;
    return (
      <div className="courseModal">
        <Button
          bStyle="primary"
          onClick={this.open}
        />
       <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>{number} - {name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {description}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Back to Courses List</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

const NavBar = React.createClass({
  getInitialState() {
    return {};
  },

  render() {
    return (
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <p>Hello</p>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavItem eventKey={1} href="#">Link</NavItem>
            <NavItem eventKey={2} href="#">Link</NavItem>
            <NavDropdown eventKey={3} title="Dropdown" id="basic-nav-dropdown">
              <MenuItem eventKey={3.1}>Action</MenuItem>
              <MenuItem eventKey={3.2}>Another action</MenuItem>
              <MenuItem eventKey={3.3}>Something else here</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey={3.3}>Separated link</MenuItem>
            </NavDropdown>
          </Nav>
          <Nav pullRight>
            <NavItem eventKey={1} href="#">Link Right</NavItem>
            <NavItem eventKey={2} href="#">Link Right</NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
});

export default Page;