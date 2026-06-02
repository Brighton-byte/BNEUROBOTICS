const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/blog
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            search,
            tag,
            author,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        let query = { status: 'published' };

        if (category) query.category = category;
        if (tag) query.tags = tag;
        if (author) query.author = author;
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        let sortOption = {};
        if (sort === 'views') sortOption.views = -1;
        else if (sort === 'likes') sortOption.likes = -1;
        else if (sort === 'oldest') sortOption.publishedAt = 1;
        else sortOption.publishedAt = -1;

        const skip = (page - 1) * limit;

        const posts = await Blog.find(query)
            .populate('author', 'name avatar bio')
            .sort(sortOption)
            .limit(Number(limit))
            .skip(skip)
            .select('-content -comments');

        const total = await Blog.countDocuments(query);

        res.status(200).json({
            success: true,
            count: posts.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: posts
        });

    } catch (error) {
        console.error('Get blog posts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/blog/:id
// @desc    Get single blog post
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id)
            .populate('author', 'name avatar bio socialLinks')
            .populate('comments.user', 'name avatar')
            .populate('comments.replies.user', 'name avatar')
            .populate('relatedPosts', 'title slug excerpt featuredImage category publishedAt');

        if (!post) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        // Increment views
        post.views += 1;
        await post.save();

        res.status(200).json({
            success: true,
            data: post
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/blog
// @desc    Create blog post
// @access  Private/Admin/Instructor
router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
    try {
        req.body.author = req.user.id;
        
        if (req.body.status === 'published' && !req.body.publishedAt) {
            req.body.publishedAt = Date.now();
        }

        const post = await Blog.create(req.body);

        res.status(201).json({
            success: true,
            data: post
        });

    } catch (error) {
        console.error('Create blog post error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/blog/:id
// @desc    Update blog post
// @access  Private/Admin/Author
router.put('/:id', protect, async (req, res) => {
    try {
        let post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        // Check authorization
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // If publishing, set publishedAt
        if (req.body.status === 'published' && post.status !== 'published') {
            req.body.publishedAt = Date.now();
        }

        post = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: post
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/blog/:id
// @desc    Delete blog post
// @access  Private/Admin/Author
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        // Check authorization
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await post.remove();

        res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/blog/:id/like
// @desc    Like/unlike blog post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user.id);

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(req.user.id);
        }

        await post.save();

        res.status(200).json({
            success: true,
            likes: post.likes.length
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/blog/:id/comments
// @desc    Add comment to blog post
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        const comment = {
            user: req.user.id,
            content: req.body.content
        };

        post.comments.push(comment);
        await post.save();

        res.status(201).json({
            success: true,
            message: 'Comment added successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/blog/:id/comments/:commentId/reply
// @desc    Reply to comment
// @access  Private
router.post('/:id/comments/:commentId/reply', protect, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        const reply = {
            user: req.user.id,
            content: req.body.content
        };

        comment.replies.push(reply);
        await post.save();

        res.status(201).json({
            success: true,
            message: 'Reply added successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
