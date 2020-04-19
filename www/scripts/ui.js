let pageModalTitle;
let pageModalContent;
let pageModalOpen = false;
let pagesElt;
var navHistory = [];
var pages = {};
var page_prev;
var page_current;
var param_current;

function forceNextReload(){
    forceReload = true;
}

const init_funcs = [];
function registerInitFunc(func){
    init_funcs.push(func);
}

var ui = {};

function ui_init() {

    document.title = config.appNameShort + ` [${config.appVersionName}]`;

    ui.voidContainer = get('void_container');
    pageModalTitle = get('pm_title');
    pageModalContent = get('pm_content');
    get('pm_back_btn').onclick = goBack;

    pagesElt = get('pages');

    ui.fab = get('fab');
    ui.fabIcon = get('fab_icon');

    Message.init();
    pdr_init();
    uiu_init();
    uiis_init();
    ui_fasc_init();
    mx_init();
    leftmenu_init();
    header_init();
    ui_products_init();
    ui_product_init();
    ui_orders_init();
    ui_order_init();
    ui_customers_init();
    banners_init();
    banner_init();
    categories_init();
    category_init();
    setting_init();
    users_init();
    stores_init();
    master_setting_init();
    pos_init();
    home_init();
    account_init();
    ls_init();
    promos_init();
    promo_init();

    ui_popup_init();
    dialogs_init();

    updateUiScale();

    uiis.init_components();
    BarcodeScanner_init();

    lm.onNavigate = navigate;

    State.onChange('online', visualOnlineIndicator);

    for(let func of init_funcs){
        func();
    }
}

function registerPage(slug, element, title, updater, headbarAction, fab) {
    pages[slug] = {
        slug: slug,
        element: element,
        title: title,
        updater: updater,
        headbarAction: headbarAction,
        fab: fab
    };
    uiis.init_components(element);
    element.parentNode.removeChild(element);
    // pdr.addElement(element);
}

function addToHistory(page, param) {
    navHistory.push({ slug: page, param: param});
}

function reloadPage() {
    var param = arguments.length ? (arguments.length > 1 ? arguments : arguments[0]) : param_current;
    if (page_current) {
        if (navHistory.length > 0) {
            navHistory.pop();
        }
        navigate(page_current.slug, param, false, true);
    }
}

var forceReload = false;
function goBack(reload) {
    if (navHistory.length < 1) return;
    navHistory.pop();
    var page = navHistory.pop();
    if (page.slug == 'category') reload = true;
    navigate(page.slug || 'home', page.param, true, reload || forceReload);
    forceReload = false;
}

function navigate(page_slug, params, isBack, forceReload) {
    if (page_slug == 'logout') {
        confirmLogout();
        return;
    }
    const page = pages[page_slug];
    if (!page) return;

    const iaa = Object.prototype.toString.call(params) === "[object Arguments]";
    const param = iaa ? params[0] : params;

    addToHistory(page_slug, param);
    
    const is_same = page_current && page_current.slug == page_slug && param == param_current;
    if (!forceReload && is_same) return;

    page_prev = page_current;
    page_current = page;
    param_current = param;

    let inTitleBackButton = false;
    let backButton = (attr(page.element, 'rbb') == '1');

    let title = '';
    if (typeof page.title == 'string') {
        title = page.title;
    } else if (typeof page.title == 'function') {

        var data = page.title(param);
        if (typeof data == 'string') {
            title = data;
        } else if (typeof data == 'object') {
            title = data.title;
            if(data.ibb){
                inTitleBackButton = true;
            }
            if (data.backButton) {
                backButton = true;
            }
        }

    }

    const hideTitle = attr(page_current.element, 'hideTitle');

    // page_current.element.style.display = 'block';

    ui.hb.setActionIcon(page.headbarAction);

    if (page.fab) {
        ui.fabIcon.className = 'icon ' + page.fab.icon;
        ui.fab.onclick = page.fab.handler;
        ui.fab.style.display = 'block';
    } else {
        ui.fab.style.display = 'none';
    }

    const __update = () => {
        if (page.updater && (!isBack || forceReload)) {
            if (iaa) {
                page.updater(...params);
            } else {
                page.updater(param);
            }
        }
    };

    const targets = '#mtitle, #' + pagesElt.id;

    const __prepare = function(){
        if (hideTitle) {
            get('mtitle').style.display = 'none';
            class_rm(pagesElt, 'haveTitle');
        } else {
            if(inTitleBackButton){
                val('mtitle', `
                    <button onclick="goBack()"><i class="left arrow icon"></i></button>
                    ${title}
                `);
            }else{
                val('mtitle', title);
            }
            get('mtitle').style.display = 'block';
            class_add(pagesElt, 'haveTitle');
        }
        setChild(page_current.element, pagesElt);
        __update();
        if(is_same) return;
        anime({
            targets,
            scale: 1,
            opacity: 1,
            easing: 'easeOutQuad',
            duration: 300,
        })
    }

    if (backButton) {
        openPageInModal(page_current.element, title);
        __update();
    } else {
        const wasModalOpen = pageModalOpen;
        closePageModal();
        if(is_same || wasModalOpen){
            __prepare();
            return;
        }
        anime({
            targets,
            scale: 0.99,
            opacity: 0,
            duration: 150,
            easing: 'easeOutQuad',
            complete: __prepare,
        })
    }

}

function hideFab(){
    ui.fab.style.display = 'none';
}
function hideHbFab(){
    ui.hb.setActionIcon(null);
}

function confirmLogout() {
    msg.confirm(txt('confirm_logout'), function (answer) {
        if (answer == 'yes') {
            dm.setToken('');
            ls.show();
        }
    });
}

function ui_device_backBtn_click() {
    goBack();
}

function openPageInModal(elt, title){
    const child = pageModalContent.children[0];
    if(child) pageModalContent.removeChild(child);
    val(pageModalTitle, title);
    pageModalContent.appendChild(elt);
    openPageModal();
}

function openPageModal(){
    if(pageModalOpen) return;
    pageModalOpen = true;
    $('#page_modal').modal({closable: false}).modal('show');
}

function closePageModal(){
    if(!pageModalOpen) return;
    pageModalOpen = false;
    $('#page_modal').modal('hide');
}

function visualOnlineIndicator(isOnline){

    if(isOnline){
        get('offline_bubble').className = 'offline_bubble online';
        val('offline_bubble_text', 'Online');
        setTimeout(() => {
            anime({
                targets: '#offline_bubble',
                opacity: 0,
                scale: 0.9,
                duration: 400,
                easing: 'easeInQuad',
                complete(){
                    get('offline_bubble').style.display = 'none';
                }
            })
        }, 4000);
    }else{
        const el = get('offline_bubble');
        el.className = 'offline_bubble';
        el.style.transform = 'scale(0.9)';
        el.style.display = 'block';
        val('offline_bubble_text', 'Offline');
        anime({
            targets: '#offline_bubble',
            opacity: 1,
            scale: 1,
            duration: 150,
            easing: 'easeInQuad'
        });
    }

}

window.addEventListener('resize', updateUiScale)

const {webFrame} = require('electron')
let _uiScalePrevWidth = null;
let _uiScale = 1;
function updateUiScale(){
    const w = Math.floor(window.innerWidth * _uiScale);
    let scale = w > 1200 ? 1 : w / 1200;
    if(scale < 0.7) scale = 0.7;
    _uiScale = scale;
    webFrame.setZoomFactor(scale);
}