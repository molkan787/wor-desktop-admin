var uiis;

function uiis_init() {
    uiis = {
        holders: [],

        tabs: function (elt) {
            var tabs_elt = attr(elt, 'for');
            if (tabs_elt.length) tabs_elt = get(tabs_elt);
            else return;

            tabs_elt.className += ' tabs_container';
            var btns = get_bc('item', elt);
            var tabs = get_bc('tab', tabs_elt);
            var active_tab = get_bc('active tab', tabs_elt)[0];
            var active_btn = get_bc('active item', elt)[0];

            var holder = {
                activeBtn: active_btn,
                activeTab: active_tab,
                btns: btns,
                tabs: tabs,
                buttonClick: function (btnIndex) {
                    class_rm(this.activeBtn, 'active');
                    class_rm(this.activeTab, 'active');
                    this.activeBtn = this.btns[btnIndex];
                    this.activeTab = this.tabs[btnIndex];
                    class_add(this.activeBtn, 'active');
                    class_add(this.activeTab, 'active');
                    typeof elt.onTabChanged == 'function' ? elt.onTabChanged(btnIndex) : 0;
                }
            };


            for (var i = 0; i < btns.length; i++) {
                attr(btns[i], 'index', i.toString());
                btns[i].onclick = function () {
                    const index = parseInt(attr(this, 'index'));
                    holder.buttonClick(index);
                }
            }

            this.holders.push(holder);
        },

        init_components: function (parent) {
            foreach(get_bc('tabular menu', parent), function (elt) {
                uiis.tabs(elt);
            });
        }
    };
}