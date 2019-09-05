
function do_tests() {
    //dm.storeId = 1;
    // test_msg();
    State.onChange('online', online => console.log('Online:', online));
}

async function test_msg(){
    if(await Message.ask('Show another message?'))
        await Message.info('Boom ratata!');
}