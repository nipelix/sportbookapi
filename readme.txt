# Express Router Usage Guide

## Introduction to Express Router

Express Router is a powerful middleware system that allows you to create modular, mountable route handlers. This document explains how the router is implemented and used in this project.

## Table of Contents

- [Basic Router Structure](#basic-router-structure)
- [Router Configuration](#router-configuration)
- [Authentication Router](#authentication-router)
- [Middleware Integration](#middleware-integration)
- [Request Validation](#request-validation)
- [Route Parameters](#route-parameters)
- [Response Handling](#response-handling)
- [Error Handling](#error-handling)
- [JWT Implementation](#jwt-implementation)
- [Route Examples](#route-examples)

## Basic Router Structure

Each router in the application follows this pattern:

```javascript
// Import Express
const express = require('express');

// Create router instance
const router = express.Router();

// Define routes
router.get('/path', handler);
router.post('/path', handler);
// etc.

// Export router
module.exports = router;
```

## Router Configuration

### Creating and exporting a router:

```javascript
const express = require('express');
const router = express.Router();

// Define your routes here

module.exports = router;
```

### Importing and using a router in your main application:

```javascript
const app = express();
const authRouter = require('./routes/Auth');

app.use('/auth', authRouter);
```

This mounts all routes from `authRouter` under the `/auth` path prefix.

## Authentication Router

The Authentication Router manages user authentication, token refresh, and user creation:

```javascript
// Auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Login route
router.post('/login',
    // Validation middleware
    body('username').notEmpty().withMessage('api.username_required'),
    body('password').notEmpty().withMessage('api.password_required'),
    async (req, res) => {
        // Handle login logic
    }
);

// Refresh token route
router.post('/refresh-token', async (req, res) => {
    // Handle token refresh logic
});

// Create user route
router.post('/create-user',
    // Validation middleware
    body('Username').notEmpty().withMessage('api.username_required'),
    async (req, res) => {
        // Handle user creation
    }
);

module.exports = router;
```

## Middleware Integration

Middleware functions can be applied to specific routes or to all routes in a router:

### Global middleware for a router:

```javascript
// Apply Auth middleware to all routes in this router
const Auth = require("../Middleware/Auth");
router.use(Auth);
```

### Route-specific middleware:

```javascript
router.post('/path',
    specificMiddleware,
    (req, res) => {
        // Route handler
    }
);
```

## Request Validation

This project uses `express-validator` for request validation:

### Parameter validation:

```javascript
const { param, validationResult } = require('express-validator');

router.get('/:lng',
    param('lng').notEmpty().withMessage('api.feed_lng_required')
        .isString().withMessage('api.feed_lng_not_string'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array()[0].msg });
        }

        // Route logic
    }
);
```

### Body validation:

```javascript
const { body, validationResult } = require('express-validator');

router.post('/login',
    body('username').notEmpty().withMessage('api.username_required'),
    body('password').notEmpty().withMessage('api.password_required')
        .isLength({ min: 4 }).withMessage('api.min_4_password'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array()[0].msg });
        }

        // Route logic
    }
);
```

## Route Parameters

Express Router allows you to define routes with parameters:

```javascript
// /:lng/:type/:count - All are route parameters
router.get('/:lng/:type/:count', async (req, res) => {
    const { lng, type, count } = req.params;

    // Use the parameters in your route logic
});
```

You can access query parameters using `req.query`:

```javascript
// GET /feed?sportID=1&champID=2
router.get('/feed', (req, res) => {
    const { sportID, champID } = req.query;

    // Use the query parameters
});
```

## Response Handling

Express provides methods for sending different types of responses:

```javascript
// JSON response with status code
res.status(200).json({ result: true, data: items });

// Error response
res.status(400).json({ msg: 'Error message' });

// Simple response
res.send('Hello World');
```

## Error Handling

Error handling is crucial for robust API development:

```javascript
router.post('/path', async (req, res) => {
    try {
        // Attempt some operations
        const result = await someAsyncOperation();
        return res.status(200).json(result);
    } catch (e) {
        console.log(e); // Log the error
        return res.status(401).json({ msg: "global_error" });
    }
});
```

## JWT Implementation

JWT (JSON Web Token) is used for authentication:

```javascript
// Generating tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        {
            Username: user.get('Username'),
            UserRole: user.get('UserRole'),
            ID: user.get('ID'),
            tokenType: 'access'
        },
        config.jwt.privateKey,
        {...config.jwt.base}
    );

    const refreshToken = jwt.sign(
        {
            ID: user.get('ID'),
            tokenType: 'refresh'
        },
        config.jwt.privateKey,
        {...config.jwt.refresh}
    );

    const decoded = jwt.decode(accessToken);

    return {
        accessToken,
        refreshToken,
        expiresAt: decoded.exp * 1000
    };
};

// Verifying tokens
try {
    const decoded = jwt.verify(refreshToken, config.jwt.privateKey);
    // Token is valid, proceed with the request
} catch (err) {
    // Token is invalid
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'api.refresh_token_expired' });
    }
    return res.status(403).json({ msg: 'api.invalid_refresh_token' });
}
```

## Route Examples

### GET request with parameters and validation:

```javascript
// Category.js
router.get('/:lng',
    param('lng').notEmpty().withMessage('api.feed_lng_required')
        .isString().withMessage('api.feed_lng_not_string'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(401).json({ msg: errors.array()[0] });
        }

        try {
            // Get language parameter
            const { lng } = req.params;

            // Database operations
            // ...

            // Return response
            return res.status(200).json({
                sports_all: sportAll,
                sports_popular: sportPopular,
                champs_popular: champsPopular,
                favorites_list: favoriteList
            });
        } catch (e) {
            console.log(e);
            return res.status(401).json({ msg: "global_error" });
        }
    }
);
```

### POST request with body validation:

```javascript
// Favorite.js
router.post('/',
    body('isFavorite').isBoolean().withMessage('api.favorite_type_required'),
    body('id').notEmpty().withMessage('api.champs_required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array()[0].msg });
        }

        try {
            const { isFavorite, id } = req.body;

            if (isFavorite) {
                await Favorite.forge({ Champ: id, User: req.user.get('ID') }).save({});
                return res.status(200).json({});
            } else if (!isFavorite) {
                await Favorite.where({ Champ: id, User: req.user.get('ID') }).destroy();
                return res.status(200).json({});
            }

            return res.status(401).send({ msg: 'api.global_error' });
        } catch (e) {
            return res.status(401).send({ msg: 'api.global_error' });
        }
    }
);
```

### Complex GET request with multiple parameters and query options:

```javascript
// Feed.js
router.get('/:lng/:type/:count',
    param('lng').notEmpty().withMessage('api.feed_lng_required')
        .isString().withMessage('api.feed_lng_not_string'),
    param('type').notEmpty().withMessage('api.feed_type_required')
        .isString().withMessage('api.feed_type_not_string')
        .isIn(['line','live']).withMessage('api.invalid_feed_type'),
    param('count').notEmpty().withMessage('api.feed_count_required')
        .isNumeric().withMessage('api.feed_count_not_string'),
    body('sports').optional().isArray().withMessage('api.feed_params_sports_not_array'),
    body('champs').optional().isArray().withMessage('api.feed_params_champs_not_array'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                result: false,
                message: errors.array()
            });
        }

        try {
            // Get query parameters
            let { sportID, champID } = req.query;

            // Get route parameters
            let { type, count, lng } = req.params;

            // Database operations and complex logic
            // ...

            // Return response
            return res.json(allEvents);
        } catch (err) {
            console.log(err);
            return res.status(400).json({});
        }
    }
);
```

### Nested routes management:

For more complex applications, you can nest routers:

```javascript
// Main router file
const express = require('express');
const app = express();

// Import routers
const authRouter = require('./routes/Auth');
const userRouter = require('./routes/User');
const adminRouter = require('./routes/Admin');

// Mount routers with prefixes
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// Start server
app.listen(3000, () => console.log('Server running on port 3000'));
```

This structure creates these route paths:
- `/auth/*` - Authentication routes
- `/user/*` - User-related routes
- `/admin/*` - Admin-related routes