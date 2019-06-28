
import React, { Component } from 'react';
import { redirectToSignIn } from 'blockstack';
import Modal from 'react-bootstrap/Modal';

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.state = {
            showModal: false
        };
    }

    render() {
        var currentPage = null;
        if (this.props.location.search && this.props.location.search.length > 3) {
            currentPage = this.props.location.search.substring(3);
        }
        return (
            <div>
                <section className=" text-center">
                    <div className="container">
                        <div className="jumbotron login-box row">
                            <div className="col-sm-12 logo-login"><a href="/"><img src="images/Bitcoin4photo_Logo_T.png"></img></a></div>
                            <div className="col-sm-12"><button type="button" className="btn btn-primary" onClick={e => this.goToBlockstack(e, currentPage)}>Continue with Blockstack</button></div>
                            <div className="what-is-blockstack col-sm-12"><span onClick={e => this.setState({ showModal: true })}>What is Blockstack?</span></div>
                            <Modal show={this.state.showModal} onHide={this.handleCloseModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title>What is Blockstack?</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p>Blockstack is a new internet for decentralized apps that you access through the Blockstack Browser. With Blockstack, there is a new world of apps that let you own your data and maintain your privacy, security and freedom.</p>
                                    <p>Bitcoin4Photos is built on top of Blockstack, allowing us to provide decentralized encrypted photo storage.</p>
                                </Modal.Body>
                            </Modal>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    handleCloseModal() {
        this.setState({ showModal: false });
    }

    goToBlockstack(e, previousPage) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        var origin = window.location.origin;
        var page = (previousPage ? previousPage : origin);
        if (page.indexOf('?') > 0) {
            page += '&';
        } else {
            page += '?';
        }
        page += 'blockstacklogged=true';
        redirectToSignIn(page, origin + '/manifest.json', ['store_write', 'publish_data', 'email']);
    }
}
