class CPS_UI{

    static init(){
        this.elts = {
            popup: get('cps_import_pp'),
            header: get('cps_import_pp_header'),
            ppButton: get('cps_import_pp_btn'),
            confirmButton: get('cps_import_pp_submitBtn'),
            sourceCatsTab: get('cps_import_source_list'),
            targetCatsTab: get('cps_import_target_list'),
            conclusionTab: get('cps_import_conclusion')
        }
        this.popupDimmer = ui.dimmer.create(this.elts.popup, true);
        this.tabs = {
            currentIndex: 0,
            current(move){
                if(typeof move == 'number') this.currentIndex += move;
                return this.items[this.currentIndex];
            },
            items: [
                'cps_import_source_list',
                'cps_import_target_list',
                'cps_import_conclusion',
            ],
            titles: [
                'Select category to import',
                'Select destination category',
                'Confirmation of import'
            ]
        }

        this.importStep = null;
        this.state = {
            importSource: null,
            importTarget: null,
        }

        this.importAction = fetchAction.create('product/copyCPSP_FromCategory');
    }

    static async submitImport(){
        try {
            this.popupDimmer.show('Importing...')
            await this.importAction.do({
                source_cat: this.state.importSource.id,
                target_cat: this.state.importTarget.id,
            })
            await alert(`All product from "${this.state.importSource.text}" were successfully imported!`)
            ui.popup.hide();
        } catch (error) {
            error_msg1()
        }
        this.popupDimmer.hide()
    }

    static openImportPopup(){
        this.importStep = 'source';
        this.tabs.currentIndex = 0;
        this.elts.sourceCatsTab.style.display = 'inline-block';
        this.elts.targetCatsTab.style.display = 'none';
        this.elts.conclusionTab.style.display = 'none';
        this.elts.sourceCatsTab.style.marginLeft = '0%';
        this.elts.targetCatsTab.style.marginLeft = '0%';
        this.elts.sourceCatsTab.style.opacity = 1;
        this.elts.targetCatsTab.style.opacity = 0;
        this.elts.conclusionTab.style.opacity = 0;
        this.__loadCats(dm.cps.cats, this.elts.sourceCatsTab);
        this.__loadCats(dm.cats, this.elts.targetCatsTab);
        ui.popup.show(this.elts.popup);
    }

    static nextImportStep(payload){
        if(this.importStep == 'source'){
            this.state.importSource = payload;
            this.importStep = 'target';
        }
        else if(this.importStep == 'target'){
            this.state.importTarget = payload;
            this.importStep = 'conclusion';
            const sourceEl = document.querySelector('#cps_import_conclusion .source.parent');
            const targetEl = document.querySelector('#cps_import_conclusion .target.parent');
            sourceEl.innerHTML = '';
            targetEl.innerHTML = '';
            sourceEl.appendChild(cats.createPanel(this.state.importSource, true));
            targetEl.appendChild(cats.createPanel(this.state.importTarget, true));
        }
        this.switchTabs(1);
    }

    static previousImportStep(){
        if(this.importStep == 'conclusion') this.importStep = 'target';
        else if(this.importStep == 'target') this.importStep = 'source';
        this.switchTabs(-1);
    }

    static switchTabs(dir){
        const mvPx = ( (dir * -1) * 200 ) + 'px';
        anime({
            targets: `#${this.tabs.current()}`,
            opacity: 0,
            marginLeft: ( dir * -100 ) + '%',
            easing: 'easeInExpo',
            duration: 300,
            complete: () => {
                get(this.tabs.current()).style.display = 'none';
                const current = this.tabs.current(dir);
                const tabIdx = this.tabs.currentIndex;
                val(this.elts.header, this.tabs.titles[tabIdx]);
                val(this.elts.ppButton, tabIdx == 0 ? 'Cancel' : 'Back');
                const el = get(current);
                el.style.display = 'inline-block';
                el.style.marginLeft = ( dir * 100 ) + '%';
                anime({
                    targets: `#${current}`,
                    opacity: 1,
                    marginLeft: '0%',
                    easing: 'easeOutExpo',
                    duration: 500
                })
            }
        })
    }

    static __loadCats(catsArr, el){
        el.innerHTML = '';
        catsArr.forEach(
            cat => {
                if(cat.gtype == '0'){
                    const pan = cats.createPanel(cat, true)
                    pan.onclick = () => this.nextImportStep(cat);
                    el.appendChild(pan)
                }
            }
        );
    }

    static __buttonClick(){
        if(this.tabs.currentIndex == 0){
            ui.popup.hide();
        }else{
            this.previousImportStep();
        }
    }

}

registerInitFunc(() => CPS_UI.init());