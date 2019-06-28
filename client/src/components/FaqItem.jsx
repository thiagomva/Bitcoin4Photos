import React, { Component } from 'react';
import Collapse from 'react-bootstrap/Collapse';

export default class FaqItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  render() {
    const { open } = this.state;
    return (
    <div className={"col-md-12 faq-item " + (open ? 'open' : '')}>
      {open && <i className="fa fa-angle-up"></i>}
      {!open && <i className="fa fa-angle-right"></i>}
      <a onClick={() => this.setState({ open: !open })} className="btn btn-link" data-toggle="collapse" aria-expanded={open} aria-controls={"collapse"}>
        {this.props.question}
      </a>
      <Collapse in={this.state.open}>
        <div className="faq-content">
          {this.props.children}
        </div>
      </Collapse>  
    </div>);
  }
}