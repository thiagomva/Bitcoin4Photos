import React, { Component } from 'react';
import Axios from 'axios';
import {
  isUserSignedIn,
  loadUserData
} from 'blockstack';
import Modal from 'react-bootstrap/Modal';
import ImageUploader from './ImageUploader.jsx';
import Select from 'react-select';
import { server_url } from '../config.js';
import { error, server_error } from '../sweetAlert.js';
import ImageManager from '../image.js';

export default class UploadImageModal extends Component {
  constructor(props) {
    
    super(props);
    this.onClick = this.onClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.state = {
      showModal: false,
      newImageContent: null,
      newImageType: null,
      newImageSize: null,
      newImageTitle: '',
      newImageCategories: [],
      newImageIsPublic: true,
      loading: false
    };
  }

  onClick(e) {
    e.preventDefault();
    if(!isUserSignedIn()){
      this.props.handleSignIn();
      return;
    }
    else{
      this.setState({showModal:true, 
        newImageContent: null,
        newImageType: null,
        newImageSize: null,
        newImageTitle: '',
        newImageCategories: [],
        newImageIsPublic: true,
        newImagePrice: '',
      });
    }
  }

  handleClose() {
    if (!this.state.loading) {
      this.setState({ showModal: false });
    } else {
      error("Your photo is uploading, please wait...", "");
    }
  }
  
  onSaveClick(){
    if(!isUserSignedIn()){
      error('Your blockstack username was not loaded.');
      return;
    }
    this.handleNewImageSubmit();
  }

  onChangeImage(img) {
    if (img) {
      this.setState({ newImageContent: img.src, newImageSize: img.size, newImageType: img.type });
    } else {
      this.setState({ newImageContent: null, newImageSize: null, newImageType: null });
    }
  }

