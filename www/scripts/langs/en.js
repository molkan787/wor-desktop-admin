var langEN = {
    error_txt1: 'We could not complete the action, Please check your internet access.',
    error_2: 'We could not save changes, Please check your internet access.',
    error_3: 'We could not load data, Please check your internet access.',
    msg_1: 'Changes was successfully saved!',
    msg_2: '{%1} was successfully deleted!',
    msg_3: '{%1} was successfully added!',
    user_created: 'User was successfully created!',
    ask_1: 'Do you really want to delete {%1}?',
    confirm_customer_delete: 'Do you really want to delete customer "{%1}" ?',
    confirm_store_delete: 'Do you really want to delete store "{%1}" ?',
    confirm_delete: 'Do you really want to delete {%1}?',
    confirm_city_delete: 'Do you really want to delete {%1} "{%2}" ?',
    confirm_cat_delete: 'Do you really want to delete category "{%1}" ?',
    confirm_brand_delete: 'Do you really want to delete brand "{%1}" ?',
    warn_store_del: 'Store "{%1}" will be permanently deleted',
    wrong_password: 'Wrong password',
    enter_password: 'Please type the password',
    valid_store_name: 'Please type a valid store name (At least 5 characters)',
    valid_store_owner: 'Please type a valid store owner name (At least 8 characters)',
    select_store_city: 'Please select a City',
    select_store_region: 'Please select a Region',
    store_created: 'Store was successfully created! And an Admin account was created for this store.',
    confirm_add_store: 'Do you confirm adding store with a name "{%1}" ?',
    invalid_password: 'Password should be at least 8 characters long.',
    passwords_doesnt_match: 'New passwords does not match',
    password_success: 'The password was successfully updated!',
    fill_all_input: 'Please fill all fields correctly.',
    user_not_found: 'This username does not exist',
    confirm_logout: 'Are you sure you want to logout?',
    save_before_adding: 'Please save this {%1} before adding {%2}',
    confirm_delete_selected: 'Do you really want to delete all seleted',
    products_copy_success: 'Product(s) was successfully copied',

    select_store_to_visit: 'Please select store you want to visit, This can be done from Stores page.',

    invalid_city_names: 'Names are too short, Please type at least 2 charatcters',

    confirm_product_return: 'Are you sure to return product "{%1}" from this order? This action cannot be undone.',

    fullname_must_be: 'The Fullname must be longer than 8 characters & shorter than 40 characters',
    username_must_be: 'The Username must be longer than 5 characters & shorter than 30 characters',

    action_confirm_reset: 'Do you really want to Reset the password for user "{%1}" ?',
    action_confirm_suspend: 'Do you really want to Suspend user "{%1}" ?',
    action_confirm_unsuspend: 'Do you really want to Unsuspend user "{%1}" ?',
    action_confirm_delete: 'Do you really want to Permanently Delete  user "{%1}" ?',

    updating: 'Updating',
    action_progress_reset: 'Reseting',
    action_progress_suspend: 'Suspending',
    action_progress_unsuspend: 'Unsuspending',
    action_progress_delete: 'Deleting',

    msg_new_pwd: 'Here is the new password for user "{%1}" : {%2}',

    pos_success: 'The order was successfully placed! \nOrder Id: {%1}',
    pos_confirm: 'Do you confirm submit of the order with a total of {%1} ?',

    user_1: 'Master Admin',
    user_2: 'Master Sub Admin',
    user_3: 'Accountant',
    user_4: 'C R',
    user_11: 'Store Admin',
    user_12: 'Sub Admin',
    user_13: 'Inventory Boy',
    user_14: 'Delivery Boy'
};

function txt(textName) {
    if (langEN[textName]) {
        var text = langEN[textName];

        for (var i = 1; i < arguments.length; i++){
            text = text.replace('{%' + i + '}', arguments[i]);
        }

        return text;

    }else return '';
}