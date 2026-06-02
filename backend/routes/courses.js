const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses with filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            level,
            search,
            isFree,
            featured,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        let query = { isPublished: true };

        if (category) query.category = category;
        if (level) query.level = level;
        if (isFree) query.isFree = true;
        if (featured) query.isFeatured = true;
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else if (sort === 'rating') sortOption['rating.average'] = -1;
        else if (sort === 'popular') sortOption.enrollments = -1;
        else sortOption.createdAt = -1;

        const skip = (page - 1) * limit;

        const courses = await Course.find(query)
            .populate('instructor', 'name avatar bio')
            .sort(sortOption)
            .limit(Number(limit))
            .skip(skip)
            .select('-modules -reviews');

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            count: courses.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: courses
        });

    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name avatar bio socialLinks')
            .populate('reviews.user', 'name avatar');

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({
            success: true,
            data: course
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in course
// @access  Private
router.post('/:id/enroll', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already enrolled
        const alreadyEnrolled = course.enrolledStudents.find(
            student => student.user.toString() === req.user.id
        );

        if (alreadyEnrolled) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already enrolled in this course' 
            });
        }

        course.enrolledStudents.push({
            user: req.user.id,
            progress: {
                completedLessons: [],
                percentage: 0
            }
        });
        course.enrollments += 1;
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Successfully enrolled in course'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/courses/:id/progress
// @desc    Update course progress
// @access  Private
router.put('/:id/progress', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const enrollment = course.enrolledStudents.find(
            student => student.user.toString() === req.user.id
        );

        if (!enrollment) {
            return res.status(400).json({ 
                success: false, 
                message: 'Not enrolled in this course' 
            });
        }

        const { lessonId } = req.body;
        
        if (!enrollment.progress.completedLessons.includes(lessonId)) {
            enrollment.progress.completedLessons.push(lessonId);
            
            // Calculate progress percentage
            let totalLessons = 0;
            course.modules.forEach(module => {
                totalLessons += module.lessons.length;
            });
            enrollment.progress.percentage = Math.round(
                (enrollment.progress.completedLessons.length / totalLessons) * 100
            );

            // Check if course completed
            if (enrollment.progress.percentage === 100) {
                enrollment.completedAt = Date.now();
            }

            await course.save();
        }

        res.status(200).json({
            success: true,
            data: enrollment.progress
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/courses/:id/reviews
// @desc    Add course review
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if enrolled
        const isEnrolled = course.enrolledStudents.find(
            student => student.user.toString() === req.user.id
        );

        if (!isEnrolled) {
            return res.status(400).json({ 
                success: false, 
                message: 'Must be enrolled to review' 
            });
        }

        // Check if already reviewed
        const alreadyReviewed = course.reviews.find(
            review => review.user.toString() === req.user.id
        );

        if (alreadyReviewed) {
            return res.status(400).json({ 
                success: false, 
                message: 'Course already reviewed' 
            });
        }

        const review = {
            user: req.user.id,
            rating: req.body.rating,
            comment: req.body.comment
        };

        course.reviews.push(review);
        
        // Calculate average rating
        const sum = course.reviews.reduce((acc, review) => acc + review.rating, 0);
        course.rating.average = (sum / course.reviews.length).toFixed(1);
        course.rating.count = course.reviews.length;
        
        await course.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
