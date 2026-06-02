const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Course = require('../models/Course');
const Blog = require('../models/Blog');

// @route   GET /api/search
// @desc    Global search across products, courses, and blog posts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { q, type, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query is required' 
            });
        }

        const searchRegex = new RegExp(q, 'i');
        const results = {};

        // Search products
        if (!type || type === 'products') {
            const products = await Product.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex },
                    { category: searchRegex }
                ],
                inStock: true
            })
            .select('name price images category rating')
            .limit(Number(limit));

            results.products = {
                count: products.length,
                data: products
            };
        }

        // Search courses
        if (!type || type === 'courses') {
            const courses = await Course.find({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex },
                    { category: searchRegex }
                ],
                isPublished: true
            })
            .populate('instructor', 'name avatar')
            .select('title price thumbnail category rating level enrollments')
            .limit(Number(limit));

            results.courses = {
                count: courses.length,
                data: courses
            };
        }

        // Search blog posts
        if (!type || type === 'blog') {
            const blogPosts = await Blog.find({
                $or: [
                    { title: searchRegex },
                    { excerpt: searchRegex },
                    { content: searchRegex },
                    { tags: searchRegex }
                ],
                status: 'published'
            })
            .populate('author', 'name avatar')
            .select('title excerpt featuredImage category publishedAt views')
            .limit(Number(limit));

            results.blog = {
                count: blogPosts.length,
                data: blogPosts
            };
        }

        // Calculate total results
        const totalResults = Object.values(results).reduce((sum, item) => sum + item.count, 0);

        res.status(200).json({
            success: true,
            query: q,
            totalResults,
            results
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions for autocomplete
// @access  Public
router.get('/suggestions', async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;

        if (!q || q.length < 2) {
            return res.json({ success: true, suggestions: [] });
        }

        const searchRegex = new RegExp('^' + q, 'i');

        // Get product names
        const products = await Product.find({ name: searchRegex })
            .select('name')
            .limit(Number(limit));

        // Get course titles
        const courses = await Course.find({ title: searchRegex, isPublished: true })
            .select('title')
            .limit(Number(limit));

        // Get blog titles
        const blogs = await Blog.find({ title: searchRegex, status: 'published' })
            .select('title')
            .limit(Number(limit));

        // Combine and format suggestions
        const suggestions = [
            ...products.map(p => ({ text: p.name, type: 'product' })),
            ...courses.map(c => ({ text: c.title, type: 'course' })),
            ...blogs.map(b => ({ text: b.title, type: 'blog' }))
        ].slice(0, Number(limit));

        res.status(200).json({
            success: true,
            suggestions
        });

    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/search/filters
// @desc    Get available filters for search
// @access  Public
router.get('/filters', async (req, res) => {
    try {
        const productCategories = await Product.distinct('category');
        const courseCategories = await Course.distinct('category');
        const blogCategories = await Blog.distinct('category');
        const courseLevels = await Course.distinct('level');

        res.status(200).json({
            success: true,
            filters: {
                productCategories,
                courseCategories,
                blogCategories,
                courseLevels
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
