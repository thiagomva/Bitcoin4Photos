import React, { Component } from 'react';
import Axios from 'axios';
import {
  isUserSignedIn,
  loadUserData
} from 'blockstack';
import Modal from 'react-bootstrap/Modal';
import { server_url, invoice_network } from '../config.js';
import { server_error, error } from '../sweetAlert.js';
import { Util } from '../util.js';

export default class WithdrawModal extends Component {
  constructor(props) {
    
    super(props);
    this.onClick = this.onClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.state = {
      showModal: false,
      withdrawing: false,
      invoice: ''
    };
  }

  onClick(e) {
    e.preventDefault();
    if(!isUserSignedIn()){
      this.props.handleSignIn();
    }
    else{
      this.setState({showModal:true, 
        withdrawing:false,
        invoice: '',
      });
    }
  }

  handleClose() {
    this.setState({ showModal: false });
  }

  render() {
    return (
      <div>
        <button type="button" className="btn btn-primary btn-rounded" onClick={e => this.onClick(e)} disabled={this.state.withdrawing || this.props.availableAmount <= 0}>
            <span>
            <i className="fa fa-upload"></i>&nbsp;Withdraw
            </span>
        </button>
        <Modal show={this.state.showModal} onHide={this.handleClose} centered>
          <Modal.Body className="upload-image-modal text-center">
            <button type="button" className="close" onClick={e => this.handleClose()}>
              <span aria-hidden="true">×</span>
              <span className="sr-only">Close</span>
              </button>
            <div className="row mb-4 text-left">Available for withdrawal:<b>&nbsp;{Math.round(this.props.availableAmount * Math.pow(10,8))}&nbsp;</b>SATOSHIS</div>
            <div className="row mb-2 text-left">
                Enter a Lightning Payment Request for the amount you want to withdraw:
            </div>
            <div className="row">
              <input type="text" className="form-control"
                  value={this.state.invoice}
                  onChange={event => this.setState({invoice: event.target.value})}
                  placeholder="Lightning Network invoice"
                  maxLength="1700"
                  minLength="117" />
            </div>
            <div className="row withdraw-note text-left mt-2">
                Note: You need a wallet that supports creating invoices to be able to withdraw, such as <a href="https://bluewallet.io/" target="_blank">Blue Wallet</a>, <a href="https://github.com/ACINQ/eclair-mobile" target="_blank">Eclair</a>, or any other wallet that supports creating Lighting Payment Requests.
            </div>
            <button type="button" className="btn btn-primary btn-rounded mt-4" onClick={e => this.onWithdrawClick(e)} disabled={this.state.withdrawing}>
                <span>
                { !this.state.withdrawing && <i className="fa fa-upload"></i> }
                { this.state.withdrawing && <i className="fa fa-refresh fa-spin"></i> }
                &nbsp;Withdraw
                </span>
            </button>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

  onWithdrawClick() {
    if (!this.state.withdrawing) {
       if (this.isValidInvoice()) {
            this.setState({ withdrawing: true });
            var url = server_url + '/api/v1/withdrawals';
            var config={headers:{}};
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
            Axios.post(url, { invoice: this.state.invoice }, config).then((response) => {
                this.setState({ withdrawing: false });
                if(this.props.onWithdrawResponse){
                    this.props.onWithdrawResponse(response);
                    this.handleClose();
                }
            }).catch((err) => {
                this.setState({ withdrawing: false });
                server_error(err);
            });
       }
    }
}

isValidInvoice() {
    if (!this.state.invoice) {
        error("Invalid invoice.");
        return false;
    }
    var invoice = this.state.invoice.toLowerCase();
    if (invoice.substring(0, 10) == "lightning:") {
        invoice = invoice.substring(10);
    }
    if (invoice.length < 117 || invoice.length > 1700) {
        error("Invalid invoice.");
        return false;
    }
    if (invoice.substring(0, invoice_network.length) != invoice_network || !parseInt(invoice.substring(invoice_network.length, invoice_network.length + 1), 10)) {
        error("Invalid invoice network.");
        return false;
    }
    var splitPosition = invoice.lastIndexOf('1');
    if (splitPosition < 5) {
        error("Invalid invoice amount.");
        return false;
    }
    var amountPart = invoice.substring(4, splitPosition);
    var multiplier = 1;
    if (amountPart[amountPart.length - 1] == 'm') {
        amountPart = amountPart.substring(0, amountPart.length - 1);
        multiplier = 0.001;
    } else if (amountPart[amountPart.length - 1] == 'u') {
        amountPart = amountPart.substring(0, amountPart.length - 1);
        multiplier = 0.000001;
    } else if (amountPart[amountPart.length - 1] == 'n') {
        amountPart = amountPart.substring(0, amountPart.length - 1);
        multiplier = 0.000000001;
    } else if (amountPart[amountPart.length - 1] == 'p') {
        amountPart = amountPart.substring(0, amountPart.length - 1);
        multiplier = 0.000000000001;
    }
    if (!amountPart || !parseFloat(amountPart, 10)) {
        error("Invalid invoice amount.");
        return false;
    }
    var amount = parseFloat(amountPart, 10) * multiplier;
    if (amount <= 0) {
        error("Invalid invoice amount.");
        return false;
    }
    if (amount > this.props.availableAmount) {
        error("Invalid withdraw amount.");
        return false;
    }
    var data = invoice.substring(splitPosition + 1, invoice.length - 6);
    var checksum = invoice.substring(invoice.length - 6, invoice.length);

    var timeStamp = Util.bech32ToInt(data.substring(0, 7));
    var tagData = this.decodeTags(data.substring(7, data.length - 104));
    var expiryTime = 3600;
    for (var i = 0; i < tagData.length; ++i) {
        if (tagData[i] && tagData[i].type == 'x') {
            expiryTime = tagData[i].value;
            break;
        }
    }
    if (timeStamp + expiryTime - 300 < Math.round((new Date()).getTime()/1000)) {
        error("Invalid invoice expiry time.");
        return false;
    }
    if (!this.verifyChecksum(invoice.substring(0, splitPosition), Util.bech32ToFiveBitArray(data + checksum))) {
        error("Invalid invoice.");
        return false;
    }
    return true;
}

decodeTags(tagData) {
    var decodedTags = [];
    this.extractTags(tagData).forEach(tag => decodedTags.push(this.decodeTag(tag.type, tag.length, tag.data)));
    return decodedTags;
}

extractTags(str) {
    var tags = [];
    while (str.length > 0) {
        var type = str.charAt(0);
        var dataLength = Util.bech32ToInt(str.substring(1, 3));
        var data = str.substring(3, dataLength + 3);
        tags.push({
            'type': type,
            'length': dataLength,
            'data': data
        });
        str = str.substring(3 + dataLength, str.length);
    }
    return tags;
}

decodeTag(type, length, data) {
    switch (type) {
        case 'p':
            if (length !== 52) break;
            return {
                'type': type,
                'length': length,
                'description': 'payment_hash',
                'value': Util.byteArrayToHexString(Util.fiveBitArrayTo8BitArray(Util.bech32ToFiveBitArray(data)))
            };
        case 'd':
            return {
                'type': type,
                'length': length,
                'description': 'description',
                'value': Util.bech32ToUTF8String(data)
            };
        case 'n':
            if (length !== 53) break; 
            return {
                'type': type,
                'length': length,
                'description': 'payee_public_key',
                'value': Util.byteArrayToHexString(Util.fiveBitArrayTo8BitArray(Util.bech32ToFiveBitArray(data)))
            };
        case 'h':
            if (length !== 52) break; 
            return {
                'type': type,
                'length': length,
                'description': 'description_hash',
                'value': data
            };
        case 'x':
            return {
                'type': type,
                'length': length,
                'description': 'expiry',
                'value': Util.bech32ToInt(data)
            };
        case 'c':
            return {
                'type': type,
                'length': length,
                'description': 'min_final_cltv_expiry',
                'value': Util.bech32ToInt(data)
            };
        case 'f':
            let version = Util.bech32ToFiveBitArray(data.charAt(0))[0];
            if (version < 0 || version > 18) break; 
            data = data.substring(1, data.length);
            return {
                'type': type,
                'length': length,
                'description': 'fallback_address',
                'value': {
                    'version': version,
                    'fallback_address': data
                }
            };
        case 'r':
            data = Util.fiveBitArrayTo8BitArray(Util.bech32ToFiveBitArray(data));
            let pubkey = data.slice(0, 33);
            let shortChannelId = data.slice(33, 41);
            let feeBaseMsat = data.slice(41, 45);
            let feeProportionalMillionths = data.slice(45, 49);
            let cltvExpiryDelta = data.slice(49, 51);
            return {
                'type': type,
                'length': length,
                'description': 'routing_information',
                'value': {
                    'public_key': Util.byteArrayToHexString(pubkey),
                    'short_channel_id': Util.byteArrayToHexString(shortChannelId),
                    'fee_base_msat': Util.byteArrayToInt(feeBaseMsat),
                    'fee_proportional_millionths': Util.byteArrayToInt(feeProportionalMillionths),
                    'cltv_expiry_delta': Util.byteArrayToInt(cltvExpiryDelta)
                }
            };
        default:
            return {
                'type': type,
                'length': length,
                'description': 'unknown',
                'value': data
            };
    }
}

polymod(values) {
    var GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    var chk = 1;
    values.forEach((value) => {
        var b = (chk >> 25);
        chk = (chk & 0x1ffffff) << 5 ^ value;
        for (var i = 0; i < 5; i++) {
            if (((b >> i) & 1) === 1) {
                chk ^= GEN[i];
            } else {
                chk ^= 0;
            }
        }
    });
    return chk;
}

expand(str) {
    var array = [];
    for (var i = 0; i < str.length; i++) {
        array.push(str.charCodeAt(i) >> 5);
    }
    array.push(0);
    for (var i = 0; i < str.length; i++) {
        array.push(str.charCodeAt(i) & 31);
    }
    return array;
}

verifyChecksum(hrp, data) {
    hrp = this.expand(hrp);
    var all = hrp.concat(data);
    return this.polymod(all) === 1;
}
}