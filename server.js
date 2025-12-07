import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { poolPromise } from './src/config/db.config.js';
import userRouter from './src/routers/user.router.js';
import authRouter from './src/routers/auth.router.js';
import productRouter from './src/routers/product.router.js';
import cartRouter from './src/routers/cart.router.js';
import categoryRouter from './src/routers/category.router.js';
import shopRouter from './src/routers/shop.router.js';
import userAddressRouter from './src/routers/userAddress.router.js'
import orderRoutes from './src/routers/order.router.js';
import shopOrderRoutes from "./src/routers/shop.order.router.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded data
app.use(morgan('combined')); // HTTP request logger

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Local Market Backend Server is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/shops', shopRouter);
app.use("/api/address", userAddressRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/shop/orders", shopOrderRoutes);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        requestedPath: req.originalUrl
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Test database connection and start server
poolPromise.then(pool => {
    if (pool) {
        console.log('✅ Database connection established successfully');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Health check available at: http://localhost:${PORT}/`);
        });
    } else {
        console.error('❌ Failed to establish database connection. Server not started.');
        process.exit(1);
    }
}).catch(err => {
    console.error('❌ Error initializing database connection:', err);
    process.exit(1);
});

