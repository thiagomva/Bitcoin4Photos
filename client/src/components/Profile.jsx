import React, { Component } from 'react';
import {
    isUserSignedIn,
    lookupProfile,
    Person,
    loadUserData
  } from 'blockstack';
import Axios from 'axios';
import { server_url } from '../config.js';
import Withdraw from './Withdraw.jsx';
import { server_error, success, confirm, error } from '../sweetAlert.js';
import { Util } from '../util.js';
import ImageManager from '../image.js';

export default class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            purchasesFileNames: [],
            images: [],
            isLoadingPurchases: true,
            isLoadingMyImages: true,
            deletingImageId: null
        }
    }

    render() {
        const { handleSignIn } = this.props;
        var username = null;

        var showMySales = location.hash.toLowerCase() == "#mysales";

        if(isUserSignedIn()){
            username = loadUserData().username;
        } else {
            handleSignIn();
            return;
        }
        return (
            <div>
                <div className="container">
                    <ul className="nav nav-tabs mt-4" id="myTab" role="tablist">
                        <li className="nav-item">
                            <a className={"nav-link" + (!showMySales?" active": "")} id="myPurchases-tab" data-toggle="tab" href="#myPurchases" role="tab" aria-controls="myPurchases">My Purchases</a>
                        </li>
                        <li className="nav-item">
                            <a className={"nav-link" + (showMySales?" active": "")} id="mySales-tab" data-toggle="tab" href="#mySales" role="tab" aria-controls="mySales">My Sales</a>
                        </li>
                    </ul>
                </div>
                <div className="tab-content profile-tabs">
                    <div className={"tab-pane" + (!showMySales?" active": "")}  id="myPurchases" role="tabpanel" aria-labelledby="myPurchases-tab">
                        <div className="container py-4">
                            {this.state.isLoadingPurchases && 
                                <div className="text-center">Loading...</div>
                            }
                            {!this.state.isLoadingPurchases && this.state.purchasesFileNames.length == 0 &&
                                <div className="text-center">You didn't buy any photo.</div>
                            }
                            {!this.state.isLoadingPurchases && this.getPurchaseImageData().map((metadata) => (
                                <div key={this.getPurchaseImageKey(metadata)} className="col-md-3 my-photo">
                                    <a className={"photo-category-card photo-category-card-sm card mb-2 no-hover "} 
                                        href={"/"+metadata.username+"/"+metadata.id}
                                        style={{backgroundImage: "url("+metadata.imageUrl+")"}}
                                        >
                                        <div className="image-content">
                                            <span className={!metadata.isPublic ? "price-label" : "free-label"}>
                                                {this.getPrice(metadata)}
                                            </span>
                                        </div>
                                    </a>
                                    <div>
                                        <div className="photo-title">{metadata.title}</div>
                                        <div className="photo-category">{this.getCategoriesNames(metadata.categories)}</div>
                                        <div className="btn btn-link-gray btn-sm pl-0" onClick={e => this.onDownloadClick(metadata, true)}>
                                            <i class="fa fa-download"></i>&nbsp;Download
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={"tab-pane" + (showMySales?" active": "")} id="mySales" role="tabpanel" aria-labelledby="mySales-tab">
                        <div className="container mb-4">
                            <Withdraw handleSignIn={ this.handleSignIn }></Withdraw>
                        </div>
                        <div className="uploaded-images py-2">
                            <div className="container">
                                <div className="profile-tabs-title">History { this.isLoadingHistory() && <i className="fa fa-refresh fa-spin"></i>}</div>
                                <div className="row py-4">
                                    {this.state.isLoadingMyImages && 
                                        <div className="col-12">Loading...</div>
                                    }
                                    {!this.state.isLoadingMyImages && this.state.images.length == 0 &&
                                        <div className="col-12">You didn't upload any photo.</div>
                                    }
                                    {this.state.images.map((image) => (
                                        this.state[this.getMyImageKey(image.id)] && 
                                        <div key={this.getMyImageKey(image.id)} className="col-md-3 my-photo mb-5">
                                            <a className={(!!image.deactivationDate ? "deleted-photo" : "") +" photo-category-card photo-category-card-sm card mb-2 no-hover"}
                                                href={!image.deactivationDate ? "/"+username+"/"+image.id : '/profile#mySales'}
                                                disabled={!!image.deactivationDate}
                                                style={{backgroundImage: "url("+this.state[this.getMyImageKey(image.id)]+")"}}
                                                >
                                                <div className="image-content">
                                                    <span className={!image.isPublic ? "price-label" : "free-label"}>
                                                        {this.getPrice(image)}
                                                    </span>
                                                    {image.deactivationDate &&
                                                        <div className="deleted-info">DELETED</div>
                                                    }
                                                </div>
                                            </a>
                                            <div>
                                                <div className="photo-title">{image.title}</div>
                                                <div className="photo-category">{this.getCategoriesNames(image.categories)}</div>
                                                <div className="btn btn-link-gray btn-sm pl-0" onClick={e => this.onDownloadClick(image, false)}>
                                                    <i class="fa fa-download"></i>&nbsp;Download
                                                </div>
                                                {!image.deactivationDate && 
                                                <div className="btn btn-rounded btn-outline-secondary btn-sm pull-right delete-btn" onClick={e => this.onClickDelete(image)} disabled={this.state.deletingImageId == image.id}>
                                                    { this.state.deletingImageId == image.id && <i className="fa fa-refresh fa-spin"></i>}
                                                    &nbsp;Delete&nbsp;
                                                </div>}
                                            </div>
                                            <div className="total-earn mt-3">Total earned: <span>{this.formatBtcValue(image.paymentsAmount)}&nbsp;BTC</span></div>
                                            <hr/>
                                            <div className="total-downloads mb-2">Total sold: {image.paymentsCount}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                
            </div>
        );
    }
    
    isLoadingHistory(){
        return this.state.images.length > this.getLoadedImagesLength();
    }

    getLoadedImagesLength(){
        var loadedImages = 0;
        Object.keys(this.state).forEach(key => {
            if(key.startsWith('myImage')){
                loadedImages++;
            }
        });
        return loadedImages;
    }

    getPurchaseImageData() {
        var data = [];
        Object.keys(this.state).forEach(key => {
            if(key.startsWith('purchaseImage')){
                data.push(this.state[key]);
            }
        });
        return data;
    }

    getMyImageKey(id) {
        return 'myImage' + id;
    }

    getPurchaseImageKey(metadata) {
        return 'purchaseImage' + metadata.id + '_' + metadata.username;
    }

    onDownloadClick(image, purchase) {
        if (purchase) {
            ImageManager.getPurchaseLargeFileUrl(image.id, image.username).then((file) =>
            {
                if (file) {
                    this.downloadFile(file, image.title, image.type);
                }
            }).catch((err) => server_error(err));
        } else {
            ImageManager.getLargeFileUrl(image.id, image.username, image.imageKey).then((file) =>
            {
                if (file) {
                    this.downloadFile(file, image.title, image.type);
                }
            }).catch((err) => server_error(err));
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

    onClickDelete(image) {
        if (!isUserSignedIn()) {
            this.props.handleSignIn();
            return;
        }
        if (this.state.deletingImageId) {
            error("Wait for the image to be deleted.");
            return;
        }
        confirm("Are you sure that you want to delete the '" + image.title + "' photo?", (toDelete) => this.onModalToDeleteSelect(toDelete, image), false, null, 'Delete'); 
    }

    onModalToDeleteSelect(toDelete, image) {
        if (toDelete) {
            this.setState({ deletingImageId: image.id });
            var url = server_url + '/api/v1/images/' + image.id;
            var config={headers:{}};
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
            Axios.delete(url, config).then(response => {
                ImageManager.delete(image.id, image.username, response.data).then(() =>
                {
                    image.deactivationDate = response.data;
                    this.updateStateImages(image);
                    success('Photo deleted.');
                }).catch((err) => 
                {
                    server_error(err);
                    this.setState({deletingImageId: null});
                });  
            }).catch((err) => {
                server_error(err);
                this.setState({deletingImageId: null});
            });
        } else {
            this.setState({deletingImageId: null});
        }
    }

    updateStateImages(image){
        var images = this.state.images;
        for (var i =0; i<images.length;i++){
            if(images[i].id == image.id){
                images[i] = image;
                break;
            }
        }
        this.setState({images: images, deletingImageId:null});
    }

    getPrice(image){
        if(image.isPublic){
            return "FREE";
        }
        return "$"+Util.getFormattedPrice(image.price);
    }

    getCategoriesNames(categories){
        if(categories != null){
            return categories.join(", ");
        }
        return "Others";
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        ImageManager.listPurchaseMetadataFilesName().then((result) =>
        {
            this.setState({ purchasesFileNames: result }, () => this.fetchPurchases());
        }).catch((err) => server_error(err));
        this.listMyImages();
    }

    listMyImages(){
        var url = server_url + '/api/v1/images/my';
        var config={headers:{}};
        if (isUserSignedIn()) {
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
        }
        Axios.get(url, config).then(response => {
            this.setState({images:response.data}, () => this.fetchMyImages());
        });
    }

    fetchMyImages(){
        for (var i = 0; i < this.state.images.length; i++) {
            this.fetchMyImageContent(this.state.images[i].id, this.state.images[i].username, this.state.images[i].imageKey);  
        }
        this.setState({isLoadingMyImages:false});
    }

    fetchMyImageContent(id, username, imageKey) {
        ImageManager.getSmallFileUrl(id, username, imageKey).then((file) =>
        {
            if (file) {
                var state = {};
                state[this.getMyImageKey(id)] = file;
                this.setState(state);
            }
        }).catch((err) => server_error(err));
    }

    fetchPurchases(){
        for (var i =0; i<this.state.purchasesFileNames.length;i++){
            this.fetchPurchaseData(this.state.purchasesFileNames[i]);
        }
        this.setState({isLoadingPurchases:false});
    }

    fetchPurchaseData(metadataFileName) {
        ImageManager.getPurchaseData(metadataFileName).then((data) =>
        {
            if (data) {
                var state = {};
                state[this.getPurchaseImageKey(data)] = data;
                this.setState(state);
            }
        }).catch((err) => server_error(err));
    }

    formatBtcValue(value){
        if(value > 0){
            return value.toFixed(8);
        }
        return "0";
    }
}