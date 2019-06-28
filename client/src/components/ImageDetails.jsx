import React, { Component } from 'react';
import Axios from 'axios';
import {
    isUserSignedIn,
    lookupProfile,
    Person,
    loadUserData
  } from 'blockstack';
import { server_url, open_node_url } from '../config.js';
import BrowserCategories from './BrowserCategories.jsx';
import { server_error, success, confirm } from '../sweetAlert.js';
import { Util } from '../util.js';
import ImageManager from '../image.js';

export default class ImageDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            image: null,
            isLoading: true,
            imageUsername: props.match.params.username,
            imageId: props.match.params.imageId,
            person: null,
            deleting: false
        };
    }

    render() {
        const { allCategories, handleSignIn } = this.props;
        var username = null;
        if (isUserSignedIn()) {
            username = loadUserData().username;
        }
        var image = this.state.image;
        var userImage = this.state.person && this.state.person.avatarUrl(); 
        return (
            <div>
                <div className="container image-details-container">
                    {this.state.isLoading && 
                        <div className="row">
                            <div className="col-md-12">Loading...</div>
                        </div>
                    }
                    {!this.state.isLoading &&
                        <div className="row">
                            <div className="col-md-6">
                                <div className="img-wrapper image-details-wrapper" style={{backgroundImage: (this.state.shownImage ? 'url('+this.state.shownImage+')' : "")}}>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="page-card card mb-4 image-details-card">                                
                                    <div className="card-body">
                                        <div className="image-title">
                                        {image.title}
                                        {image.owner && !this.state.deleting && <i className="clickable image-delete fa fa-trash ml-2" title="Delete photo" onClick={e => this.onClickDelete(e)}></i>}
                                        {image.owner && this.state.deleting && <i className="image-delete fa fa-refresh fa-spin ml-2" title="Deleting..."></i>}
                                        </div>
                                        <div className="image-category">{this.getCategoriesNames(image.categories)}</div>
                                        <div className="col-md-12">
                                            <div className=" row">
                                                { userImage ? <img src={userImage} className="user-avatar" /> : <i className="user-noavatar fa fa-user-circle mr-1"></i> }
                                                <div className="image-owner">By {this.state.person && this.state.person.name() ? this.state.person.name() : image.username.split('.')[0]}</div>
                                                { (!image.isPublic && (image.paid || image.owner)) ? <div className="image-owner-price">{'$' + Util.getFormattedPrice(image.price)}</div> : <div></div>}
                                            </div>
                                        </div>
                                        <hr></hr>
                                        <div className="col-md-12">
                                            <div className="row">
                                                {((image.height && image.width) || image.size || image.type) && <div className="col-md-12"><div className="row image-details">{this.getImageDescription(image)}</div></div>}
                                                {image.createdAt && <div className="col-md-12"><div className="row image-details">Uploaded at: {this.getImageDate(image)}</div></div>}
                                            </div>
                                        </div>
                                        <div className="col-md-12 image-details-footer">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <span className="image-details-share image-details-share-text">Share</span>
                                                    <a className="clickable image-details-share" title="Share on Twitter" rel="noopener noreferrer" onClick={e => this.onClickShare(e, this.getTwitterShareText())}><i className="fa fa-twitter"></i></a>
                                                    <a className="clickable image-details-share" title="Share on Facebook" rel="noopener noreferrer" onClick={e => this.onClickShare(e, this.getFacebookShareText())}><i className="fa fa-facebook"></i></a>
                                                    <div className=" pull-right">
                                                        <div className="btn image-details-btn" onClick={e => this.onDownloadClick(image)}>{this.getDownloadDescription(image)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <div className="image-browser-categories">
                    <BrowserCategories allCategories={allCategories} excludeCategories={[]}></BrowserCategories>
                </div>
            </div>
        );
    }

    onClickShare(e, link) {
        e.stopPropagation();
        e.preventDefault();
        var width  = 575,
        height = 400,
        left   = ($(window).width()  - width)  / 2,
        top    = ($(window).height() - height) / 2,
        opts   = 'status=1' +
                 ',width='  + width  +
                 ',height=' + height +
                 ',top='    + top    +
                 ',left='   + left;
        window.open(link, 'share', opts);
        return false;
    }

    getTwitterShareText() {
        return "https://twitter.com/share?text=Look this photo on Bitcoin4Photos&url=" + window.location.href;
    }

    getFacebookShareText() {
        return "https://www.facebook.com/sharer/sharer.php?u=" + window.location.href;
    }

    getImageDate(image) {
        var data = new Date(image.createdAt).toUTCString().split(' ');
        return data[0] + ' ' + data[1] + ' ' + data[2] + ' ' + data[3];
    }

    getImageDescription(image) {
        var description = "";
        if (image.height && image.width) {
            description += "Size: " + image.width + "px x " + image.height + "px";
        }
        if (image.size) {
            var value = image.size / 1024;
            var formattedValue = "";
            if (value > 1024) {
                formattedValue += (Math.round(value * 10 / 1024) / 10).toLocaleString() + "MB";
            } else {
                formattedValue = Math.round(value).toLocaleString() + "KB";
            }
            if (description) description += " - " + formattedValue;
            else description += "Size: " + formattedValue;
        }
        if (image.type) {
            if (description) description += " - " + image.type;
            else description += "Type: " + image.type;
        }
        return description;
    }

    onDownloadClick(image){
        if (this.state.shownImage) {
            if (image.isPublic || image.paid || image.owner) {
                ImageManager.getLargeFileUrl(image.id, image.username, image.imageKey).then((file) =>
                {
                    if (file) {
                        this.downloadFile(file, image.title, image.type);
                    }
                }).catch((err) => server_error(err));
            } else {
                this.buyImage(image);
            }
        }
    }

    downloadFile(urlContent, title, type){
        var link = document.createElement('a');
        link.download = this.getFileName(title, type);
        link.href = urlContent;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 0);
    }
    
    getFileName(title, type) {
        if (!type) {
            type = 'png';
        } else {
            type = type.toLowerCase();
        }
        var fileName = title.split(' ').join('_');
        var invalid = ['/','\\','|',':','*','?','>','<','"'];
        for (var i = 0; i < invalid.length; ++i) {
            fileName = fileName.split(invalid[i]).join('');
        }
        return fileName + '.' + type;
    }

    getDownloadDescription(image) {
        if (image.paid || image.owner) {
            return "Download";
        } else if (image.isPublic) {
            return "Free Download";
        } else {
            return "$" + Util.getFormattedPrice(image.price) + " Download";
        }
    }

    getCategoriesNames(categories){
        if (categories) {
            return categories.join(", ");
        }
        return "Others";
    }

    componentDidMount() {
      this.fetchData();
    }

    fetchData() {
        if (this.props.location.search == "?handler=openNode") {
            this.setState({ isLoading: true });
            var url = server_url + '/api/v1/payments/check';
            var config={headers:{}};
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
            Axios.post(url, {
                imageUsername: this.state.imageUsername,
                imageId: this.state.imageId
            }, config).then(response => {
                this.setState({image: response.data}, () => this.fetchImageAndProfile());
            }).catch((err) => server_error(err));
        } else {
            this.loadImage();
        }
    }

    loadImage(){
        var url = server_url + '/api/v1/images';
        url += '?username='+this.state.imageUsername;
        url += '&imageId='+this.state.imageId;
        var config={headers:{}};
        if (isUserSignedIn()) {
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
        }
        Axios.get(url, config).then(response => {
            if (response.data && response.data.length == 1) {
                var newState = {image:response.data[0]};
                this.setState(newState, () => this.fetchImageAndProfile());
            }
            else{
                server_error('Sorry, an error ocurred getting the requested image.');
                location = "/";
            }
        });
    }

    fetchImageAndProfile(){
        this.getImageToShow();
        this.getProfile();
        this.setState({isLoading: false});
    }

    getProfile(){
        var image = this.state.image;
        if (!this.state.person) {
            lookupProfile(image.username)
            .then((profile) => {
                var person = new Person(profile);
                this.setState({person:person});
            });
        }
    }

    getImageToShow() {
        var image = this.state.image;
        if (image && document) { 
            document.title = "Bitcoin4Photos - " + image.title + " by " + image.username;
        }
        ImageManager.getMediumFileUrl(image.id, image.username, image.imageKey).then((file) =>
        {
            this.setState({shownImage: file});
        }).catch((err) => server_error(err));
        if (isUserSignedIn() && image.paid && !image.isPublic && !image.owner) {
            ImageManager.savePurchase(this.state.image.id, this.state.image.username, this.state.image.imageKey).then(() => {}).catch((err) => server_error(err));
        }
    }

    onClickDelete(e) {
        if (!isUserSignedIn()) {
            this.props.handleSignIn();
            return;
        }
        this.setState({deleting: true});
        confirm("Are you sure that you want to delete the '" + this.state.image.title + "' photo?", (toDelete) => this.onModalToDeleteSelect(toDelete), false, null, 'Delete');
    }

    onModalToDeleteSelect(toDelete) {
        if (toDelete) {
            var url = server_url + '/api/v1/images/' + this.state.image.id;
            var config={headers:{}};
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
            Axios.delete(url, config).then(response => {
                ImageManager.delete(this.state.image.id, this.state.image.username, response.data).then(() =>
                {
                    this.setState({deleting: false});
                    success('Photo deleted.');
                    window.location.href = '/';
                }).catch((err) => 
                {
                    server_error(err);
                    this.setState({deleting: false});
                });  
            }).catch((err) => {
                server_error(err);
                this.setState({deleting: false});
            });
        } else {
            this.setState({deleting: false});
        }
    }

    buyImage(image){
        if (!isUserSignedIn()) {
            this.props.handleSignIn();
            return;
        }
        var url = server_url + '/api/v1/payments';
        var config={headers:{}};
        config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
        Axios.post(url, {
          imageUsername: image.username,
          imageId: image.id
        }, config).then(response => {
          if(response.data && response.data.id){
            window.location.href = open_node_url + response.data.id;
          } else {
            server_error();
          }
        }).catch((err) => server_error(err));
    }
}