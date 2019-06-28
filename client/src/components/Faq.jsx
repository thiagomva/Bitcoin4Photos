import React, { Component } from 'react';
import FaqItem from './FaqItem.jsx';

export default class Faq extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
    <div className="container">
        <div className="row">
            <div className="col-md-12">
                <div className="page-title">
                    FAQ
                </div>
            </div>
        </div>
        <div className="row mb-5">
            <FaqItem question="What is Bitcoin4Photos?">
                <p>Bitcoin4Photos is a marketplace to buy and sell photos &amp; illustrations powered by Bitcoin Lightning Network &amp; Blockstack.</p>
            </FaqItem>
            <FaqItem question="What is Blockstack?">
                <p>Bitcoin4Photos is built on top of Blockstack, allowing us to provide decentralized encrypted photo storage. Blockstack is a new internet for decentralized apps that you access through the Blockstack Browser. With Blockstack, there is a new world of apps that let you own your data and maintain your privacy, security and freedom.</p>
            </FaqItem>
            <FaqItem question="How much does it cost?">
                <p>Selling your photos with Bitcoin4Photos is absolutely free.</p>
            </FaqItem>
            <FaqItem question="How can I withdraw my earnings?">
                <p>As soon as you have a positive balance, you will see the 'Withdraw' button. Withdrawing your balance from Bitcoin4Photos is free and instantaneous by leveraging the power of the Lightning Network. Simply enter a Lightning Payment Request for the amount you want to withdraw and you're all set!</p>
                <p>Note: You need a wallet that supports creating invoices to be able to withdraw, such as <a href="https://bluewallet.io" target="_blank">Blue Wallet</a>, <a href="https://github.com/ACINQ/eclair" target="_blank">Eclair</a>, or any other wallet that supports creating Lighting Payment Requests.</p>
            </FaqItem>
            <FaqItem question="How can I use Bitcoin lightning?">
                <p>The Bitcoin lightning network is a technology built on Bitcoin enabling lightning fast and unfairly cheap transactions. <a href="https://www.youtube.com/watch?v=rrr_zPmEiME" target="_blank">Check out this video to learn more about how it works.</a></p>
                <p>Kind of cool, right? Lightning is like the future of online payments, but today! And the best part is that it is super easy to start playing with this amazing technology. All you have to do is:</p>
                <ol>
                    <li>Get a wallet with lightning functionality</li>
                    <li>Buy some (fraction of a) bitcoin</li>
                    <li>Test it out!</li>
                </ol>
                <br/>
                <p>1) Get a wallet with lightning functionality</p>
                <p>For beginners starting to play with this technology, the best option is to get a custodial mobile or web wallet. For a little more advanced users solutions like the <a href="https://play.google.com/store/apps/details?id=fr.acinq.eclair.wallet.mainnet2" target="_blank">Eclair</a>, <a href="https://lightning-wallet.com/" target="_blank">BLW</a> and <a href="https://store.casa/lightning-node/" target="blank">Casa Lightning node</a> are great.</p>
                <p>Some lightning wallets that are really easy to use:</p>
                <ul>
                    <li><a href="https://t.co/9wF98KaAh2" target="_blank">Bitlum</a> - a super simple wallet directly in the web-browser</li>
                    <li><a href="https://www.walletofsatoshi.com/" target="_blank">Wallet of Satosi</a> - even your grandma can use this one</li>
                    <li><a href="https://bluewallet.io/" target="_blank">Blue wallet</a> - for those who want extra functionality</li>
                </ul>
                <br/>
                <p>2) Buy some (fraction of a) bitcoin</p>
                <p>There are loads of ways to buy bitcoin. You can for instance do it from a <a href="https://coinatmradar.com/" target="_blank">bitcoin ATM</a> or <a href="https://www.bitpremier.com/buy-bitcoins" target="_blank">use your debit or credit card</a>, and have it sent to your lightning wallet.</p>
                <p>Bitcoin and satoshis</p>
                <p>Since a bitcoin have become kind of valuable, most people buy a fraction of a bitcoin. In the world of lightning, this is typically denominated in satoshis or sats for short. A satoshi is to bitcoin what a cent is to the dollar, but way smaller. There is 100 million satoshis in one bitcon, so you will often operate with tens of thousands of satoshis when you are transacting.</p>
                <br/>
                <p>3) Test it out!</p>
                <p>Buy Photos on Bitcoin4Photos =)</p>
            </FaqItem>
        </div>
    </div>);
  }
}