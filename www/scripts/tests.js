
function do_tests() {
    // test_pos_add_products()
    // setTimeout(() => navigate('promo', '1'), 1000)
    // setTimeout(() => test_addPayment(), 1000)
    // test_addPurchase()
    // test_category()
    // setTimeout(() => test_addPayment(), 1000)
    // openAddStoreForm()
    setTimeout(() => navigate('pos'), 1500)
    
}

function openAddStoreForm(){
    stores.showAddForm()
}

function simBarcodeScanned(){
    const barcode = '8901030743399'
    BCS_simulateBarcodeScanned(barcode)

    // const searchBox = get('pos_search')
    // searchBox.value = barcode;
    // searchBox.dispatchEvent(new Event('keyup', {keyCode: 'a'}))
}

async function test_category(){
    await sleep(500)
    navigate('category', { id: '87', deepLevel: 1, gtype: cats.gtype, parent: 0 });
}

async function test_addPurchase(){
    await sleep(1000)
    navigate('its_add_purchase', { vendor: ITS_VENDORS.data.items[0] });
}

async function test_payments_history(){
    await sleep(1000)
    navigate('its_purchases', { vendor: ITS_VENDORS.data.items[0] });
}

async function test_addPayment(){
    navigate('its_payment_edit', { vendor: ITS_VENDORS.data.items[0] })
    await sleep(100)
    const data = ITS_Payments.editForm.data;
    data.amount = '500'
    data.payment_date = '2019-05-01'
    data.payment_method = 'cash'
    data.reference = 'FP054'
    data.receiver_name = 'James bond'
}

async function test_pos_add_products(){
    await pos.loadAction.do();
    pos.setProductCount(100, 1)
    pos.setProductCount(92, 1)
    pos.showSubmitPopup();
}