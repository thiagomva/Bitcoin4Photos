import React, { Component } from 'react';
import { isUserSignedIn, loadUserData } from 'blockstack';
import Axios from 'axios';
import { server_url, invoice_network } from '../config.js';
import { Util } from '../util.js';
import WithdrawModal from './WithdrawModal.jsx';
import { server_error } from '../sweetAlert.js';

const WITHDRAW_PAGE_SIZE = 5;
export default class Withdraw extends Component {
    constructor(props) {
        super(props);

        this.state = {
            balance: [],
            availableAmount: 0,
            withdrawalAmount: 0,
            withdrawing: false,
            invoice: '',
            currentPage:1,
        }
    }

    render() {
        const { handleSignIn } = this.props;
        if(!isUserSignedIn()){
            handleSignIn();
            return;
        }

        let pagesNumbers = []
        var numberOfPages = Math.ceil(this.state.balance.length/WITHDRAW_PAGE_SIZE);
        for(let i=0; i<numberOfPages; i++){
            if((this.state.currentPage - i > -3 && this.state.currentPage - i < 5)){
                pagesNumbers.push(i+1);
            }
        }

        return (
            <div className="row">
                <div className="col-lg-5 col-xl-4">
                    <div className="profile-tabs-title">Earning Summary</div>
                    <div className="available-for-withdrawal mb-4">Available for withdrawal</div>
                    <div className="value-display available-withdrawal d-inline-block">
                        {this.formatBtcValue(this.state.availableAmount)}<span>BTC</span>
                    </div>
                    <div className="pull-right">
                        <WithdrawModal onWithdrawResponse={e => this.onWithdrawResponse(e)} availableAmount={this.state.availableAmount}></WithdrawModal>
                    </div>
                    <div className="earning-separator my-4"></div>
                    <div className="total-earn mb-2">Total earn</div>
                    <div className="total-earn-value value-display">{this.formatBtcValue(this.state.availableAmount + this.state.withdrawalAmount)}<span>BTC</span></div>
                </div>
                <div className="offset-xl-1 col-lg-7">
                    <div className="profile-tabs-title">Statements</div>
                    <table class="table statements-table table-hover table-responsive-sm">
                        <thead class="thead-light">
                            <tr>
                                <th scope="col">DATE</th>
                                <th scope="col">PHOTO ID</th>
                                <th scope="col">ACTION</th>
                                <th scope="col">STATUS</th>
                                <th scope="col">NET AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.getBalancesFromCurrentPage().map((c) => (
                                <tr>
                                    <td>
                                        {new Date(c.referenceDate).toLocaleDateString()}
                                        <br/>
                                        {new Date(c.referenceDate).toLocaleTimeString()}
                                    </td>
                                    <td>{c.imageId}</td> 
                                    <td>{c.type}</td>
                                    <td>{c.status}</td> 
                                    <td><div><strong>{this.getAmountSignal(c)}</strong>{this.formatBtcValue(c.amount)}<span>&nbsp;BTC</span></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pagesNumbers.length > 1 &&
                        <nav className="gray-paginator">
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
        );
    }
    
    onPage(pageNumber){
        this.setState({currentPage: pageNumber});
    }

    getBalancesFromCurrentPage(){
        var pageStart = (this.state.currentPage-1)*WITHDRAW_PAGE_SIZE;
        return this.state.balance.slice(pageStart, pageStart+WITHDRAW_PAGE_SIZE);
    }

    getAmountSignal(c){
        if(c.type == "Withdraw")
            return "-";
        return "+";
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        var url = server_url + '/api/v1/withdrawals';
        var config={headers:{}};
        config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
        Axios.get(url, config).then((response) => {
            this.setState({ 
                balance: response.data.balance,
                availableAmount: response.data.availableAmount,
                withdrawalAmount: response.data.withdrawalAmount,
                withdrawing: false,
                invoice: ''
            });
        }).catch((err) => server_error(err));
    }

    onWithdrawResponse(response){
        var balance = this.state.balance;
        balance.unshift(response.data);
        var availableAmount = Math.round((this.state.availableAmount - response.data.amount) * Math.pow(10, 8)) / Math.pow(10, 8);
        var withdrawalAmount = Math.round((this.state.withdrawalAmount + response.data.amount) * Math.pow(10, 8)) / Math.pow(10, 8);
        this.setState({
            balance: balance,
            availableAmount: availableAmount,
            withdrawalAmount: withdrawalAmount,
            invoice: '',
            withdrawing: false
        });
        setTimeout(() => this.fetchData(), 2000);
    }
    
    formatBtcValue(value){
        if(value > 0){
            return value.toFixed(8);
        }
        return "0";
    }
}