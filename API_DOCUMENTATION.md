# Local Market Backend API Documentation

## Authentication System

### Base URL
```
http://localhost:3000/api
```

### Environment Variables Required
Create a `.env` file in the backend directory with the following variables:

```env
PORT=3000
NODE_ENV=development

# Database Configuration (SQL Server)
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_DATABASE=local_market_db
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/api/users/register`

Register a new user (customer or shopkeeper).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone_number": "9876543210",
  "role": "customer"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone_number": "9876543210",
      "role": "customer",
      "created_at": "2024-01-01T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Validation Rules:**
- `name`: Required, minimum 2 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `phone_number`: Required, valid 10-digit Indian phone number (starting with 6-9)
- `role`: Optional, defaults to "customer" (can be "customer" or "shopkeeper")

---

### 2. Login User
**POST** `/api/users/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone_number": "9876543210",
      "role": "customer",
      "created_at": "2024-01-01T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Login failed",
  "error": "Invalid email or password"
}
```

---

### 3. Get Current User Profile
**GET** `/api/users/me`

Get the profile of the currently authenticated user.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone_number": "9876543210",
    "role": "customer",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Authentication required. Please provide a valid token.",
  "error": "No token provided"
}
```

---

### 4. Get User by ID
**GET** `/api/users/:id`

Get user details by user ID (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone_number": "9876543210",
    "role": "customer",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

### 5. Refresh Access Token
**POST** `/api/auth/refresh`

Refresh the access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Token refresh failed",
  "error": "Invalid or expired refresh token"
}
```

---

## Authentication Flow

1. **Register** → User receives accessToken and refreshToken
2. **Login** → User receives accessToken and refreshToken
3. **Use Access Token** → Include in Authorization header: `Bearer <accessToken>`
4. **Token Expired?** → Use refresh token to get new access token
5. **Protected Routes** → All routes requiring authentication need the accessToken in headers

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Error message here"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied",
  "error": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Conflict",
  "error": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Something went wrong"
}
```

---

## Testing with Postman

### Example: Register a User
1. Method: `POST`
2. URL: `http://localhost:3000/api/users/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone_number": "9876543210",
  "role": "customer"
}
```

### Example: Login
1. Method: `POST`
2. URL: `http://localhost:3000/api/users/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Example: Get Current User (Protected Route)
1. Method: `GET`
2. URL: `http://localhost:3000/api/users/me`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your_access_token_here>`

### Example: Refresh Token
1. Method: `POST`
2. URL: `http://localhost:3000/api/auth/refresh`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "refreshToken": "<your_refresh_token_here>"
}
```

---

## Notes

- **Access Token**: Expires in 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token**: Expires in 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Password Requirements**: Minimum 8 characters (validation can be customized)
- **Phone Number**: Must be a valid 10-digit Indian phone number starting with 6-9
- All protected routes require the `Authorization: Bearer <token>` header
- Store refresh tokens securely and use them to refresh access tokens when they expire

---

## Products Endpoints (Public)

### 1. Get All Products
**GET** `/api/products`

Get a paginated list of all available products.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term to filter products by name or description

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "product_id": 1,
        "name": "Product Name",
        "description": "Product description",
        "price": 99.99,
        "stock_quantity": 50,
        "created_at": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Product by ID
**GET** `/api/products/:id`

Get details of a specific product.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product_id": 1,
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "stock_quantity": 50,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

## Cart Endpoints (Guest & Authenticated)

The cart system supports both **guest users** (without login) and **authenticated users**. Guest users can add items to cart, and when they log in, their cart items are automatically merged into their user account.

### How Guest Cart Works:
1. When a guest user visits the app, they should store a `guest_id` (UUID) locally (e.g., in localStorage)
2. Include the `guest_id` in the `X-Guest-Id` header for cart requests
3. If no `guest_id` is provided, a new one is generated and returned in the response header `X-Guest-Id`
4. When the guest logs in, send the `guest_id` in the login request body to merge the cart

### 1. Get Cart
**GET** `/api/cart`

Get the current cart (works for both guest and authenticated users).

**Headers:**
- `Authorization: Bearer <accessToken>` (optional - for authenticated users)
- `X-Guest-Id: <guest_id>` (optional - for guest users, will be generated if not provided)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "cart_id": 1,
    "user_id": null,
    "guest_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z",
    "items": [
      {
        "item_id": 1,
        "product_id": 1,
        "quantity": 2,
        "created_at": "2024-01-01T10:00:00.000Z",
        "product": {
          "product_id": 1,
          "name": "Product Name",
          "description": "Product description",
          "price": 99.99,
          "stock_quantity": 50
        }
      }
    ],
    "summary": {
      "itemCount": 2,
      "total": 199.98
    }
  }
}
```

