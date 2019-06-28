'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

const bech32CharValues = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

class Util {
    static getFormattedPrice(value) {
        return value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4});
    }

    static byteArrayToInt(byteArray) {
        var value = 0;
        for (var i = 0; i < byteArray.length; ++i) {
            value = (value << 8) + byteArray[i];
        }
        return value;
    }

    static bech32ToUTF8String(str) {
        var int5Array = this.bech32ToFiveBitArray(str);
        var byteArray = this.fiveBitArrayTo8BitArray(int5Array);
    
        var utf8String = '';
        for (var i = 0; i < byteArray.length; i++) {
            utf8String += '%' + ('0' + byteArray[i].toString(16)).slice(-2);
        }
        return decodeURIComponent(utf8String);
    }

    static fiveBitArrayTo8BitArray(int5Array, includeOverflow) {
        var count = 0;
        var buffer = 0;
        var byteArray = [];
        int5Array.forEach((value) => {
            buffer = (buffer << 5) + value;
            count += 5;
            if (count >= 8) {
                byteArray.push(buffer >> (count - 8) & 255);
                count -= 8;
            }
        });
        if (includeOverflow && count > 0) {
            byteArray.push(buffer << (8 - count) & 255);
        }
        return byteArray;
    }

    static byteArrayToHexString(byteArray) {
        return Array.prototype.map.call(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }

    static bech32ToInt(str) {
        var sum = 0;
        for (var i = 0; i < str.length; i++) {
            sum = sum * 32;
            sum = sum + bech32CharValues.indexOf(str.charAt(i));
        }
        return sum;
    }
    
    static bech32ToFiveBitArray(str) {
        var array = [];
        for (var i = 0; i < str.length; i++) {
            array.push(bech32CharValues.indexOf(str.charAt(i)));
        }
        return array;
    }

    static b64toBlob(b64Data, contentType='', sliceSize=512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
      
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
      
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
      
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
      
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }
}
exports.Util = Util;
