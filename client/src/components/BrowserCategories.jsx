import React, { Component } from 'react';

export default class BrowserCategories extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { allCategories } = this.props;
        return (
            <div className="container">
                <div className="row my-4">
                    <div className="section-title">Browser other categories</div>
                    <div className="section-separator"></div>
                </div>
                <div className="row">
                    {(!allCategories || allCategories.length == 0) && 
                    <div className="col-md-12">Loading...</div>
                    }
                    {allCategories.map((category) => (
                        this.showCategory(category) && 
                        <div key={category.value} className="col-md-4 col-lg-3 col-sm-6">
                            <div className="page-card card mb-4 category-card">
                                <a className="btn btn-outline-secondary btn-rounded category-link" href={"/"+category.value.toLowerCase()}>
                                    {category.value.toUpperCase()}
                                </a>
                            </div>
                        </div>
                    ))}
                    <div className="col-md-12 clickable back-to-top" onClick={(e) => this.backToTop(e)}>Back to top</div>
                </div>
            </div>
        );
    }

    backToTop(e) {
        e.preventDefault();
        window.scrollTo(0, 0);
    }

    showCategory(category){
        for (var i =0; i < this.props.excludeCategories.length; i++){
            if(this.props.excludeCategories[i] && this.props.excludeCategories[i].toLowerCase() == category.value.toLowerCase()){
                return false;
            }
        }
        return true;
    }
}