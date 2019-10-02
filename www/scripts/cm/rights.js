class Rights{

    static init(){
        this.checkers = { // ut = userType
            its_vendors: ut => ut < 4 || (ut > 10 && ut < 13),
            its_del: ut => ut < 3 || (ut > 10 && ut < 13),

            order_write: ut => (ut < 3) || (ut > 10 && ut < 15 && ut != 13),

            customer_del: ut => ut < 3 || (ut > 10 && ut < 13),
            customer_contact_info: ut => ut < 3,
        };
    }

    static known(obj){
        return !!this.checkers[obj];
    }

    static check(userData, obj){
        if(!obj){
            obj = userData;
            userData = account.data;
        }
        const user_type = parseInt(userData.user_type);
        const fun = this.checkers[obj];
        return fun ? fun(user_type, userData) : 0;
    }

}

Rights.init();