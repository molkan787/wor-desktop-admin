const LEFT = 'left';
const RIGHT = 'right';
const CENTER = 'center';

class POSReceiptBuilder {

    constructor(options) {
        const _options = options || {};

        this.lineLength = _options.lineLength || 44;
        this.numLength = 4;
        this.totalLength = _options.totalLength || 8;
        this.priceLength = _options.priceLength || 7;
        this.quantityLength = _options.quantityLength || 2;
        this.nameLength = this.lineLength - this.totalLength - this.priceLength - this.quantityLength - this.numLength - 4;

        this.tPriceLength = this.totalLength;
        this.tNameLength = 23;

        this.spaceChar = ' ';
        this.separatorChar = '-';
        this.currencyChar = '';
        this.fontSize = {
            x: 1,
            y: 1
        };
        this.clear();
    }

    clear() {
        this.lines = [];
        this.addedSepAfterItems = false;
        this.numPointer = 1;
    }

    getLines() {
        return [...this.lines];
    }

    getString() {
        return this.lines.join("\n");
    }

    // ===========================================

    addHeader(data, doNotCenterTitle) {
        this._fontBig();
        this._line(data.title, doNotCenterTitle ? false : CENTER);

        this._fontNormal();
        let ctr = 1;
        for (let st of data.subtitles) {
            this._line(st, doNotCenterTitle ? false : CENTER);
        }
        this._emptyLine();

        this._line(`Order Number: ${data.orderId}`);
        this._line(`Order Date: ${data.date}`);
        this._line(`Customer Name: ${data.client}`);
        this._line(`Mobile No: ${data.phone}`);
        if(data.delivery_address_1){
            this._line(`Address: ${data.delivery_address_1}`);
            if(data.delivery_address_2) this._line(`         ${data.delivery_address_2}`);
            if(data.delivery_city) this._line(`         ${data.delivery_city}`);
        }
        // this._line(`Date: ${data.date}`);
        // this._line(`Cashier: ${data.cashier}`);
        this._emptyLine();
        this._repeat('-');
        this._item({ name: 'Product', q: 'Q', price: 'Price', total: 'Total', num: 'S.No' });
        this._repeat('-');

    }

    addItem(item, minimal) {
        const num = minimal ? '  ' : ('0' + (this.numPointer++)).substr(-2);
        const ltotal = item.q ? item.price * item.q : item.price;
        this._item({
            num,
            name: item.name,
            q: minimal ? ' ' : this._qty(item.q),
            price: minimal ? ' ' : this._price(item.price),
            total: this._price(ltotal)
        });
    }

    addTotalsItem(item) {
        let nlen = this.tNameLength;
        let plen = this.tPriceLength;
        if (item.text) {
            nlen = item.name.length + 1;
            plen += this.tNameLength - nlen;
        }
        const rLen = this.lineLength - nlen - plen - 1;
        this._fontNormal();
        let line = '';
        if(item.showTotalItems){
            line += this._block('Items: ' + ('0' + (this.numPointer-1)).substr(-2), rLen, LEFT);
        }
        const lp = item.leftPadding ? '       ' : '';
        line += this._block(lp + item.name + ':', nlen, RIGHT);
        line += this.spaceChar;
        if (item.text) {
            line += this._block(item.text, plen, RIGHT);
        } else {
            line += this._block(this._price(item.amount), plen, RIGHT);
        }

        if (!this.addedSepAfterItems) {
            // this._emptyLine();
            this._repeat('-');
            this.addedSepAfterItems = true;
        }

        this._line(line, RIGHT);

        if (item.isFinal) {
            this._separator();
            // this._emptyLine();
        }
    }

    addNormalMessage(text, prependSapce, prependSep) {
        this._fontNormal();
        this._addMessage(text, prependSapce, prependSep);
    }

    addBigMessage(text, prependSapce, prependSep) {
        this._fontBig();
        this._addMessage(text, prependSapce, prependSep);
    }

