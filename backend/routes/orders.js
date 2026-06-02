const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            subtotal,
            tax,
            shippingCost,
            discount,
            total
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // Verify products and stock
        for (let item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: `Product not found: ${item.name}` 
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for: ${item.name}` 
                });
            }
        }

        const order = await Order.create({
            user: req.user.id,
            items,
            shippingAddress,
            paymentMethod,
            subtotal,
            tax,
            shippingCost,
            discount,
            total
        });

        // Update product stock
        for (let item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/orders
// @desc    Get all orders (admin) or user orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        
        // If not admin, only show user's orders
        if (req.user.role !== 'admin') {
            query.user = req.user.id;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('items.product', 'name')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Make sure user owns order or is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            updateTime: req.body.update_time,
            emailAddress: req.body.email_address
        };
        order.status = 'processing';

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            data: updatedOrder
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put('/:id/deliver', protect, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'delivered';
        if (req.body.trackingNumber) {
            order.trackingNumber = req.body.trackingNumber;
        }

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            data: updatedOrder
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = req.body.status;
        
        if (req.body.status === 'shipped' && req.body.trackingNumber) {
            order.trackingNumber = req.body.trackingNumber;
        }

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            data: updatedOrder
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check authorization
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Can only cancel if not shipped or delivered
        if (['shipped', 'delivered'].includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot cancel shipped or delivered orders' 
            });
        }

        order.status = 'cancelled';
        await order.save();

        // Restore product stock
        for (let item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
