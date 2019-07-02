import React, { Component } from 'react';
import {
    isUserSignedIn,
    loadUserData
  } from 'blockstack';
import SearchImages from './SearchImages.jsx';
import Category from './Category.jsx';
import BrowserCategories from './BrowserCategories.jsx';
const HIGHLIGH_CATEGORIES = [
    "ABSTRACT",
    "URBAN",
    "PEOPLE",
    "ARCHITECTURE",
    "ART",
    "TRAVEL",
    "NATURE",
    "TECHNOLOGY"
];



export default class Categories extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { handleSignOut, handleSignIn, allCategories } = this.props;
        var username = null;
        if(isUserSignedIn()){
            username = loadUserData().username;
        }

        return (
            <div>
                <section className="text-center">
                    <div className="container">
                        <p className="head-text">A zero fee marketplace to buy and sell stock photos powered by the Bitcoin Lightning Network</p>
                        <SearchImages></SearchImages>
                    </div>
                </section>
                <div className="advantages-section-wrapper">
                    <div className="advantages-section my-5">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-4 text-center p-5 advantage-animation">
                                    <img className="advantage-img" src="./images/Icon_Micro.png"></img>
                                    <div className="advantage-title my-4">MICROTRANSACTIONS ENABLED</div>
                                    <div className="advantage-description mb-2">Buy or sell photos for less than a penny</div>
                                </div>
                                <div className="col-md-4 text-center p-5 advantage-animation-2">
                                    <img className="advantage-img" src="./images/Icon_Zero.png"></img>
                                    <div className="advantage-title my-4">ZERO FEES & COMISSIONS</div>
                                    <div className="advantage-description mb-2">Bitcoin4Photos is absolutely free, powered by Bitcoin Lightning</div>
                                </div>
                                <div className="col-md-4 text-center p-5 advantage-animation-3">
                                    <img className="advantage-img" src="./images/Icon_Never-lose.png"></img>
                                    <div className="advantage-title my-4">NEVER LOSE ANY PHOTOS</div>
                                    <div className="advantage-description mb-2">Keep images you bought or uploaded safe and private, storing them with Blockstack's decentralized storage.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container my-5">
                    <div className="row">
                        <div className="col-md-4">
                            <Category category={HIGHLIGH_CATEGORIES[0]}></Category>
                        </div>
                        <div className="col-md-8">
                            <Category category={HIGHLIGH_CATEGORIES[1]}></Category>
                        </div>
                        <div className="col-md-3">
                            <Category category={HIGHLIGH_CATEGORIES[2]}></Category>
                        </div>
                        <div className="col-md-6">
                            <Category category={HIGHLIGH_CATEGORIES[3]}></Category>
                        </div>
                        <div className="col-md-3">
                            <Category category={HIGHLIGH_CATEGORIES[4]}></Category>
                        </div>                        
                        <div className="col-md-4">
                            <Category category={HIGHLIGH_CATEGORIES[5]}></Category>
                        </div>
                        <div className="col-md-4">
                            <Category category={HIGHLIGH_CATEGORIES[6]}></Category>
                        </div>
                        <div className="col-md-4">
                            <Category category={HIGHLIGH_CATEGORIES[7]}></Category>
                        </div>
                    </div>
                </div>
                <BrowserCategories allCategories={allCategories} excludeCategories={HIGHLIGH_CATEGORIES}></BrowserCategories>
            </div>
        );
    }

    isHighlightCategory(category){
        for (var i =0; i < HIGHLIGH_CATEGORIES.length; i++){
            if(HIGHLIGH_CATEGORIES[i].toLowerCase() == category.value.toLowerCase()){
                return true;
            }
        }
        return false;
    }
}