    addSeparator(fontSize, prependSapce) {
        if (prependSapce) this._emptyLine();
        if (fontSize == 2) this._fontBig(); else this._fontNormal();
        this._separator(34);
    }

    addSpace(fontSize, prependSep) {
        if (prependSep) this.addSeparator(fontSize);
        this._emptyLine();
    }

    addCustomSeparator(c){
        this._repeat(c);
    }

    table(rows, template, header){
        if(header){
            this._tableRow(true, template);
        }
        for(let row of rows){
            this._tableRow(row, template);
        }
    }

    _tableRow(row, template){
        let line = '';
        for(let cell of template){
            const text = typeof row == 'boolean' ? cell.name : row[cell.prop];
            line += this._block(text, cell.len, cell.align || RIGHT);
        }
        this._line(line, LEFT);
    }

    paragraph(text, options){
        const { indent } = options || {};
        const words = text.split(' ');
        let line = '';
        let first = true;
        for(let word of words){
            const other = (indent && !first) ? indent + 1 : 1;
            if(line.length + word.length + other > this.lineLength) {
                if(!first && indent){
                    this._line(' '.repeat(indent) + line);
                }else{
                    this._line(line);
                }
                first = false;
                line = word;
            }else{
                if(line) line += ' ';
                line += word;
            }
        }
        if(!first && indent){
            this._line(' '.repeat(indent) + line);
        }else{
            this._line(line);
        }
    }

    // ===========================================

    _fontNormal() {
        this.fontSize.x = 1;
        this.fontSize.y = 1;
    }

    _fontBig() {
        this.fontSize.x = 2;
        this.fontSize.y = 2;
    }


    _addMessage(text, prependSapce, prependSep) {
        if (prependSapce) this._emptyLine();
        if (prependSep) this._separator(34);
        this._line(text, false);
    }

    _item(item) {
        let line = '';
        line += this._block(item.num, this.numLength);
        line += this.spaceChar;
        line += this._block(item.name, this.nameLength);
        line += this.spaceChar;
        line += this._block(item.q, this.quantityLength);
        line += this.spaceChar;
        line += this._block(item.q ? item.price : '', this.priceLength, RIGHT);
        line += this.spaceChar;
        line += this._block(item.total, this.totalLength, RIGHT);

        this._fontNormal();
        this._line(line);
    }

    _block(_text, size, align) {
        const text = _text.toString();
        const spacesCount = size - text.length;
        if (spacesCount == 0) {
            return text;
        } else if (spacesCount < 0) {
            return text.substring(0, size);
        }

        if (align == RIGHT) {
            return this._getSpaces(spacesCount) + text;
        } else if (align == CENTER) {
            const rp = Math.round(spacesCount / 2);
            const lp = spacesCount - rp;
            return this._getSpaces(lp) + text + this._getSpaces(rp);
        } else { // Default align 'left'
            return text + this._getSpaces(spacesCount);
        }
    }

    _getSpaces(n) {
        return this.spaceChar.repeat(n);
    }

    _separator(w) {
        this._line(this.separatorChar.repeat(w || this.lineLength), w ? false : CENTER);
    }

    _repeat(c, w) {
        this._line(c.repeat(w || this.lineLength), w ? false : CENTER);
    }

    _underline() {
        let line = '';
        let str = this.lines[this.lines.length - 1].text;
        for (let chr of str) {
            line += chr == ' ' ? ' ' : this.separatorChar;
        }
        this._line(line, false);
    }

    _emptyLine() {
        this._line('', false);
    }

    _line(line, align) {
        let str;
        if (typeof align == 'boolean' && !align) {
            str = line;
        } else {
            str = this._block(line, this.lineLength, align);
        }
        this.lines.push({
            font: { ...this.fontSize },
            text: str,
        });
    }

    // ------------------------------------------

    _price(value) {
        let val = parseFloat(value);
        if (val >= 0) {
            return this.currencyChar + val.toFixed(2);
        } else {
            val *= -1;
            return '- ' + this.currencyChar + val.toFixed(2);
        }
    }

    _qty(q) {
        return q;
        // return q ? 'x' + q : '';
    }
}