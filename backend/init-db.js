// Database Initialization Script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Course = require('./models/Course');
const Blog = require('./models/Blog');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Create admin user
const createAdminUser = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@bneurobotics.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        const admin = new User({
            name: 'Admin User',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isAdmin: true,
            isVerified: true
        });

        await admin.save();
        console.log('✅ Admin user created successfully');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('   ⚠️  Please change the password after first login!');
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
};

// Create sample products
const createSampleProducts = async () => {
    try {
        const count = await Product.countDocuments();
        if (count > 0) {
            console.log('ℹ️  Products already exist');
            return;
        }

        const sampleProducts = [
            {
                name: 'AI Vision Camera',
                description: 'Advanced AI-powered vision system for robotics applications',
                price: 299.99,
                category: 'AI',
                stock: 50,
                image: 'images/ai-camera1.jpg',
                featured: true,
                specifications: {
                    resolution: '4K',
                    fps: '60',
                    aiProcessing: 'Yes'
                }
            },
            {
                name: 'IoT Development Kit',
                description: 'Complete IoT development kit with sensors and microcontroller',
                price: 149.99,
                category: 'IoT',
                stock: 100,
                image: 'images/Iot-dev-kit.webp',
                featured: true
            },
            {
                name: 'Robotic Arm Pro',
                description: 'Professional-grade 6-axis robotic arm',
                price: 1299.99,
                category: 'Robotics',
                stock: 25,
                image: 'images/robotic-arm-pro.jpg',
                featured: true
            }
        ];

        await Product.insertMany(sampleProducts);
        console.log(`✅ Created ${sampleProducts.length} sample products`);
    } catch (error) {
        console.error('❌ Error creating sample products:', error);
    }
};

// Create sample courses
const createSampleCourses = async () => {
    try {
        const count = await Course.countDocuments();
        if (count > 0) {
            console.log('ℹ️  Courses already exist');
            return;
        }

        const sampleCourses = [
            {
                title: 'Introduction to AI and Robotics',
                description: 'Learn the fundamentals of artificial intelligence and robotics',
                instructor: 'Dr. Sarah Johnson',
                duration: '8 weeks',
                level: 'Beginner',
                price: 99.99,
                image: 'images/ai-vision1.jpg',
                curriculum: [
                    'Introduction to AI',
                    'Robotics Basics',
                    'Sensors and Actuators',
                    'Programming for Robotics'
                ]
            },
            {
                title: 'IoT Development Masterclass',
                description: 'Master IoT development from basics to advanced projects',
                instructor: 'Michael Chen',
                duration: '10 weeks',
                level: 'Intermediate',
                price: 149.99,
                image: 'images/Iot-dev-kit.webp',
                curriculum: [
                    'IoT Architecture',
                    'Sensor Integration',
                    'Cloud Connectivity',
                    'Real-world Projects'
                ]
            }
        ];

        await Course.insertMany(sampleCourses);
        console.log(`✅ Created ${sampleCourses.length} sample courses`);
    } catch (error) {
        console.error('❌ Error creating sample courses:', error);
    }
};

// Create sample blog posts
const createSampleBlogPosts = async () => {
    try {
        const count = await Blog.countDocuments();
        if (count > 0) {
            console.log('ℹ️  Blog posts already exist');
            return;
        }

        // Get admin user for author
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('⚠️  No admin user found, skipping blog posts');
            return;
        }

        const sampleBlogs = [
            {
                title: 'Introduction to Artificial Intelligence in Robotics',
                excerpt: 'Explore how AI is revolutionizing the field of robotics, enabling machines to learn, adapt, and make intelligent decisions.',
                content: `
                    <h2>The Power of AI in Modern Robotics</h2>
                    <p>Artificial Intelligence has become the cornerstone of modern robotics, enabling machines to perform complex tasks that were once thought impossible. From autonomous vehicles to surgical robots, AI is transforming how robots interact with the world.</p>
                    
                    <h3>Key Applications</h3>
                    <ul>
                        <li>Computer Vision and Object Recognition</li>
                        <li>Natural Language Processing</li>
                        <li>Path Planning and Navigation</li>
                        <li>Predictive Maintenance</li>
                    </ul>
                    
                    <h3>The Future of AI Robotics</h3>
                    <p>As AI technology continues to evolve, we can expect even more sophisticated robotic systems that can learn from experience and adapt to new situations in real-time.</p>
                `,
                category: 'AI',
                tags: ['AI', 'Robotics', 'Machine Learning', 'Automation'],
                author: admin._id,
                image: 'images/ai-vision1.jpg',
                status: 'published',
                views: 1250,
                featured: true
            },
            {
                title: 'Building Your First IoT Device: A Beginner\'s Guide',
                excerpt: 'Step-by-step tutorial on creating your first Internet of Things device using our IoT Development Kit.',
                content: `
                    <h2>Getting Started with IoT</h2>
                    <p>The Internet of Things (IoT) is revolutionizing how we interact with technology. In this guide, we'll walk through creating your first IoT device.</p>
                    
                    <h3>What You'll Need</h3>
                    <ul>
                        <li>IoT Development Kit</li>
                        <li>WiFi Connection</li>
                        <li>Basic Programming Knowledge</li>
                    </ul>
                    
                    <h3>Step-by-Step Instructions</h3>
                    <p>Follow our comprehensive guide to build a temperature monitoring system that sends data to the cloud.</p>
                `,
                category: 'IoT',
                tags: ['IoT', 'Tutorial', 'DIY', 'Sensors'],
                author: admin._id,
                image: 'images/Iot-dev-kit.webp',
                status: 'published',
                views: 980
            },
            {
                title: 'Deep Learning for Computer Vision Applications',
                excerpt: 'Learn how deep learning techniques are transforming computer vision and image recognition systems.',
                content: `
                    <h2>Computer Vision Revolution</h2>
                    <p>Deep learning has revolutionized computer vision, enabling machines to see and understand the world with unprecedented accuracy.</p>
                    
                    <h3>Popular Architectures</h3>
                    <ul>
                        <li>Convolutional Neural Networks (CNNs)</li>
                        <li>YOLO (You Only Look Once)</li>
                        <li>ResNet and Advanced Architectures</li>
                    </ul>
                `,
                category: 'Machine Learning',
                tags: ['Deep Learning', 'Computer Vision', 'Neural Networks'],
                author: admin._id,
                image: 'images/ai-camera1.jpg',
                status: 'published',
                views: 1450
            }
        ];

        await Blog.insertMany(sampleBlogs);
        console.log(`✅ Created ${sampleBlogs.length} sample blog posts`);
    } catch (error) {
        console.error('❌ Error creating sample blog posts:', error);
    }
};

// Main initialization function
const initializeDatabase = async () => {
    console.log('🚀 Starting database initialization...\n');

    await connectDB();
    
    console.log('\n📝 Creating admin user...');
    await createAdminUser();
    
    console.log('\n📦 Creating sample products...');
    await createSampleProducts();
    
    console.log('\n🎓 Creating sample courses...');
    await createSampleCourses();
    
    console.log('\n📰 Creating sample blog posts...');
    await createSampleBlogPosts();
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Admin user created');
    console.log('   - Sample products added');
    console.log('   - Sample courses added');
    console.log('   - Sample blog posts added');
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@bneurobotics.com'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
    console.log('\n⚠️  Remember to change the admin password after first login!');
    console.log('\n🌐 You can now start the server with: npm start');
    
    process.exit(0);
};

// Run initialization
initializeDatabase();
