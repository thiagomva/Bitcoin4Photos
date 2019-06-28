import React, { Component } from 'react';

export default class SearchImages extends Component {
  constructor(props) {
    
    super(props);
    this.state = {
      searchTerm: '',
      loading: false
    };
  }
  
  render() {
    return (
      <div>
        <div class="search-input input-group">
          <input type="text" class="form-control underline-input mr-2" 
            placeholder="Search all images" 
            aria-label="Search all images" 
            aria-describedby="button-addon2"
            value={this.state.searchTerm}
            onChange={e => this.handleNewSearchTerm(e)}
            onKeyDown={e => this.onKeyDown(e)}
            />
          <button class="btn btn-primary btn-rounded" type="button" id="button-addon2" onClick={e=>this.seachImages()}
            disabled={this.state.loading || !this.state.searchTerm}>
            <span>
              { !this.state.loading && <i className="fa fa-search"></i> }
              { this.state.loading && <i className="fa fa-refresh fa-spin"></i> }
            </span>
          </button>
        </div>
        {this.props.currentSearch && <div className="row">
            <div className="category-badge my-2" onClick={e => this.goToCategories()}>
                <span className="category-name">{this.props.currentSearch}</span>
                <span className="category-remove">x</span>
            </div>
        </div>}
      </div>
    );
  }

  goToCategories(){
      location = '/';
  }

  handleNewSearchTerm(event) {
    this.setState({searchTerm: event.target.value})
  }

  onKeyDown(event) {
    if (event.key === 'Enter' && this.state.searchTerm) {
      event.preventDefault();
      event.stopPropagation();
      this.seachImages();
    }
  }

  seachImages(){
    this.setState({ loading: true });
    location = '/search/'+this.state.searchTerm;
  }
}