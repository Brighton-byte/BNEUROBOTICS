const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
        maxlength: [200, 'Name cannot be more than 200 characters']
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
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['AI', 'Robotics', 'IoT', 'Sensors', 'Controllers', 'Kits', 'Components', 'Other']
    },
    subcategory: {
        type: String
    },
    brand: {
        type: String
    },
    sku: {
        type: String,
        unique: true
    },
    images: [{
        url: String,
        alt: String
    }],
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    inStock: {
        type: Boolean,
        default: true
    },
    specifications: {
        type: Map,
        of: String
    },
    features: [String],
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
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNewArrival: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    weight: {
        value: Number,
        unit: {
            type: String,
            enum: ['g', 'kg', 'oz', 'lb']
        }
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: {
            type: String,
            enum: ['cm', 'in']
        }
    },
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    downloads: [{
        name: String,
        url: String,
        type: {
            type: String,
            enum: ['datasheet', 'manual', 'software', 'schematic', 'other']
        }
    }],
    videoUrl: String,
    warranty: {
        type: String
    },
    shippingInfo: {
        type: String
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

// Create slug from name
ProductSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    this.updatedAt = Date.now();
    next();
});

// Calculate average rating
ProductSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.rating.average = 0;
        this.rating.count = 0;
    } else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.rating.average = (sum / this.reviews.length).toFixed(1);
        this.rating.count = this.reviews.length;
    }
};

module.exports = mongoose.model('Product', ProductSchema);
