const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetPasswordToken -verificationToken')
            .populate('enrolledCourses', 'title thumbnail')
            .populate('completedCourses', 'title thumbnail');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin or Own Profile
router.put('/:id', protect, async (req, res) => {
    try {
        // Check authorization
        if (req.params.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Don't allow changing password or role through this route
        delete req.body.password;
        if (req.user.role !== 'admin') {
            delete req.body.role;
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/users/:id/cart
// @desc    Add item to cart
// @access  Private
router.post('/:id/cart', protect, async (req, res) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);
        const { productId, quantity = 1 } = req.body;

        // Check if item already in cart
        const itemIndex = user.cart.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // Update quantity
            user.cart[itemIndex].quantity += quantity;
        } else {
            // Add new item
            user.cart.push({ product: productId, quantity });
        }

        await user.save();

        const updatedUser = await User.findById(req.params.id)
            .populate('cart.product', 'name price images');

        res.status(200).json({
            success: true,
            data: updatedUser.cart
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/users/:id/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:id/cart/:itemId', protect, async (req, res) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);
        user.cart = user.cart.filter(item => item._id.toString() !== req.params.itemId);
        await user.save();

        res.status(200).json({
            success: true,
            data: user.cart
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/users/:id/wishlist
// @desc    Add/remove item from wishlist
// @access  Private
router.post('/:id/wishlist', protect, async (req, res) => {
    try {
        if (req.params.id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);
        const { productId } = req.body;

        const itemIndex = user.wishlist.indexOf(productId);

        if (itemIndex > -1) {
            // Remove from wishlist
            user.wishlist.splice(itemIndex, 1);
        } else {
            // Add to wishlist
            user.wishlist.push(productId);
        }

        await user.save();

        const updatedUser = await User.findById(req.params.id)
            .populate('wishlist', 'name price images');

        res.status(200).json({
            success: true,
            data: updatedUser.wishlist
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
