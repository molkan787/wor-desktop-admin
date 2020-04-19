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
                'GST INVOICE',
            ],
            orderId: orderData.id,
            date: date.substr(0, 16),
            cashier: orderData.cashier || account.data.fullname,
            client: orderData.customer || 'Walk In',
            phone: orderData.telephone,
            delivery_address_1: orderData.shipping_address_1,
            delivery_address_2: orderData.shipping_address_2,
            delivery_city: orderData.shipping_city,
        }, true);
        
        for(let p of orderData.items || []){
            const n = p.name.toLowerCase()
            const iov = (n == 'other' || n == 'sales roundoff account');
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
            name: '#Total Payable Amount',
            amount: orderData.total,
        });
        r.addTotalsItem({
            name: 'To Pay',
            amount: orderData.total,
        });

        r._repeat('*');
        r._line(`Payment type: ${orderData.payment_method || 'Cash'}`);

        if(parseFloat(orderData.saved_amount) > 0){
            r.addSpace();
            r._fontBig();
            r._line(`You Saved ${fasc.formatPrice(orderData.saved_amount, true)} INR on MRP.`);
            r._fontNormal();
        }

        if(orderData.del_timing){
            r.addSpace();
            r._line('Delivery Date: ' + orderData.del_date);
            r._line('Delivery Timings:');
            r._line(orderData.del_timing)
        }

        r.addSpace();
        r.addSpace();
        r._line('Terms & condition apply');
        r.paragraph('* Please check product at the time of Delivery.', {indent: 2});
        r.paragraph('# Above prices are inclusive of all taxes.', {indent: 2});
        r.paragraph('This is computer generated Invoice hence no signature is required.');
        r.addSpace();
        r._line('Phone: ' + orderData.store.phone);
        r._line('Email: care@walkonretail.com');
        
        r.addSpace();
        r.paragraph('Thank you for shopping with us please download WALK ON RETAIL app from Playstore and get *home delivery.');
        r.addSpace();
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