**Response Headers:**
- `X-Guest-Id: <generated_or_existing_guest_id>` (for guest users)

---

### 2. Add Item to Cart
**POST** `/api/cart/items`

Add a product to the cart (works for both guest and authenticated users).

**Headers:**
- `Authorization: Bearer <accessToken>` (optional - for authenticated users)
- `X-Guest-Id: <guest_id>` (optional - for guest users)

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "item_id": 1,
    "cart_id": 1,
    "product_id": 1,
    "quantity": 2,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Only 5 items available in stock"
}
```

---

### 3. Update Cart Item Quantity
**PUT** `/api/cart/items/:itemId`

Update the quantity of an item in the cart.

**Headers:**
- `Authorization: Bearer <accessToken>` (optional - for authenticated users)
- `X-Guest-Id: <guest_id>` (optional - for guest users)

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "item_id": 1,
    "cart_id": 1,
    "product_id": 1,
    "quantity": 3,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

### 4. Remove Item from Cart
**DELETE** `/api/cart/items/:itemId`

Remove an item from the cart.

**Headers:**
- `Authorization: Bearer <accessToken>` (optional - for authenticated users)
- `X-Guest-Id: <guest_id>` (optional - for guest users)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

---

### 5. Clear Cart
**DELETE** `/api/cart`

Remove all items from the cart.

**Headers:**
- `Authorization: Bearer <accessToken>` (optional - for authenticated users)
- `X-Guest-Id: <guest_id>` (optional - for guest users)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## Updated Login Endpoint (Cart Merge)

### Login with Guest Cart Merge
**POST** `/api/users/login`

When a guest user logs in, include their `guest_id` in the request to automatically merge their guest cart into their user account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "guest_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful (guest cart merged)",
  "data": {
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone_number": "9876543210",
      "role": "customer",
      "created_at": "2024-01-01T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "cart": {
      "cart_id": 2,
      "user_id": 1,
      "guest_id": null,
      "items": [...],
      "summary": {
        "itemCount": 3,
        "total": 299.97
      }
    }
  }
}
```

**Note:** If no `guest_id` is provided or the guest has no cart items, the response will not include the `cart` field.

---

## Testing Guest Cart Flow with Postman

### Step 1: Browse Products (No authentication required)
1. Method: `GET`
2. URL: `http://localhost:3000/api/products`
3. No headers required

### Step 2: Add Item to Cart as Guest
1. Method: `POST`
2. URL: `http://localhost:3000/api/cart/items`
3. Headers: `Content-Type: application/json`
4. Body:
```json
{
  "product_id": 1,
  "quantity": 2
}
```
5. **Important:** Note the `X-Guest-Id` in the response headers - save this for future requests

### Step 3: Get Guest Cart
1. Method: `GET`
2. URL: `http://localhost:3000/api/cart`
3. Headers:
   - `Content-Type: application/json`
   - `X-Guest-Id: <guest_id_from_step_2>`

### Step 4: Login and Merge Cart
1. Method: `POST`
2. URL: `http://localhost:3000/api/users/login`
3. Headers: `Content-Type: application/json`
4. Body:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "guest_id": "<guest_id_from_step_2>"
}
```

### Step 5: Get Authenticated User Cart
1. Method: `GET`
2. URL: `http://localhost:3000/api/cart`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <accessToken_from_step_4>`

---

## Important Notes

### Guest Cart System:
- **Guest ID**: Must be a valid UUID format
- **Cart Persistence**: Guest carts are stored in the database and persist across sessions
- **Cart Merge**: When a guest logs in, their cart items are merged with their user cart (if user already has items)
- **Cart Priority**: If a product exists in both guest and user cart, quantities are added together
- **Stock Validation**: Cart operations check product availability and stock quantities
- **Cart Expiry**: Guest carts remain active until merged or manually cleared

### Client-Side Implementation Tips:
1. Store `guest_id` in localStorage when first generated
2. Always send `X-Guest-Id` header for guest cart operations
3. When user logs in, send `guest_id` in login request to merge cart
4. After successful login, switch from using `X-Guest-Id` to `Authorization` header
5. Handle the case where a new `guest_id` is generated if previous one is lost

---

## Category Endpoints (Public)

### 1. Get All Categories
**GET** `/api/categories`

