const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    videoUrl: String,
    duration: Number, // in minutes
    content: String,
    resources: [{
        name: String,
        url: String,
        type: String
    }],
    quiz: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String
    }],
    order: {
        type: Number,
        required: true
    }
});

const ModuleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    lessons: [LessonSchema],
    order: {
        type: Number,
        required: true
    }
});

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [5000, 'Description cannot be more than 5000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [500, 'Short description cannot be more than 500 characters']
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['AI', 'Machine Learning', 'Robotics', 'IoT', 'Programming', 'Electronics', 'Other']
    },
    level: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    originalPrice: {
        type: Number
    },
    isFree: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String
    },
    previewVideo: {
        type: String
    },
    modules: [ModuleSchema],
    duration: {
        type: Number, // total duration in hours
        default: 0
    },
    language: {
        type: String,
        default: 'English'
    },
    requirements: [String],
    whatYouWillLearn: [String],
    tags: [String],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    enrollments: {
        type: Number,
        default: 0
    },
    enrolledStudents: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        progress: {
            completedLessons: [String],
            percentage: {
                type: Number,
                default: 0
            }
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        completedAt: Date
    }],
    certificate: {
        enabled: {
            type: Boolean,
            default: true
        },
        template: String
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    metaTitle: String,
    metaDescription: String,
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
CourseSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Course', CourseSchema);
