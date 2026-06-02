const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    excerpt: {
        type: String,
        maxlength: [500, 'Excerpt cannot be more than 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    featuredImage: {
        type: String
    },
    category: {
        type: String,
        required: true,
        enum: ['AI', 'Robotics', 'IoT', 'Machine Learning', 'Technology', 'Tutorials', 'News', 'Other']
    },
    tags: [String],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        replies: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            content: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    readTime: {
        type: Number, // in minutes
        default: 5
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },
    relatedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }],
    publishedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create slug from title
BlogSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    
    // Calculate read time based on content
    if (this.isModified('content')) {
        const wordsPerMinute = 200;
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / wordsPerMinute);
    }
    
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Blog', BlogSchema);