  render() {
    return (
      <div>
        <button type="button" className="btn btn-primary btn-rounded" onClick={e => this.onClick(e)}><span><i className="fa fa-upload"></i>&nbsp;Upload photo!</span></button>
        <Modal size="lg" show={this.state.showModal} onHide={this.handleClose} centered  data-backdrop={this.state.loading ? "static" : true} data-keyboard={!this.state.loading}>
          <Modal.Body className="upload-image-modal text-center">
            <button type="button" class="close" onClick={e => this.handleClose()}>
              <span aria-hidden="true">×</span>
              <span class="sr-only">Close</span>
              </button>
            <div className="row">
              <div className="col-lg-7 mb-lg-0 mb-4">
                <ImageUploader onChangeImage={e => this.onChangeImage(e)}></ImageUploader>
              </div>
              <div className="col-lg-5">
                <div className="row">
                  <div className="col-md-12 mb-4">
                    <input className="form-control input-page-name"
                      value={this.state.newImageTitle}
                      onChange={e => this.handleNewImageTitleChange(e)}
                      placeholder="What's your photo title?"
                      maxLength="100"
                    />
                  </div>
                  <div className="col-md-12 mb-4 text-left">
                    <Select
                      value={this.state.newImageCategories}
                      onChange={e => this.handleNewImageCategoriesChange(e)}
                      isMulti
                      name="categories"
                      options={this.state.newImageCategories.length == 3 ? 
                        this.state.newImageCategories : this.props.allCategories}
                      noOptionsMessage={() => {
                        return this.state.newImageCategories.length == 3 ? 
                        "You can select 3 categories" : "No options"
                      }}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Select your photo categories..."
                    />
                  </div>
                  <hr></hr>
                  <div className="col-md-12 text-center form-inline">  
                    <div class="form-row align-items-center margin-auto">
                      <div class="col-auto my-1">
                        <label>
                          <input
                            type="radio"
                            name="fileIsPublic"
                            value="public"
                            checked={this.state.newImageIsPublic}
                            onChange={e => this.handleNewImageIsPublicChange(e)}
                          />
                          &nbsp;Free
                        </label>
                      </div>
                      <div class="col-auto my-1">
                        <label>
                            <input
                              type="radio"
                              name="fileIsPublic"
                              value="paid"
                              checked={!this.state.newImageIsPublic}
                              onChange={e => this.handleNewImageIsPublicChange(e)}
                            />
                        </label>
                      </div>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">$</span>
                        </div>
                        <input className="form-control input-photo-price" type="number"
                          placeholder="Price"
                          ref={(input) => { this.priceInput = input; }} 
                          disabled={this.state.newImageIsPublic}
                          value={this.state.newImagePrice}
                          onChange={e => this.handleNewImagePriceChange(e)}
                          onBlur={e=>this.handleNewImagePriceBlur(e)}
                        />
                      </div>
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary btn-rounded mt-4 margin-auto" onClick={e => this.onSaveClick(e)} disabled={this.state.loading}>
                    <span>
                      { !this.state.loading && <i className="fa fa-upload"></i> }
                      { this.state.loading && <i className="fa fa-refresh fa-spin"></i> }
                      &nbsp;Upload photo!
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

  handleNewImagePriceChange(event) {
    this.setState({newImagePrice: event.target.value});
  }

  handleNewImagePriceBlur(event){
    var price = parseFloat(this.state.newImagePrice);
    this.setState({newImagePrice: price});
  }

  handleNewImageCategoriesChange(event) {
    if(event == null)
      event = [];
    this.setState({newImageCategories: event});
  }

  handleNewImageTitleChange(event) {
    this.setState({newImageTitle: event.target.value})
  }  

  handleNewImageIsPublicChange(event) {
    var isPublic = event.target.value === 'public' && event.target.checked;
    this.priceInput = '';
    this.setState({ newImageIsPublic: isPublic, newImagePrice: '' }, () => {
      if(!isPublic){
        this.priceInput.focus();
      }
    });
  }
  
  handleNewImageSubmit() {
    var imageMetadata = {
      username: loadUserData().username,
      title: this.state.newImageTitle,
      categories: this.state.newImageCategories ? this.state.newImageCategories.map(cat => cat.label) : [],
      isPublic: this.state.newImageIsPublic,
      size: this.state.newImageSize,
      type: this.state.newImageType,
      price: isNaN(this.state.newImagePrice) ? null : parseFloat(this.state.newImagePrice)
    };

    if (!this.state.newImageContent) {
      error("Photo is required.");
      return;
    }
    if (this.checkEmptyField(imageMetadata.title)) {
      error("Title is required.");
      return;
    }
    if (this.checkMaxLengthExceeded(imageMetadata.title, 100)) {
      error("Title must not exceed 100 characters.");
      return;
    }
    if (this.checkEmptyArray(imageMetadata.categories)) {
      error("At least one category is required.");
      return;
    }
    if (imageMetadata.categories.length > 3) {
      error("The maximum number of categories is 3.");
      return;
    }
    if (!imageMetadata.isPublic) {
      if(this.checkEmptyField(imageMetadata.price)){
        error("Price is required for paid photos.");
        return;
      }
      if(imageMetadata.price <= 0.0001){
        error("Price must be greater than $0.0001.");
        return;
      }
      if(imageMetadata.price > 20000){
        error("Price must be lower than $20.000.");
        return;
      }
    }

    this.setState({ loading: true });
    ImageManager.upload(imageMetadata, this.state.newImageContent).then((result) =>
    {
      this.saveImageOnServer(result);
    }).catch((err) =>
    {
      server_error(err);
      this.setState({ loading: false });
    });
  }

  checkMaxLengthExceeded(value, length){
    return value.length > length;
  }

  checkEmptyField(value){
    return value == null || (typeof value == "string" && value.trim() == "" );
  }

  checkEmptyArray(value){
    return value == null || value.length == null || value.length == 0;
  }

  saveImageOnServer(imageMetadata){
    var url = server_url + '/api/v1/images';
    var config={headers:{}};
    config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
    Axios.post(url, imageMetadata, config).then(response => {
      this.setState({ loading: false }, () => this.handleClose());
      location = "/"+imageMetadata.username+"/"+imageMetadata.id;
    }).catch(() => this.setState({ loading: false }));
  }
}