Get all available categories from active shops.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "category": "Groceries",
      "shop_count": 15
    },
    {
      "category": "Electronics",
      "shop_count": 8
    }
  ]
}
```

---

### 2. Get Shops by Category
**GET** `/api/categories/:category/shops`

Get shops in a specific category with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term to filter shops

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shops retrieved successfully",
  "data": {
    "shops": [
      {
        "shop_id": 1,
        "owner_id": 5,
        "name": "Local Grocery Store",
        "description": "Fresh vegetables and fruits",
        "category": "Groceries",
        "address": "123 Main Street",
        "pincode": "123456",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "is_active": true,
        "created_at": "2024-01-01T10:00:00.000Z",
        "owner_name": "John Doe"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

## Shop Endpoints

### 1. Get Shops by Category (Public)
**GET** `/api/shops?category=Groceries`

Get shops filtered by category (public endpoint).

**Query Parameters:**
- `category` (required): Category name
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

---

### 2. Get Shop by ID (Public)
**GET** `/api/shops/:id`

Get shop details by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop retrieved successfully",
  "data": {
    "shop_id": 1,
    "owner_id": 5,
    "name": "Local Grocery Store",
    "description": "Fresh vegetables and fruits",
    "category": "Groceries",
    "address": "123 Main Street",
    "pincode": "123456",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "is_active": true,
    "created_at": "2024-01-01T10:00:00.000Z",
    "owner_name": "John Doe",
    "owner_email": "john@example.com"
  }
}
```

---

### 3. Get My Shops (Shopkeeper Only)
**GET** `/api/shops/my-shops`

