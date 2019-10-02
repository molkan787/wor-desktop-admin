class Receipt{

    static generate(orderData){
        console.log('orderData:', orderData)
        const r = this.rb;

        const date = orderData.date || timeToDate()

        r.clear();
        r.addHeader({
            title: 'WalkOn Retail',
            subtitles: [
                `(${orderData.store.name})`,
                orderData.store.address + ' ' + orderData.store.phone,
                ' ',
                `Order Date: ${date.substr(0, 16)}      GSTN:_____`,
                ' ',
                'GST INVOICE',
            ],
            orderId: orderData.id,
            cashier: orderData.cashier || account.data.fullname,
            client: orderData.customer || 'Walk In',
        }, true);
        
        for(let p of orderData.items || []){
            const iov = p.name.toLowerCase() == 'other';
            r.addItem(p, iov);
        }

        // if (orderData.other_val) {
        //     r.addItem({
        //         name: 'Other charge',
        //         price: orderData.other_val,
        //         q: 0,
        //     });
        // }

        r.addTotalsItem({
            name: 'Total',
            amount: orderData.total,
            showTotalItems: true,
            isFinal: true,
        });
        r._line('GST Summary:', LEFT);
        r._separator();

        const gstTemplate = [
            {name: 'HSN', prop: 'hsn', len: 3},
            {name: 'GST', prop: 'gst', len: 5},
            {name: 'TxAmt', prop: 'txamt', len: 8},
            {name: 'CGST', prop: 'cgst', len: 7},
            {name: 'SGST', prop: 'sgst', len: 7},
            {name: 'Cess', prop: 'cess', len: 6},
            {name: 'Total', prop: 'total', len: 8},
        ];
        r.table(orderData.gstData.rows, gstTemplate, true);
        r._separator();

        const gstTotals = orderData.gstData.totals;
        gstTemplate.shift();
        gstTemplate[0].prop = 'text';
        gstTemplate[0].len = 8;
        gstTemplate[0].align = LEFT;
        gstTotals.text = 'Total';
        r._tableRow(gstTotals, gstTemplate);
        r._separator();
        r.addTotalsItem({
            name: 'Payable Amount',
            amount: orderData.total,
        });
        r.addTotalsItem({
            name: 'To Pay',
            amount: orderData.total,
        });

        r.addSpace();
        r._line(`You Saved ${fasc.formatPrice(orderData.saved_amount, true)} INR on this order.`);
        r.addSpace();

        if(orderData.del_timing){
            r.addSpace();
            r._line('Delivery Date: ' + orderData.del_date);
            r._line('Delivery Timings: ' + orderData.del_timing);
        }

        r.addSpace();
        r.addSpace();
        r._line('* For return, please visit our store.');
        r.addSpace();
        r._line('Phone: ' + orderData.store.phone);
        r._line('Email: care@walkonretail.com');
        
        r.addSpace();
        r._line('Thank you for shopping.');
        r._line('Have a great day.');
        

        return r.getLines();
    }

    static print(data){
        let lines;
        if(data instanceof Array){
            lines = data;
        }else{
            lines = this.generate(data);
        }

        Printer.print(lines);
    }

}

Receipt.rb = new POSReceiptBuilder();