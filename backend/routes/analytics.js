const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Blog = require('../models/Blog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // User stats
        const totalUsers = await User.countDocuments();
        const newUsers = await User.countDocuments(dateFilter);
        
        // Product stats
        const totalProducts = await Product.countDocuments();
        const outOfStock = await Product.countDocuments({ inStock: false });
        
        // Order stats
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });
        
        // Revenue calculation
        const revenueData = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
        
        // Course stats
        const totalCourses = await Course.countDocuments({ isPublished: true });
        const totalEnrollments = await Course.aggregate([
            { $group: { _id: null, total: { $sum: '$enrollments' } } }
        ]);
        
        // Blog stats
        const totalPosts = await Blog.countDocuments({ status: 'published' });
        const totalViews = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);

        // Top products
        const topProducts = await Product.find()
            .sort('-rating.average')
            .limit(5)
            .select('name price rating images');

        // Top courses
        const topCourses = await Course.find({ isPublished: true })
            .sort('-enrollments')
            .limit(5)
            .select('title price enrollments thumbnail');

        // Recent orders
        const recentOrders = await Order.find()
            .sort('-createdAt')
            .limit(10)
            .populate('user', 'name email')
            .select('orderNumber total status createdAt');

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    new: newUsers
                },
                products: {
                    total: totalProducts,
                    outOfStock
                },
                orders: {
                    total: totalOrders,
                    pending: pendingOrders,
                    completed: completedOrders
                },
                revenue: {
                    total: totalRevenue
                },
                courses: {
                    total: totalCourses,
                    totalEnrollments: totalEnrollments.length > 0 ? totalEnrollments[0].total : 0
                },
                blog: {
                    totalPosts,
                    totalViews: totalViews.length > 0 ? totalViews[0].total : 0
                },
                topProducts,
                topCourses,
                recentOrders
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/analytics/sales
// @desc    Get sales analytics
// @access  Private/Admin
router.get('/sales', protect, authorize('admin'), async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        
        let groupBy;
        switch (period) {
            case 'day':
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                break;
            case 'week':
                groupBy = { $week: '$createdAt' };
                break;
            case 'year':
                groupBy = { $year: '$createdAt' };
                break;
            default:
                groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        }

        const salesData = await Order.aggregate([
            { $match: { isPaid: true } },
            {
                $group: {
                    _id: groupBy,
                    totalSales: { $sum: '$total' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: salesData
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/analytics/products
// @desc    Get product analytics
// @access  Private/Admin
router.get('/products', protect, authorize('admin'), async (req, res) => {
    try {
        // Products by category
        const productsByCategory = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' }
                }
            }
        ]);

        // Low stock products
        const lowStock = await Product.find({ stock: { $lt: 10, $gt: 0 } })
            .select('name stock category')
            .sort('stock');

        res.status(200).json({
            success: true,
            data: {
                productsByCategory,
                lowStock
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/analytics/users
// @desc    Get user analytics
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        // User registration over time
        const userGrowth = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Users by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                userGrowth,
                usersByRole
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
