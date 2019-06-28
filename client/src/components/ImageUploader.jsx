import React, { Component } from 'react';
import { error } from '../sweetAlert.js';
import { isUserSignedIn } from 'blockstack';

export default class ImageUploader extends Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    if(!isUserSignedIn()){
      this.props.handleSignIn();
      return;
    }

    var iconUploadClasses = "icon icon-upload";
    var imgClass="img-upload";
    var emptyImgClass="empty-img";
    if(this.state.dragging){
      iconUploadClasses +=  " activeColor";
      imgClass +=" activeBox"
      emptyImgClass += " activeBox";
    }
    if(this.state.loaded){
      imgClass+= " loaded";
    }
    

    return (<label className="uploader" onDragOver={e => this.handleDragOver(e)}
          onDragEnter={e => this.handleDragEnter(e)}
          onDragLeave={e => this.handleDragLeave(e)}
          onDrop={e => this.handleDrop(e)}>

          <img id="watermarkImg" className={imgClass} src={this.state.imageSrc} />
          {!this.state.loaded && <div className="upload-text-div">
            <i className={iconUploadClasses}>Add photo</i>
            <div className={"max-size-text "+ (this.state.dragging?"activeColor":"")}>
              *Maximum file size is 20MB.
            </div>
          </div>}
          {!this.state.loaded && <div className={emptyImgClass}></div>}
          <input type="file" id="fileInput" name="fileInput" accept=".png,.jpg,.jpeg" onChange={e => this.handleInputChange(e)}/>
      </label>
    );
  }

  componentDidMount() {
    
  }
  
  handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  handleDragEnter() {
    this.setState({dragging: true});
  }

  handleDragLeave() {
    this.setState({dragging: false});
  }

  handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({dragging: false});
    this.handleInputChange(e);
  }

  handleInputChange(e) {
      let file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
      if (file) {
          this.loaded = false;
          this.fileToUpload = file;

          let type = file.type.toLowerCase();
          if (type.indexOf("png") >= 0 || type.indexOf("jpeg") >= 0 || type.indexOf("jpg") >= 0) {
            if (file.size < 20000000) {
              this.setState({imageType: type.indexOf("png") >= 0 ? 'PNG' : 'JPG', imageSize: file.size});
              let reader = new FileReader();
              reader.onload = this._handleReaderLoaded.bind(this);
              reader.readAsArrayBuffer(file);
            } else {
              error("File size must be lower than 20MB.");
              this.clearComponent();
            }
          } else {
            error("Invalid file type.");
            this.clearComponent();
          }
      } else {
          this.clearComponent();
      }
  }

  getFile() {
      return this.state.fileToUpload;
  }

  fileWasChanged() {
      return this.state.wasChanged;
  }

  clearComponent() {
    var state = {}
    if (!this.state.wasChanged && this.state.loaded) {
        state.wasChanged = true;
    }
    state.imageSrc = '';
    state.loaded = false;
    state.fileToUpload = null;
    state.imageType = null;
    state.imageSize = null;
    this.setState(state);
    if (this.props.onChangeImage) {
      this.props.onChangeImage(null);
    }
  }

  forceImageUrl(imageUrl) {
      if (!!imageUrl) {
        this.clearComponent();
        this.setState({imageSrc: imageUrl, loaded: true});
      }
  } 

  _handleReaderLoaded(e) {
    var reader = e.target;

    if (this.props.onChangeImage) {
      this.props.onChangeImage({src: reader.result, type: this.state.imageType, size: this.state.imageSize});
    }
    var url = URL.createObjectURL(new Blob([new Uint8Array(reader.result)]));
    this.setState({imageSrc: url, fileToUpload: reader.result, loaded: true, wasChanged: true});
  }

  removeImage(e) {
      e.preventDefault();
      e.stopPropagation();
      this.clearComponent();
  }
}