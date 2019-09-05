const printJS = require('print-js');
function printDailyReport(data){
    var sales = data.total_sales;
    sales = dr_getTable(['Total', 'Online', 'Walk in'],
    [fasc.formatPrice(sales.total), fasc.formatPrice(sales.online), fasc.formatPrice(sales.walkon)]);
    var orders = data.orders;
    orders = dr_getTable(['Total', 'Completed', 'Pending'], [orders.total, orders.completed, orders.pending]);
    var customers = data.customers;
    customers = dr_getTable(['Total', 'Verified', 'Not verified'], [customers.total, customers.verified, customers.not_verified]);

    var page = `
    <style>
        table {
            width: 100%;
            border: 1px solid #333;
            border-collapse: collapse;
        }
        table > thead > tr > td, table > tbody > tr > td{
            padding: 4px;
        }
    </style>
    <h2 style="text-align:center">WalkOnRetail Daily Report</h2>
    <br /><br />
    <h3>Date: ${data.date}</h3>
    <h3>Store: ${data.store}</h3>
    <br /><br />
    <h3>Sales:</h3>
    ${sales}
    <br /><br />
    <h3>Orders:</h3>
    ${orders}
    <br /><br />
    <h3>Customer registration:</h3>
    ${customers}
    `;



    // cordova.plugins.printer.print(page, 'WOR-Report ' + data.date);
    get('toPrint').innerHTML = page;
    printJS('toPrint', 'html');
    get('toPrint').innerHTML = '';
}

function dr_getTable(labels, values){
    return `
    <table border="1">
        <colgroup>
        <col style="width:33%"/>
        <col style="width:33%"/>
        <col style="width:33%"/>
        </colgroup>
        <thead>
            <tr>
                <td>${labels[0]}</td>
                <td>${labels[1]}</td>
                <td>${labels[2]}</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${values[0]}</td>
                <td>${values[1]}</td>
                <td>${values[2]}</td>
            </tr>
        </tbody>
    </table>
    `;
}