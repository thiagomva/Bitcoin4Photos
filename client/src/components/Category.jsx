import React, { Component } from 'react';

export default class Category extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>{this.props.category && 
                <a className={"photo-category-card card mb-4"} 
                    href={"/"+this.props.category.toLowerCase()}
                    style={{backgroundImage: "url(/images/categories/"+this.props.category.toLowerCase()+".png)"}}
                    >
                    <div className="category-title">{this.props.category.toUpperCase()}</div>
                </a>}
            </div>
        );
    }
}