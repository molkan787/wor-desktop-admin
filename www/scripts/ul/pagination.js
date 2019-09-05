function Pagination(itemsPerPage, btnsContainers, options) {
    var pg = {
        itemsPerPage: itemsPerPage,
        prevBtns: [],
        nextBtns: [],
        prefixCurrentParam: options && options.prefixParam,

        currentPage: 0,

        // Methods
        setState: function (start, length) {
            this.currentPage = start / this.itemsPerPage;
            if (start <= 0)
                pg_disableBtns(this.prevBtns);
            else
                pg_enableBtns(this.prevBtns);

            if (length < this.itemsPerPage)
                pg_disableBtns(this.nextBtns);
            else
                pg_enableBtns(this.nextBtns);
        },

        previousPage: function () {
            this._movePage(-1);
        },
        nextPage: function () {
            this._movePage(1);
        },

        _movePage(dir){
            if(this.prefixCurrentParam){
                reloadPage(param_current, this.currentPage + dir);
            }else{
                reloadPage(this.currentPage + dir);
            }
        },

        // Handlers
        prevBtnClick: function () {
            if (pg.currentPage > 0) {
                pg.previousPage();
            }
        },
        nextBtnClick: function () {
            pg.nextPage();
        }
    };

    for (var i = 0; i < btnsContainers.length; i++) {
        var con = btnsContainers[i];
        class_add(con, 'pagination_controls');
        var prevBtn = crt_elt('button', con);
        var nextBtn = crt_elt('button', con);

        prevBtn.className = nextBtn.className = 'textButton mtm';

        prevBtn.innerHTML = '<i class="left arrow icon"></i> Previous page';
        nextBtn.innerHTML = '<i class="right arrow icon" style="float: right"></i> Next page';

        prevBtn.onclick = pg.prevBtnClick;
        nextBtn.onclick = pg.nextBtnClick;

        pg.prevBtns.push(prevBtn);
        pg.nextBtns.push(nextBtn);
    }

    return pg;
}

function pg_enableBtns(btns) {
    for (var i = 0; i < btns.length; i++) {
        attr_rm(btns[i], 'disabled');
    }
}

function pg_disableBtns(btns) {
    for (var i = 0; i < btns.length; i++) {
        attr(btns[i], 'disabled', 1);
    }
}