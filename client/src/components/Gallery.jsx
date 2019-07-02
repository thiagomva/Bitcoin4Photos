import React, { Component } from 'react';
import Axios from 'axios';
import {
    isUserSignedIn,
    lookupProfile,
    Person,
    loadUserData
  } from 'blockstack';
import UploadImageModal from './UploadImageModal.jsx';
import { server_url, open_node_url } from '../config.js';
import SearchImages from './SearchImages.jsx';
import BrowserCategories from './BrowserCategories.jsx';
import { server_error } from '../sweetAlert.js';
import { Util } from '../util.js';
import ImageManager from '../image.js';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';


const PAGE_SIZE=12;
export default class Gallery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            images: [],
            filteredImages: [],
            currentPageItens: [],
            currentPage: 1,
            showPosts: false,
            isLoading: true,
            currentCategory: props.match.params.category,
            searchTerm: props.match.params.term,
        }
    }

    render() {
        const { handleSignOut, handleSignIn, allCategories } = this.props;
        var username = null;
        if(isUserSignedIn()){
            username = loadUserData().username;
        }

        let pagesNumbers = []
        var numberOfPages = Math.ceil(this.state.filteredImages.length/PAGE_SIZE);
        for(let i=0; i<numberOfPages; i++){
            if((this.state.currentPage - i > -3 && this.state.currentPage - i < 5)){
                pagesNumbers.push(i+1);
            }
        }
        return (
            <div>
                <section className="text-center">
                    <div className="container">
                        <p className="head-text">A zero fee marketplace to buy and sell stock photos powered by the Bitcoin Lightning Network</p>
                        <SearchImages currentSearch={this.state.currentCategory ? this.state.currentCategory : this.state.searchTerm}></SearchImages>
                    </div>
                </section>
                <div className="container my-5">
                    <div className="row">
                    {this.state.isLoading && 
                        <div className="col-md-12 text-center">Loading...</div>
                    }
                    {!this.state.isLoading && this.state.filteredImages.length == 0 &&
                        <div className="col-md-12 text-center">This gallery doesn't have any image.</div>
                    }
                    {this.state.currentPageItens.map((image) => (
                        <div key={image.username+"_"+image.id} className="col-md-4">
                            <a className={"photo-category-card card mb-4"} 
                                href={"/"+image.username+"/"+image.id}
                                style={{backgroundImage: ((this.state[image.id+"_"+image.username] && this.state[image.id+"_"+image.username].loaded) ? 'url('+this.state[image.id+"_"+image.username].content+')' : "")}}
                                >
                                <div className="image-content">
                                    <span className={!image.isPublic ? "price-label" : "free-label"}>
                                        {this.getPrice(image)}
                                    </span>
                                    <div className="photo-title">{image.title}</div>
                                    <div className="photo-category">{this.getCategoriesNames(image.categories)}</div>
                                </div>
                            </a>
                        </div>
                    ))}
                    {pagesNumbers.length > 1 &&
                        <nav className="col-md-12">
                            <ul className="pagination">
                                <li title="First" className={"page-item "+ ((this.state.currentPage == 1) ? "disabled":"")}>
                                    <a onClick={e => this.onPage(1)} className="page-link" href="#" tabIndex="-1" aria-disabled="true">&laquo;</a>
                                </li>
                                <li title="Previous" className={"page-item "+ ((this.state.currentPage == 1) ? "disabled":"")}>
                                    <a onClick={e => this.onPage(this.state.currentPage - 1)} className="page-link" href="#" tabIndex="-1" aria-disabled="true">‹</a>
                                </li>
                                {this.state.currentPage > 4 && <li className="page-item disabled">
                                    <a className="page-link" href="#" tabIndex="-1" aria-disabled="true">...</a>
                                </li>}
                                {pagesNumbers.map((pageNumber) => (
                                    <li key={pageNumber} className={"page-item "+ ((this.state.currentPage == pageNumber) ? "active":"")} ><a onClick={e => this.onPage(pageNumber)} className="page-link" href="#">{pageNumber}</a></li>
                                ))}
                                {(numberOfPages - this.state.currentPage) >  3 && <li className="page-item disabled">
                                    <a className="page-link" href="#" tabIndex="-1" aria-disabled="true">...</a>
                                </li>}
                                <li title="Next" className={"page-item "+ ((this.state.currentPage == numberOfPages) ? "disabled":"")}>
                                    <a onClick={e => this.onPage(this.state.currentPage + 1)} className="page-link" href="#">›</a>
                                </li>
                                <li title="Last" className={"page-item "+ ((this.state.currentPage == numberOfPages) ? "disabled":"")}>
                                    <a onClick={e => this.onPage(numberOfPages)} className="page-link" href="#">&raquo;</a>
                                </li>
                            </ul>
                        </nav>
                    }
                    </div>
                </div>
                <BrowserCategories allCategories={allCategories} excludeCategories={[this.state.currentCategory]}></BrowserCategories>
            </div>
        );
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
        if(this.state.searchTerm){
            this.fetchSearchedDate();
        }
        else{
            this.fetchData();
        }
    }

    fetchData() {
        var url = server_url + '/api/v1/images';
        var config={headers:{}};
        if (isUserSignedIn()) {
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
        }
        Axios.get(url, config).then(response => {
            var newState = {images:response.data};
            newState.filteredImages = this.getFilteredImages(response.data);
            newState.currentPage = 1;
            this.setState(newState, () => this.fetchImagesAndProfilesOfCurrentPageItens());
        });
    }

    fetchSearchedDate(){
        var url = server_url + '/api/v1/images/search?term='+this.state.searchTerm;
        var config={headers:{}};
        if(isUserSignedIn()){
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
        }
        Axios.get(url, null, config).then(response => {
            var newState = {images:response.data};
            newState.filteredImages = this.getFilteredImages(response.data);
            newState.currentPage = 1;
            this.setState(newState, () => this.fetchImagesAndProfilesOfCurrentPageItens());
        }).catch(() => this.setState({ isLoading: false }));
    }

    getFilteredImages(images){
        if(this.state.currentCategory != null){
            return this.getFromCategory(this.state.currentCategory, images);
        }
        return images;
    }

    getFeatured(images){
        var featured = [];
        for (var i =0; i<images.length;i++){
            if(images[i].featured){
                featured.push(images[i]);
            }
        }
        return featured;
    }

    getFromCategory(category, images){
        var filter = [];
        for (var i =0; i<images.length;i++){
            if(images[i].categories != null){
                for (var j =0; j<images[i].categories.length;j++){
                    if(images[i].categories[j].toLowerCase() == category.toLowerCase()){
                        filter.push(images[i]);
                        break;
                    }
                }
            }
        }
        return filter;
    }

    onPage(pageNumber){
        this.setState({currentPage: pageNumber}, () => this.fetchImagesAndProfilesOfCurrentPageItens());
    }

    fetchImagesAndProfilesOfCurrentPageItens(){
        var pageStart = (this.state.currentPage-1)*PAGE_SIZE;
        var currentPageItens = this.state.filteredImages.slice(pageStart, pageStart+PAGE_SIZE);
        var lastIndex = pageStart+PAGE_SIZE;
        if(this.state.filteredImages.length < lastIndex)
            lastIndex = this.state.filteredImages.length;
        for (var i =pageStart; i<lastIndex;i++){
            this.getPublicImage(i);
            this.getProfile(i);
        }
        this.setState({currentPageItens: currentPageItens, isLoading: false});
    }

    getProfile(index){
        var images = this.state.filteredImages;
        if(!this.state["person_"+images[index].username]){
            lookupProfile(images[index].username)
            .then((profile) => {
                var person = new Person(profile);
                var newState = {};
                newState["person_"+images[index].username]=person;
                this.setState(newState);
            })
        }
    }

    getPublicImage(index){
        var images = this.state.filteredImages;
        var imgId = images[index].id + "_" + images[index].username;
        if (!this.state[imgId]) {
            ImageManager.getSmallFileUrl(images[index].id, images[index].username, images[index].imageKey).then((file) =>
            {
                if (file) {
                    var newState = {};
                    newState[imgId] = { loaded: true, content: file };
                    this.setState(newState);
                }
            }).catch((err) => server_error(err));
        }
    }

    onBuyClick(image){
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
        }).catch((err) => {
            server_error(err);
        });
    }
}