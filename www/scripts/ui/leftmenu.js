var lm;

function leftmenu_init() {
    lm = ui.lm = {
        isOpen: false,
        elt: get('left_menu'),
        elts: {
            ordersCount: get('lm_order_count'),
            expandButton: get('lm_expand_btn'),
            expandButtonIcon: get('lm_expand_btn_icon'),
            phIcon: get('lm_item_ph_icon'),
            phSpan: get('lm_item_ph_span')
        },
        _open_anim: {
            targets: '#left_menu_subcon',
            height: '190px',
            easing: 'easeOutExpo',
            duration: 500
        },
        _close_anim: {
            targets: '#left_menu_subcon',
            height: '50px',
            easing: 'easeOutExpo',
            duration: 400,
        },
        current_item: null,
        itemsMap: {},

        open: function () {
            // ui.mx.bbp.show(0);
            // anime(this._open_anim);
            // this.isOpen = true;
            // this._updateExpandButton();
        },

        close: function () {
            // ui.mx.bbp.hide(0);
            // anime(this._close_anim);
            // this.isOpen = false;
            // this._updateExpandButton();
        },

        toggle: function (){
            if(this.isOpen){
                this.close();
            }else{
                this.open();
            }
        },

        nav_click: function () {
            var action = this.getAttribute('action');
            var param = this.getAttribute('param');
            var rss = this.getAttribute('rss');
            var parent = this.getAttribute('parent');
            var group = this.getAttribute('group');

            if(!action) return;

            if ((rss || param == 'normal') && parseInt(account.data.user_type) < 10 && dm.storeId == 0) {
                msg.show(txt('select_store_to_visit'));
                return;
            }

            if(parent){
                lm.groupItem = {name: action, el: this};
                lm.showItemsGroup(this, action);
            }else if (lm.onNavigate) {
                if(lm.groupItem && lm.groupItem.name != group){
                    lm.hideItemsGroup(lm.groupItem.el, lm.groupItem.name);
                    lm.groupItem = null;
                }
                if(action != 'logout') lm.setCurrentItem(this);
                lm.onNavigate(action, param);
            }
        },

        showItemsGroup(parent, name){
            class_add(parent, 'open');
            const id = 'items_group_' + name;
            const itemsEl = document.querySelector('#' + id + ' > .items');
            const height = itemsEl.getClientRects()[0].height;
            anime({
                targets: '#' + id,
                height: height + 'px',
                opacity: 1,
                duration: 400,
                easing: 'easeOutQuad'
            })
        },
        hideItemsGroup(parent, name){
            class_rm(parent, 'open');
            const id = 'items_group_' + name;
            anime({
                targets: '#' + id,
                height: 0,
                opacity: 0,
                duration: 300,
                easing: 'easeOutQuad'
            })
        },

        setCurrentItem: function(item){
            if (this.current_item){
                this.current_item.style.backgroundColor = 'unset';
            }
            this.current_item = item;
            this.current_item.style.backgroundColor = '#F9F9F9';
        },

        _updateExpandButton: function (){
            const dir = this.isOpen ? 'up' : 'down';
            this.elts.expandButtonIcon.className = `arrow ${dir} icon`;
        },

        setAvPages: function (userData) {
            //navigate('order', 81); return;
            var ai = userData.ai;
            var items = get_bt('a', get('lm_items'));
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var act = attr(item, 'action');
                this.itemsMap[act] = item;
                if (act == 'promos') act = 'banners';
                var aii = ai[act];
                if ((typeof aii != 'undefined' && parseInt(aii) == 0) || (act == 'its_vendors' && parseInt(userData.user_type) > 12)) { // || act == 'stores'
                    item.style.display = 'none';
                } else {
                    item.style.display = 'block';
                }
            }
            if (parseInt(userData.user_type) == 1) {
                get('lm_item_ms').style.display = 'block';
                get('lm_item_mu').style.display = 'block';
            } else {
                get('lm_item_ms').style.display = 'none';
                get('lm_item_mu').style.display = 'none';
            }

            const page = navPerUser[userData.user_type];
            this.setCurrentItem(this.itemsMap[page])
            navigate(page);
            // navigate('products');
        },

        setOrdersCount: function (count) {
            val(orders.elts.statsNew, count);
            val(this.elts.ordersCount, count);
            if (count < 1) {
                this.elts.ordersCount.style.display = 'none';
            } else {
                this.elts.ordersCount.style.display = 'inline-block';
            }
        }
    };

    var items_parent = get('left_menu_subcon');
    var items = get_bt('a', items_parent);
    foreach(items, function (item) {
        item.onclick = lm.nav_click;
    });

    lm.elt.addEventListener("focusout", () => { 
        setTimeout(() => {
            lm.close()
        }, 100);
     });

    ui.mx.bbp.setClickHandler(0, function () {
        lm.close();
    });

}


var navPerUser = {
   1: 'stores',
   2: 'stores',
   3: 'stores',
   4: 'pos',
   11: 'dashboard',
   12: 'dashboard',
   13: 'products',
   14: 'orders'
};