const express = require('express');
const { newOrder, getSingleOrder, myOrders, orders, updateOrder, deleteOrder } = require('../controllers/orderController');
const router = express.Router();
const {isAuthenticatedUser, authorizedRoles} = require('../middlewares/authenticate');

router.route('/order/new').post(isAuthenticatedUser,newOrder);
router.route('/order/:id').get(isAuthenticatedUser,getSingleOrder);
router.route('/myorders').get(isAuthenticatedUser,myOrders);

// Admin Routes
router.route('/orders').get(isAuthenticatedUser, authorizedRoles('admin'),orders);
router.route('/order/:id').put(isAuthenticatedUser, authorizedRoles('admin'), updateOrder);
router.route('/order/:id').delete(isAuthenticatedUser, authorizedRoles('admin'), deleteOrder)

module.exports = router;