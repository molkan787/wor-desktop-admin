class ReceiptPage{

    static setup(){
        this.elt = get('page_receipt');
        this.contentElt = get('pr_content');
        registerPage('receipt', this.elt, 'Receipt', data => { this.handle(data) });

        this.rawReceipt = '';
    }

    static handle(params){
        const { orderData, convertData } = params;
        const data = convertData ? this.convert(orderData) : orderData;
        
        data.gstData = this.generateGstData(data.items);
        console.log(data.gstData)
        data.store = dm.contactInfo;
        this.rawReceipt = Receipt.generate(data);
        
        this.contentElt.innerHTML = this.getString(this.rawReceipt);
    }

    static print(){
        Receipt.print(this.rawReceipt);
        goBack();
    }

    static close(){
        goBack();
    }

    static generateGstData(items){
        const tem = { hsn: 'HSN', txamt: 0, total: 0 };
        const d = {
            '0': {...tem},
            '5': {...tem},
            '12': {...tem},
            '18': {...tem},
            '28': {...tem},
        };

        for(let i of items){
            const gst = parseInt(i.gst || 0);
            const row = d[gst.toString()];
            if(!row) continue;
            const price = parseFloat(i.price);
            const qty = parseInt(i.q);
            const ltotal = price * qty;
            const tax = ltotal / (100 + gst) * gst;
            row.total += ltotal;
            row.txamt += tax;
            if(i.hsn) row.hsn = i.hsn
        }

        const totals = {
            total: 0,
            txamt: 0,
            cgst: 0,
            sgst: 0,
            cess: '0.00',
        };
        const rows = [];
        const keys = ['0', '5', '12', '18', '28'];
        for(let key of keys){
            const { hsn, txamt, total } = d[key];
            const half_txamt = txamt / 2;
            if(txamt <= 0) continue;
            rows.push({
                hsn,
                txamt: txamt.toFixed(2),
                total: total.toFixed(2),
                gst: key + '%',
                cgst: half_txamt.toFixed(2),
                sgst: half_txamt.toFixed(2),
                cess: '0.00'
            });
            totals.total += total;
            totals.txamt += txamt;
            totals.cgst += half_txamt;
            totals.sgst += half_txamt;
        }
        totals.total = totals.total.toFixed(2);
        totals.txamt = totals.txamt.toFixed(2);
        totals.cgst = totals.cgst.toFixed(2);
        totals.sgst = totals.sgst.toFixed(2);

        return { totals, rows };
    }

    static getString(lines){
        let str = '';
        for(let line of lines){
            if (line.font.x == 2){
                str += `<h3>${line.text}</h3>\n`;
            }else{
                str += line.text + "\n";
            }
        }
        return str;
    }

    static convert(data){
        console.log('Convert():', data);
        const result = {
            id: data.order_id,
            date: data.date_added,
            total: parseFloat(data.total),
            customer: data.customer,
            del_date: data.del_date,
            del_timing: data.del_timing,
            saved_amount: data.saved_amount,
            telephone: data.telephone,
            shipping_address_1: data.shipping_address_1,
            shipping_address_2: data.shipping_address_2,
            shipping_city: data.shipping_city,
            payment_method: data.payment_method,
        }

        const items = [];
        let subTotal = 0;
        let tax = 0;
        for(let item of data.items){
            const price = parseFloat(item.price);
            const q = parseInt(item.quantity);
            const gst = parseInt(item.gst) || 0;
            const ltotal = price * q;
            const ltax = ltotal / (1 + gst / 100);

            subTotal += ltotal - ltax;
            tax += ltax;
            
            items.push({
                name: item.name,
                price,
                q,
                gst,
                hsn: item.hsn,
            });
        }

        result.subTotal = subTotal;
        result.tax = tax;
        result.items = items;

        return result;
    }

}

registerInitFunc(() => { ReceiptPage.setup() });