Get all shops owned by the authenticated shopkeeper.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shops retrieved successfully",
  "data": [
    {
      "shop_id": 1,
      "owner_id": 5,
      "name": "Local Grocery Store",
      "category": "Groceries",
      "is_active": true,
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### 4. Create Shop (Shopkeeper Only)
**POST** `/api/shops`

Create a new shop (shopkeeper only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "Local Grocery Store",
  "description": "Fresh vegetables and fruits",
  "category": "Groceries",
  "address": "123 Main Street",
  "pincode": "123456",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Validation Rules:**
- `name`: Required, minimum 2 characters
- `category`: Required, minimum 2 characters
- `address`: Required, minimum 5 characters
- `pincode`: Required, valid 6-digit pincode
- `latitude`, `longitude`: Optional

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Shop created successfully",
  "data": {
    "shop_id": 1,
    "owner_id": 5,
    "name": "Local Grocery Store",
    "category": "Groceries",
    "is_active": false,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

**Note:** New shops are created with `is_active: false` by default. They may need admin approval before appearing in public listings.

---

### 5. Update Shop (Shopkeeper Only - Own Shops)
**PUT** `/api/shops/:id`

Update shop details (only by owner).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Shop Name",
  "description": "Updated description",
  "category": "Electronics",
  "address": "456 New Street",
  "pincode": "654321",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "is_active": true
}
```

---

### 6. Delete Shop (Shopkeeper Only - Own Shops)
**DELETE** `/api/shops/:id`

Soft delete a shop (only by owner).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop deleted successfully"
}
```

---

## Product Endpoints (Updated)

### 1. Get All Products (Public)
**GET** `/api/products`

Get all products from all shops with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `shop_id` (optional): Filter by shop ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "product_id": 1,
        "name": "Fresh Apples",
        "description": "Organic red apples",
        "price": 100.00,
        "inventory_id": 5,
        "shop_id": 1,
        "stock_quantity": 50,
        "selling_price": 95.00,
        "created_at": "2024-01-01T10:00:00.000Z",
        "shop_name": "Local Grocery Store",
        "shop_category": "Groceries"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Products by Shop (Public)
**GET** `/api/shops/:id/products`

Get all products from a specific shop.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

---

### 3. Get Product by ID (Public)
**GET** `/api/products/:id`

Get product details. Can include shop-specific info if `shop_id` is provided.

**Query Parameters:**
- `shop_id` (optional): Shop ID to get shop-specific inventory info

**Example:** `GET /api/products/1?shop_id=5`

---

### 4. Get My Products (Shopkeeper Only)
**GET** `/api/products/my-products`

Get all products from shopkeeper's shops.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `shop_id` (optional): Filter by specific shop
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

---

### 5. Create Product (Shopkeeper Only)
**POST** `/api/products`

Create a new product and add it to shop inventory.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "Fresh Apples",
  "description": "Organic red apples",
  "price": 100.00,
  "shop_id": 1,
  "stock_quantity": 50,
  "selling_price": 95.00
}
```

**Validation Rules:**
- `name`: Required, minimum 2 characters
- `price`: Required, must be >= 0
- `shop_id`: Required
- `stock_quantity`: Optional, defaults to 0
- `selling_price`: Optional, defaults to `price`
- `description`: Optional

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product_id": 1,
    "name": "Fresh Apples",
    "description": "Organic red apples",
    "price": 100.00,
    "created_at": "2024-01-01T10:00:00.000Z",
    "inventory": {
      "id": 5,
      "shop_id": 1,
      "product_id": 1,
      "stock_quantity": 50,
      "selling_price": 95.00
    }
  }
}
```

**Note:** Shopkeeper must own the shop to add products.

---

### 6. Update Product (Shopkeeper Only)
**PUT** `/api/products/:id`

Update product details (shopkeeper must own the shop).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 120.00
}
```

---

### 7. Update Inventory (Shopkeeper Only)
**PUT** `/api/products/inventory/:inventoryId`

Update inventory entry (stock quantity and selling price).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:** (all fields optional)
```json
{
  "stock_quantity": 75,
  "selling_price": 90.00
}
```

---

### 8. Delete Product (Shopkeeper Only)
**DELETE** `/api/products/:id`

Soft delete a product (shopkeeper must own the shop).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Complete App Flow

### Customer Flow:
1. **Browse Categories** → `GET /api/categories`
2. **Select Category** → `GET /api/categories/:category/shops`
3. **Select Shop** → `GET /api/shops/:id`
4. **View Shop Products** → `GET /api/shops/:id/products`
5. **View Product Details** → `GET /api/products/:id?shop_id=:shopId`
6. **Add to Cart** → `POST /api/cart/items` (as guest or authenticated)
7. **Login/Register** → `POST /api/users/login` (with `guest_id` to merge cart)

### Shopkeeper Flow:
1. **Login/Register** → `POST /api/users/login` or `POST /api/users/register` (with `role: "shopkeeper"`)
2. **Create Shop** → `POST /api/shops`
3. **View My Shops** → `GET /api/shops/my-shops`
4. **Create Product** → `POST /api/products` (with `shop_id`)
5. **Manage Products** → `GET /api/products/my-products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
6. **Manage Inventory** → `PUT /api/products/inventory/:inventoryId`
7. **Update Shop** → `PUT /api/shops/:id`

---

## Important Notes

### Product System:
- Products are linked to shops via the `Inventory` table
- Each shop can have different `selling_price` and `stock_quantity` for the same product
- Shopkeepers create products and add them to their shop's inventory in one operation
- Customers see products with shop-specific pricing and availability

### Authorization:
- Shopkeepers can only manage their own shops and products
- All shopkeeper endpoints require authentication and `role: "shopkeeper"`
- Shop owners are verified before allowing product management operations

---

## Image Upload Endpoints

All image uploads use Azure Blob Storage. Images are stored securely and accessible via public URLs.

### Image Upload Specifications:
- **Supported Formats:** JPEG, PNG, GIF, WebP
- **Maximum File Size:** 5MB per image
- **Storage:** Azure Blob Storage
- **Organization:** Images organized by type (user/shop/product)

### 1. Upload User Profile Image
**POST** `/api/users/upload-image`

Upload profile picture for authenticated user.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body (multipart/form-data):**
- `image`: Image file (required)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image_url": "https://yourstorage.blob.core.windows.net/localmarket/user/1234567890-uuid.jpg"
  }
}
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3000/api/users/upload-image`
3. Headers: `Authorization: Bearer <token>`
4. Body: Select `form-data`
5. Key: `image` (type: File)
6. Value: Select image file

---

### 2. Upload Shop Image
**POST** `/api/shops/:id/upload-image`

Upload shop image (shopkeeper only, own shops).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body (multipart/form-data):**
- `image`: Image file (required)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop image uploaded successfully",
  "data": {
    "image_url": "https://yourstorage.blob.core.windows.net/localmarket/shop/1234567890-uuid.jpg"
  }
}
```

---

### 3. Upload Product Image
**POST** `/api/products/:id/upload-image`

Upload product image (shopkeeper only, own products).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body (multipart/form-data):**
- `image`: Image file (required)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product image uploaded successfully",
  "data": {
    "image_url": "https://yourstorage.blob.core.windows.net/localmarket/product/1234567890-uuid.jpg"
  }
}
```

**Note:** 
- Old images are automatically deleted when new image is uploaded
- Image URLs are returned in all product/shop/user responses
- Images are publicly accessible via the returned URL

---

## Environment Variables (Updated)

Add Azure Blob Storage configuration to your `.env` file:

```env
# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your_account;AccountKey=your_key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=localmarket
```

---

## Complete Documentation

For comprehensive API documentation with:
- Complete workflows
- Step-by-step examples
- How to get guest ID for Postman testing
- API connection flows
- Detailed Postman setup instructions

**See:** `COMPLETE_API_GUIDE.md` - Complete guide with all examples and workflows

