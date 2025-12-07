# Local Market - Complete API Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Getting Guest ID for Testing](#getting-guest-id-for-testing)
3. [Environment Setup](#environment-setup)
4. [Complete API Reference](#complete-api-reference)
5. [Complete Workflows](#complete-workflows)
6. [Image Upload Guide](#image-upload-guide)
7. [Unique Feature Suggestions](#unique-feature-suggestions)

---

## Quick Start

### Base URL
```
http://localhost:3000/api
```

### Authentication
- **Public Endpoints**: No authentication required
- **Protected Endpoints**: Require `Authorization: Bearer <accessToken>` header
- **Shopkeeper Endpoints**: Require authentication + `role: "shopkeeper"`

---

## Getting Guest ID for Testing

### Method 1: Automatic Generation (Recommended)
When you make any cart API request **without** providing a guest ID, the system will automatically generate one and return it in the response header.

**Step-by-Step:**
1. Make any cart request (e.g., `GET /api/cart` or `POST /api/cart/items`)
2. **Don't** include `X-Guest-Id` header
3. Check the **Response Headers** in Postman
4. Look for `X-Guest-Id: <uuid>` - this is your guest ID
5. Copy this guest ID and use it in subsequent requests

**Example in Postman:**
```
Request:
GET http://localhost:3000/api/cart
Headers: (none needed)

Response Headers:
X-Guest-Id: 550e8400-e29b-41d4-a716-446655440000
```

**Then use it:**
```
Request:
POST http://localhost:3000/api/cart/items
Headers:
  X-Guest-Id: 550e8400-e29b-41d4-a716-446655440000
```

### Method 2: Manual Generation
You can generate a UUID yourself (must be valid UUID v4 format) and use it directly:

**Valid UUID Format:**
```
550e8400-e29b-41d4-a716-446655440000
```

**Online UUID Generator:** Use any UUID v4 generator tool online, then use that UUID as your guest ID.

### Method 3: Generate via Code
```javascript
// JavaScript/Node.js
import { v4 as uuidv4 } from 'uuid';
const guestId = uuidv4();
console.log(guestId); // Use this in X-Guest-Id header
```

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
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

# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your_account;AccountKey=your_key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=localmarket
```

### Database Migration

**Run this SQL to add image_url columns:**

```sql
-- See file: backend/src/migrations/add_image_url_columns.sql
-- Or run these queries:

ALTER TABLE Users ADD image_url NVARCHAR(500) NULL;
ALTER TABLE Shops ADD image_url NVARCHAR(500) NULL;
ALTER TABLE Products ADD image_url NVARCHAR(500) NULL;
```

---

## Complete API Reference

---

## 1. Authentication & User Management

### 1.1 Register User

**POST** `/api/users/register`

**Description:** Register a new user (customer or shopkeeper)

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone_number": "9876543210",
  "role": "customer"
}
```

**Roles:** `"customer"` or `"shopkeeper"` (default: `"customer"`)

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/users/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON): Above JSON

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone_number": "9876543210",
      "role": "customer",
      "image_url": null,
      "created_at": "2024-01-01T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Save the tokens!** You'll need `accessToken` for authenticated requests.

---

### 1.2 Login User

**POST** `/api/users/login`

**Description:** Authenticate user and receive JWT tokens. Optionally merge guest cart.

**Access:** Public

**Request Body (Without Cart Merge):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Request Body (With Cart Merge):**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "guest_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/users/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON): Above JSON (include `guest_id` if you have items in guest cart)

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
      "image_url": null,
      "created_at": "2024-01-01T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "cart": {
      "cart_id": 2,
      "user_id": 1,
      "items": [...],
      "summary": {
        "itemCount": 3,
        "total": 299.97
      }
    }
  }
}
```

**How it connects:**
- If you provide `guest_id`, your guest cart items are merged into your user account
- Use `accessToken` from response for all authenticated requests
- Store `refreshToken` securely for token refresh

---

### 1.3 Get Current User Profile

**GET** `/api/users/me`

**Description:** Get authenticated user's profile

**Access:** Private (requires authentication)

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/users/me`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <accessToken_from_login>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "9876543210",
    "role": "customer",
    "image_url": "https://yourstorage.blob.core.windows.net/localmarket/user/1234567890-uuid.jpg",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

### 1.4 Refresh Access Token

**POST** `/api/auth/refresh`

**Description:** Get new access token using refresh token

**Access:** Public

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/refresh`
- Headers: `Content-Type: application/json`
- Body (raw JSON): Above JSON

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

---

## 2. Categories

### 2.1 Get All Categories

**GET** `/api/categories`

**Description:** Get all available categories from active shops

**Access:** Public

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/categories`
- Headers: None required

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
    },
    {
      "category": "Clothing",
      "shop_count": 12
    }
  ]
}
```

**How it connects:**
- Use categories from this list to browse shops
- Each category shows how many shops are available
- Categories are auto-generated from shop data

---

### 2.2 Get Shops by Category

**GET** `/api/categories/:category/shops`

**Description:** Get all shops in a specific category

**Access:** Public

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search shops by name or description

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/categories/Groceries/shops?page=1&limit=10`
- Headers: None required

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
        "name": "Fresh Grocery Store",
        "description": "Fresh vegetables and fruits",
        "category": "Groceries",
        "address": "123 Main Street",
        "pincode": "123456",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "is_active": true,
        "image_url": "https://yourstorage.blob.core.windows.net/localmarket/shop/1234567890-uuid.jpg",
        "created_at": "2024-01-01T10:00:00.000Z",
        "owner_name": "Shop Owner Name"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

**How it connects:**
- Use `shop_id` from response to view shop details
- Use `shop_id` to view shop's products
- This is step 2 in customer flow: Category → Shop → Products

---

## 3. Shops

### 3.1 Get Shop by ID

**GET** `/api/shops/:id`

**Description:** Get detailed information about a specific shop

**Access:** Public

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/shops/1`
- Headers: None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop retrieved successfully",
  "data": {
    "shop_id": 1,
    "owner_id": 5,
    "name": "Fresh Grocery Store",
    "description": "Fresh vegetables and fruits",
    "category": "Groceries",
    "address": "123 Main Street",
    "pincode": "123456",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "is_active": true,
    "image_url": "https://yourstorage.blob.core.windows.net/localmarket/shop/1234567890-uuid.jpg",
    "created_at": "2024-01-01T10:00:00.000Z",
    "owner_name": "Shop Owner Name",
    "owner_email": "owner@example.com"
  }
}
```

**How it connects:**
- Use `shop_id` from this response to get shop products: `GET /api/shops/:id/products`

---

### 3.2 Get Shops by Category (Alternative)

**GET** `/api/shops?category=Groceries`

**Description:** Alternative endpoint to get shops by category

**Access:** Public

**Query Parameters:**
- `category` (required): Category name
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/shops?category=Groceries&page=1&limit=10`
- Headers: None required

**Response:** Same as 2.2

---

### 3.3 Create Shop (Shopkeeper Only)

**POST** `/api/shops`

**Description:** Create a new shop (only shopkeepers can create shops)

**Access:** Private (shopkeeper only)

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/shops`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <shopkeeper_access_token>`
- Body (raw JSON):
```json
{
  "name": "My Fresh Grocery Store",
  "description": "Best quality vegetables and fruits in the neighborhood",
  "category": "Groceries",
  "address": "456 Market Street, Near Park",
  "pincode": "123456",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Shop created successfully",
  "data": {
    "shop_id": 1,
    "owner_id": 5,
    "name": "My Fresh Grocery Store",
    "description": "Best quality vegetables and fruits",
    "category": "Groceries",
    "address": "456 Market Street, Near Park",
    "pincode": "123456",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "is_active": false,
    "image_url": null,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

**Note:** New shops are created with `is_active: false`. They need to be activated (or admin approval) before appearing in public listings.

**How it connects:**
- After creating shop, upload shop image: `POST /api/shops/:id/upload-image`
- Add products to shop: `POST /api/products` (with `shop_id`)

---

### 3.4 Get My Shops (Shopkeeper Only)

**GET** `/api/shops/my-shops`

**Description:** Get all shops owned by authenticated shopkeeper

**Access:** Private (shopkeeper only)

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/shops/my-shops`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <shopkeeper_access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shops retrieved successfully",
  "data": [
    {
      "shop_id": 1,
      "owner_id": 5,
      "name": "My Fresh Grocery Store",
      "category": "Groceries",
      "is_active": true,
      "image_url": "https://yourstorage.blob.core.windows.net/localmarket/shop/1234567890-uuid.jpg",
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

**How it connects:**
- Use `shop_id` from response to manage shop (update, delete, add products)

---

### 3.5 Update Shop (Shopkeeper Only - Own Shops)

**PUT** `/api/shops/:id`

**Description:** Update shop details (only shop owner can update)

**Access:** Private (shopkeeper only, own shops)

**Postman Setup:**
- Method: `PUT`
- URL: `http://localhost:3000/api/shops/1`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <shopkeeper_access_token>`
- Body (raw JSON) - all fields optional:
```json
{
  "name": "Updated Shop Name",
  "description": "Updated description",
  "category": "Electronics",
  "address": "789 New Street",
  "pincode": "654321",
  "latitude": 28.7000,
  "longitude": 77.3000,
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop updated successfully",
  "data": {
    "shop_id": 1,
    "owner_id": 5,
    "name": "Updated Shop Name",
    "category": "Electronics",
    "is_active": true,
    "image_url": "https://yourstorage.blob.core.windows.net/localmarket/shop/1234567890-uuid.jpg",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

### 3.6 Delete Shop (Shopkeeper Only - Own Shops)

**DELETE** `/api/shops/:id`

**Description:** Soft delete shop (only shop owner can delete)

**Access:** Private (shopkeeper only, own shops)

**Postman Setup:**
- Method: `DELETE`
- URL: `http://localhost:3000/api/shops/1`
- Headers:
  - `Authorization: Bearer <shopkeeper_access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop deleted successfully"
}
```

---

## 4. Products

### 4.1 Get All Products

**GET** `/api/products`

**Description:** Get all products from all shops (can filter by shop)

**Access:** Public

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search products by name or description
- `shop_id` (optional): Filter products by specific shop

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/products?page=1&limit=10&shop_id=1`
- Headers: None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "product_id": 1,
        "name": "Fresh Red Apples",
        "description": "Organic red apples, 1kg",
        "price": 100.00,
        "image_url": "https://yourstorage.blob.core.windows.net/localmarket/product/1234567890-uuid.jpg",
        "inventory_id": 5,
        "shop_id": 1,
        "stock_quantity": 50,
        "selling_price": 95.00,
        "created_at": "2024-01-01T10:00:00.000Z",
        "shop_name": "Fresh Grocery Store",
        "shop_category": "Groceries"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

**How it connects:**
- Use `product_id` to view product details
- Use `shop_id` to view all products from that shop
- Use `inventory_id` to update inventory (shopkeeper only)

---

### 4.2 Get Products by Shop

**GET** `/api/shops/:id/products`

**Description:** Get all products from a specific shop

**Access:** Public

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/shops/1/products?page=1&limit=10`
- Headers: None required

**Response:** Same structure as 4.1

**How it connects:**
- This is step 3 in customer flow: Category → Shop → Products
- Use `product_id` from response to view product details or add to cart

---

### 4.3 Get Product by ID

**GET** `/api/products/:id`

**Description:** Get detailed information about a specific product

**Access:** Public

**Query Parameters:**
- `shop_id` (optional): Include shop-specific inventory info

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/products/1?shop_id=1`
- Headers: None required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product_id": 1,
    "name": "Fresh Red Apples",
    "description": "Organic red apples, 1kg",
    "price": 100.00,
    "image_url": "https://yourstorage.blob.core.windows.net/localmarket/product/1234567890-uuid.jpg",
    "created_at": "2024-01-01T10:00:00.000Z",
    "inventory_id": 5,
    "shop_id": 1,
    "stock_quantity": 50,
    "selling_price": 95.00,
    "shop_name": "Fresh Grocery Store",
    "shop_category": "Groceries"
  }
}
```

**How it connects:**
- Use `product_id` and `shop_id` to add product to cart
- Shop-specific `selling_price` and `stock_quantity` shown if `shop_id` provided

---

### 4.4 Create Product (Shopkeeper Only)

**POST** `/api/products`

**Description:** Create a new product and add it to shop inventory

**Access:** Private (shopkeeper only, must own the shop)

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/products`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <shopkeeper_access_token>`
- Body (raw JSON):
```json
{
  "name": "Organic Tomatoes",
  "description": "Fresh organic tomatoes, 500g",
  "price": 50.00,
  "shop_id": 1,
  "stock_quantity": 100,
  "selling_price": 45.00
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product_id": 2,
    "name": "Organic Tomatoes",
    "description": "Fresh organic tomatoes, 500g",
    "price": 50.00,
    "image_url": null,
    "created_at": "2024-01-01T10:00:00.000Z",
    "inventory": {
      "id": 6,
      "shop_id": 1,
      "product_id": 2,
      "stock_quantity": 100,
      "selling_price": 45.00
    }
  }
}
```

**How it connects:**
- After creating product, upload product image: `POST /api/products/:id/upload-image`
- Use `inventory.id` to update inventory later
- Shopkeeper must own the `shop_id` specified

---

### 4.5 Get My Products (Shopkeeper Only)

**GET** `/api/products/my-products`

**Description:** Get all products from shopkeeper's shops

**Access:** Private (shopkeeper only)

**Query Parameters:**
- `shop_id` (optional): Filter by specific shop
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/products/my-products?shop_id=1&page=1&limit=10`
- Headers:
  - `Authorization: Bearer <shopkeeper_access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "product_id": 1,
        "name": "Fresh Red Apples",
        "description": "Organic red apples",
        "price": 100.00,
        "image_url": "https://yourstorage.blob.core.windows.net/localmarket/product/1234567890-uuid.jpg",
        "inventory_id": 5,
        "shop_id": 1,
        "stock_quantity": 50,
        "selling_price": 95.00,
        "created_at": "2024-01-01T10:00:00.000Z",
        "shop_name": "My Grocery Store"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

**How it connects:**
- Use `product_id` to update/delete product
- Use `inventory_id` to update stock quantity or selling price

---

### 4.6 Update Product (Shopkeeper Only)

**PUT** `/api/products/:id`

**Description:** Update product details (must own the shop)

**Access:** Private (shopkeeper only, own products)

**Postman Setup:**
- Method: `PUT`
- URL: `http://localhost:3000/api/products/1`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <shopkeeper_access_token>`
- Body (raw JSON) - all fields optional:
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 120.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product_id": 1,
    "name": "Updated Product Name",
    "description": "Updated description",
    "price": 120.00,
    "image_url": "https://yourstorage.blob.core.windows.net/localmarket/product/1234567890-uuid.jpg",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

---

### 4.7 Update Inventory (Shopkeeper Only)

**PUT** `/api/products/inventory/:inventoryId`

**Description:** Update stock quantity and selling price for a product in your shop

**Access:** Private (shopkeeper only, own shops)

**Postman Setup:**
- Method: `PUT`
- URL: `http://localhost:3000/api/products/inventory/5`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <shopkeeper_access_token>`
- Body (raw JSON) - all fields optional:
```json
{
  "stock_quantity": 75,
  "selling_price": 90.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "data": {
    "id": 5,
    "shop_id": 1,
    "product_id": 1,
    "stock_quantity": 75,
    "selling_price": 90.00
  }
}
```

**How it connects:**
- Use `inventory_id` from product response (see 4.5)
- This updates shop-specific pricing and stock, not the base product price

---

### 4.8 Delete Product (Shopkeeper Only)

**DELETE** `/api/products/:id`

**Description:** Soft delete product (must own the shop)

**Access:** Private (shopkeeper only, own products)

**Postman Setup:**
- Method: `DELETE`
- URL: `http://localhost:3000/api/products/1`
- Headers:
  - `Authorization: Bearer <shopkeeper_access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 5. Cart Management

### 5.1 Get Cart

**GET** `/api/cart`

**Description:** Get current cart (works for both guest and authenticated users)

**Access:** Public (with guest ID or authentication)

**Postman Setup (Guest):**
- Method: `GET`
- URL: `http://localhost:3000/api/cart`
- Headers:
  - `X-Guest-Id: 550e8400-e29b-41d4-a716-446655440000` (optional - will be generated if not provided)

**Postman Setup (Authenticated):**
- Method: `GET`
- URL: `http://localhost:3000/api/cart`
- Headers:
  - `Authorization: Bearer <access_token>`

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
          "name": "Fresh Red Apples",
          "description": "Organic red apples",
          "price": 95.00,
          "stock_quantity": 50,
          "image_url": "https://yourstorage.blob.core.windows.net/localmarket/product/1234567890-uuid.jpg"
        }
      }
    ],
    "summary": {
      "itemCount": 2,
      "total": 190.00
    }
  }
}
```

**Response Headers (for guest):**
- `X-Guest-Id: <uuid>` - Save this for future requests

**How it connects:**
- Use `item_id` from items to update/remove cart items
- Use `product_id` to get product details
- Total and item count calculated automatically

---

### 5.2 Add Item to Cart

**POST** `/api/cart/items`

**Description:** Add product to cart (works for guest and authenticated users)

**Access:** Public (with guest ID or authentication)

**Postman Setup (Guest):**
- Method: `POST`
- URL: `http://localhost:3000/api/cart/items`
- Headers:
  - `Content-Type: application/json`
  - `X-Guest-Id: 550e8400-e29b-41d4-a716-446655440000`
- Body (raw JSON):
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Postman Setup (Authenticated):**
- Method: `POST`
- URL: `http://localhost:3000/api/cart/items`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`
- Body: Same as above

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

**How it connects:**
- After adding to cart, get cart to see updated summary: `GET /api/cart`
- If same product already in cart, quantity is added together
- Stock validation happens automatically

---

### 5.3 Update Cart Item Quantity

**PUT** `/api/cart/items/:itemId`

**Description:** Update quantity of an item in cart

**Access:** Public (with guest ID or authentication)

**Postman Setup:**
- Method: `PUT`
- URL: `http://localhost:3000/api/cart/items/1`
- Headers:
  - `Content-Type: application/json`
  - `X-Guest-Id: <guest_id>` OR `Authorization: Bearer <access_token>`
- Body (raw JSON):
```json
{
  "quantity": 5
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
    "quantity": 5,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

**How it connects:**
- Get `item_id` from cart response (5.1)
- Stock validation ensures quantity doesn't exceed available stock

---

### 5.4 Remove Item from Cart

**DELETE** `/api/cart/items/:itemId`

**Description:** Remove an item from cart

**Access:** Public (with guest ID or authentication)

**Postman Setup:**
- Method: `DELETE`
- URL: `http://localhost:3000/api/cart/items/1`
- Headers:
  - `X-Guest-Id: <guest_id>` OR `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

---

### 5.5 Clear Cart

**DELETE** `/api/cart`

**Description:** Remove all items from cart

**Access:** Public (with guest ID or authentication)

**Postman Setup:**
- Method: `DELETE`
- URL: `http://localhost:3000/api/cart`
- Headers:
  - `X-Guest-Id: <guest_id>` OR `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 6. Image Upload

### 6.1 Upload User Profile Image

**POST** `/api/users/upload-image`

**Description:** Upload profile picture for authenticated user

**Access:** Private (requires authentication)

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/users/upload-image`
- Headers:
  - `Authorization: Bearer <access_token>`
- Body (form-data):
  - Key: `image` (type: File)
  - Value: Select image file (JPG, PNG, GIF, WebP, max 5MB)

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

**How it connects:**
- Image URL is automatically saved to user profile
- Image URL appears in user profile responses
- Old image is automatically deleted if exists

---

### 6.2 Upload Shop Image

**POST** `/api/shops/:id/upload-image`

**Description:** Upload shop image (shopkeeper only, own shops)

**Access:** Private (shopkeeper only, own shops)

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/shops/1/upload-image`
- Headers:
  - `Authorization: Bearer <shopkeeper_access_token>`
- Body (form-data):
  - Key: `image` (type: File)
  - Value: Select image file (max 5MB)

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

**How it connects:**
- Image URL is saved to shop record
- Appears in all shop listing and detail responses
- Old image is automatically deleted

---

### 6.3 Upload Product Image

**POST** `/api/products/:id/upload-image`

**Description:** Upload product image (shopkeeper only, own products)

**Access:** Private (shopkeeper only, own products)

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/products/1/upload-image`
- Headers:
  - `Authorization: Bearer <shopkeeper_access_token>`
- Body (form-data):
  - Key: `image` (type: File)
  - Value: Select image file (max 5MB)

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

**How it connects:**
- Image URL is saved to product record
- Appears in all product listing and detail responses
- Customers see product images when browsing

---

## Complete Workflows

### Workflow 1: Customer Shopping Journey

**Step 1: Browse Categories**
```
GET /api/categories
```
**Result:** Get list of categories with shop counts

**Step 2: Select Category & Browse Shops**
```
GET /api/categories/Groceries/shops?page=1&limit=10
```
**Result:** Get shops in "Groceries" category

**Step 3: View Shop Details**
```
GET /api/shops/1
```
**Result:** Get detailed shop information

**Step 4: View Shop Products**
```
GET /api/shops/1/products?page=1&limit=20
```
**Result:** Get all products from shop

**Step 5: View Product Details**
```
GET /api/products/1?shop_id=1
```
**Result:** Get product details with shop-specific pricing

**Step 6: Add to Cart (as Guest)**
```
POST /api/cart/items
Headers: X-Guest-Id: <get_from_step_6_response_header>
Body: { "product_id": 1, "quantity": 2 }
```
**Result:** Item added to guest cart

**Step 7: View Cart**
```
GET /api/cart
Headers: X-Guest-Id: <guest_id>
```
**Result:** See cart with all items and total

**Step 8: Register/Login**
```
POST /api/users/login
Body: {
  "email": "customer@example.com",
  "password": "password123",
  "guest_id": "<guest_id_from_step_6>"
}
```
**Result:** Login successful, guest cart merged to user account

**Step 9: Continue Shopping (Authenticated)**
```
POST /api/cart/items
Headers: Authorization: Bearer <access_token>
Body: { "product_id": 2, "quantity": 1 }
```
**Result:** Item added to authenticated user cart

---

### Workflow 2: Shopkeeper Shop Setup

**Step 1: Register as Shopkeeper**
```
POST /api/users/register
Body: {
  "name": "Shop Owner",
  "email": "shopkeeper@example.com",
  "password": "password123",
  "phone_number": "9876543210",
  "role": "shopkeeper"
}
```
**Result:** Shopkeeper account created with tokens

**Step 2: Create Shop**
```
POST /api/shops
Headers: Authorization: Bearer <access_token>
Body: {
  "name": "My Grocery Store",
  "description": "Fresh groceries",
  "category": "Groceries",
  "address": "123 Main St",
  "pincode": "123456"
}
```
**Result:** Shop created (use `shop_id` from response)

**Step 3: Upload Shop Image**
```
POST /api/shops/1/upload-image
Headers: Authorization: Bearer <access_token>
Body: (form-data) image file
```
**Result:** Shop image uploaded

**Step 4: Create Product**
```
POST /api/products
Headers: Authorization: Bearer <access_token>
Body: {
  "name": "Fresh Apples",
  "description": "Organic apples",
  "price": 100.00,
  "shop_id": 1,
  "stock_quantity": 50,
  "selling_price": 95.00
}
```
**Result:** Product created and added to shop inventory

**Step 5: Upload Product Image**
```
POST /api/products/1/upload-image
Headers: Authorization: Bearer <access_token>
Body: (form-data) image file
```
**Result:** Product image uploaded

**Step 6: View My Products**
```
GET /api/products/my-products?shop_id=1
Headers: Authorization: Bearer <access_token>
```
**Result:** See all products in shop

**Step 7: Update Inventory**
```
PUT /api/products/inventory/5
Headers: Authorization: Bearer <access_token>
Body: {
  "stock_quantity": 75,
  "selling_price": 90.00
}
```
**Result:** Inventory updated

---

### Workflow 3: Complete Customer Experience

**Scenario:** Customer wants to buy groceries

1. **Browse Categories**
   ```
   GET /api/categories
   → Select "Groceries"
   ```

2. **Browse Shops**
   ```
   GET /api/categories/Groceries/shops
   → Select shop (shop_id: 1)
   ```

3. **View Shop**
   ```
   GET /api/shops/1
   → See shop details, image, location
   ```

4. **Browse Shop Products**
   ```
   GET /api/shops/1/products
   → See all products with images and prices
   ```

5. **Add Multiple Products to Cart (as Guest)**
   ```
   POST /api/cart/items
   Headers: X-Guest-Id: <auto-generated>
   Body: { "product_id": 1, "quantity": 2 }
   
   POST /api/cart/items
   Headers: X-Guest-Id: <same_as_above>
   Body: { "product_id": 2, "quantity": 1 }
   ```

6. **Review Cart**
   ```
   GET /api/cart
   Headers: X-Guest-Id: <guest_id>
   → See all items, quantities, total
   ```

7. **Update Quantity**
   ```
   PUT /api/cart/items/1
   Headers: X-Guest-Id: <guest_id>
   Body: { "quantity": 3 }
   ```

8. **Register/Login (Cart Merges Automatically)**
   ```
   POST /api/users/register
   Body: {
     "name": "Customer Name",
     "email": "customer@example.com",
     "password": "password123",
     "phone_number": "9876543210"
   }
   → Note: If you already registered, use login instead
   
   POST /api/users/login
   Body: {
     "email": "customer@example.com",
     "password": "password123",
     "guest_id": "<guest_id_from_step_5>"
   }
   → Cart automatically merged!
   ```

9. **Continue Shopping (Authenticated)**
   ```
   POST /api/cart/items
   Headers: Authorization: Bearer <access_token>
   Body: { "product_id": 3, "quantity": 1 }
   ```

10. **Final Cart Review**
    ```
    GET /api/cart
    Headers: Authorization: Bearer <access_token>
    → See complete cart with all items
    ```

---

## Image Upload Guide

### Supported Formats
- JPEG/JPG
- PNG
- GIF
- WebP

### File Size Limit
- Maximum: 5MB per image

### Upload Process

**In Postman:**
1. Select method: `POST`
2. Enter URL (e.g., `/api/products/1/upload-image`)
3. Go to **Body** tab
4. Select **form-data**
5. Key: `image` (dropdown: select **File**)
6. Value: Click **Select Files** and choose image
7. Add authentication header if required
8. Send request

**Response:**
- Returns `image_url` (Azure Blob Storage URL)
- Image is automatically accessible via this URL
- Old image is deleted if exists

### Image Organization
Images are stored in Azure Blob Storage with organized structure:
- User images: `user/{timestamp}-{uuid}.{ext}`
- Shop images: `shop/{timestamp}-{uuid}.{ext}`
- Product images: `product/{timestamp}-{uuid}.{ext}`

---

## Unique Feature Suggestions

Here are some innovative features that can make your app stand out in the market:

### 1. **Hyper-Local Discovery with Real-Time Distance**
- **Feature:** Show shops sorted by distance from user's current location
- **API Endpoint:** `GET /api/shops/nearby?latitude=28.6139&longitude=77.2090&radius=5`
- **Why Unique:** Customers prefer nearby shops for quick delivery
- **Implementation:** Calculate distance using latitude/longitude, sort by proximity

### 2. **Live Inventory Updates**
- **Feature:** Real-time stock quantity updates when products are purchased
- **API Endpoint:** WebSocket or polling endpoint
- **Why Unique:** Customers know if product is available before adding to cart
- **Implementation:** Push notifications or frequent polling for inventory changes

### 3. **Shop Rating & Review System**
- **Feature:** Customers can rate and review shops and products
- **Tables Needed:** `ShopReviews`, `ProductReviews`
- **Why Unique:** Builds trust and helps customers make decisions
- **API Endpoints:**
  - `POST /api/shops/:id/reviews` - Add shop review
  - `GET /api/shops/:id/reviews` - Get shop reviews
  - `GET /api/products/:id/reviews` - Get product reviews

### 4. **Order Tracking with Real-Time Status**
- **Feature:** Track orders from placement to delivery with status updates
- **Tables Needed:** `Orders`, `OrderItems`, `OrderStatus`
- **Why Unique:** Transparency builds customer trust
- **Status Flow:** Pending → Confirmed → Preparing → Out for Delivery → Delivered

### 5. **Smart Recommendations Engine**
- **Feature:** Suggest products based on browsing history and category
- **API Endpoint:** `GET /api/products/recommendations?user_id=1`
- **Why Unique:** Increases sales and improves user experience
- **Implementation:** Analyze user cart history, popular products in category

### 6. **Multi-Shop Cart Support**
- **Feature:** Customers can add products from multiple shops in one cart
- **Enhancement:** Show shop-wise breakdown in cart
- **Why Unique:** Convenience of buying from multiple shops at once
- **Display:** Group cart items by shop with separate totals

### 7. **Quick Reorder Feature**
- **Feature:** One-click reorder from order history
- **API Endpoint:** `POST /api/orders/:orderId/reorder`
- **Why Unique:** Saves time for repeat customers
- **Implementation:** Store order history, allow quick re-add to cart

### 8. **Shop Operating Hours & Availability**
- **Feature:** Show shop open/closed status and operating hours
- **Table Addition:** Add `operating_hours` to Shops table
- **Why Unique:** Customers know when shops are open
- **API Enhancement:** Filter shops by "open now" status

### 9. **Price Drop Alerts**
- **Feature:** Notify customers when product prices drop
- **Table Needed:** `PriceAlerts`
- **Why Unique:** Increases engagement and sales
- **API Endpoints:**
  - `POST /api/products/:id/price-alert` - Set price alert
  - Notification when price drops below threshold

### 10. **Wishlist Feature**
- **Feature:** Save products for later purchase
- **Table Needed:** `Wishlists`
- **Why Unique:** Allows customers to bookmark favorite products
- **API Endpoints:**
  - `POST /api/wishlist` - Add to wishlist
  - `GET /api/wishlist` - Get wishlist
  - `DELETE /api/wishlist/:id` - Remove from wishlist

### 11. **Loyalty Points System**
- **Feature:** Reward customers with points for purchases
- **Tables Needed:** `LoyaltyPoints`, `LoyaltyTransactions`
- **Why Unique:** Increases customer retention
- **Implementation:** Earn points on purchases, redeem for discounts

### 12. **Shop Verification Badge**
- **Feature:** Verified shops get special badge (like blue checkmark)
- **Table Addition:** Add `is_verified` to Shops table
- **Why Unique:** Builds trust and credibility
- **Display:** Show verified badge in shop listings

### 13. **Multiple Payment Methods**
- **Feature:** Support UPI, Cards, Cash on Delivery, Wallet
- **Tables Needed:** `Payments`, `PaymentMethods`
- **Why Unique:** Flexible payment options increase conversions
- **API Endpoints:** Payment gateway integration

### 14. **Group Buying / Bulk Discounts**
- **Feature:** Offer discounts for bulk purchases
- **Table Addition:** Add `bulk_pricing` to Inventory
- **Why Unique:** Encourages larger orders
- **Example:** Buy 10, get 15% discount

### 15. **Social Sharing**
- **Feature:** Share products/shops on social media
- **Why Unique:** Viral marketing and organic growth
- **Implementation:** Generate shareable links with product/shop preview

### 16. **Voice Search**
- **Feature:** Search products using voice commands
- **API Endpoint:** Enhanced search endpoint
- **Why Unique:** Convenience, especially for older users
- **Implementation:** Voice-to-text integration

### 17. **Multi-Language Support**
- **Feature:** Support regional languages
- **Why Unique:** Appeals to local customers
- **Implementation:** Store translations, detect user language

### 18. **Shop Analytics Dashboard (For Shopkeepers)**
- **Feature:** Sales analytics, popular products, customer insights
- **API Endpoints:**
  - `GET /api/shops/:id/analytics` - Sales stats
  - `GET /api/shops/:id/popular-products` - Top selling products
- **Why Unique:** Helps shopkeepers optimize their business

### 19. **Delivery Time Estimation**
- **Feature:** Show estimated delivery time based on distance
- **Table Addition:** Add `delivery_radius` to Shops
- **Why Unique:** Sets proper expectations
- **Calculation:** Distance-based time estimation

### 20. **Referral Program**
- **Feature:** Refer friends, get rewards
- **Tables Needed:** `Referrals`, `ReferralRewards`
- **Why Unique:** Organic user acquisition
- **API Endpoints:**
  - `POST /api/referrals` - Generate referral code
  - Track referrals and reward both parties

---

## API Connection Flow Diagram

```
Customer Journey:
1. GET /api/categories
   ↓
2. GET /api/categories/:category/shops
   ↓
3. GET /api/shops/:id
   ↓
4. GET /api/shops/:id/products
   ↓
5. GET /api/products/:id?shop_id=:id
   ↓
6. POST /api/cart/items (with X-Guest-Id header)
   ↓
7. GET /api/cart (with X-Guest-Id header)
   ↓
8. POST /api/users/login (with guest_id in body)
   ↓
9. POST /api/cart/items (with Authorization header)
   ↓
10. GET /api/cart (with Authorization header)

Shopkeeper Journey:
1. POST /api/users/register (role: "shopkeeper")
   ↓
2. POST /api/users/login
   ↓
3. POST /api/shops
   ↓
4. POST /api/shops/:id/upload-image
   ↓
5. POST /api/products (with shop_id)
   ↓
6. POST /api/products/:id/upload-image
   ↓
7. GET /api/products/my-products
   ↓
8. PUT /api/products/inventory/:id
```

---

## Testing Checklist

### Guest Cart Testing:
- [ ] Add item to cart without guest ID (should get guest ID in response header)
- [ ] Add item to cart with guest ID
- [ ] Get cart with guest ID
- [ ] Update cart item quantity
- [ ] Remove cart item
- [ ] Login with guest_id (cart should merge)

### Authentication Testing:
- [ ] Register as customer
- [ ] Register as shopkeeper
- [ ] Login (save tokens)
- [ ] Refresh token
- [ ] Access protected route without token (should fail)
- [ ] Access shopkeeper route as customer (should fail)

### Shop Management Testing:
- [ ] Create shop (as shopkeeper)
- [ ] Get my shops
- [ ] Update shop (own shop)
- [ ] Try to update other shopkeeper's shop (should fail)
- [ ] Upload shop image
- [ ] Delete shop

### Product Management Testing:
- [ ] Create product (with shop_id)
- [ ] Get my products
- [ ] Update product (own product)
- [ ] Try to update other shopkeeper's product (should fail)
- [ ] Update inventory
- [ ] Upload product image
- [ ] Delete product

### Image Upload Testing:
- [ ] Upload user profile image
- [ ] Upload shop image
- [ ] Upload product image
- [ ] Try uploading non-image file (should fail)
- [ ] Try uploading >5MB file (should fail)

---

## Common Issues & Solutions

### Issue: "Azure Blob Storage is not configured"
**Solution:** Add `AZURE_STORAGE_CONNECTION_STRING` to `.env` file

### Issue: "Guest ID not found"
**Solution:** Make any cart request first, system will generate guest ID and return in response header

### Issue: "You do not have permission"
**Solution:** 
- Verify you're logged in with correct role (shopkeeper for shop/product management)
- Verify you own the resource (shop/product)
- Check if token is expired (use refresh token)

### Issue: "Product not found in shop"
**Solution:** Make sure product is added to shop's inventory. Products must be linked to shops via Inventory table.

---

## Next Steps

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up Database:**
   - Run initial table creation queries
   - Run migration to add image_url columns

3. **Configure Azure Blob Storage:**
   - Create Azure Storage Account
   - Get connection string
   - Add to `.env` file

4. **Start Server:**
   ```bash
   npm run dev
   ```

5. **Test APIs:**
   - Use Postman collection
   - Follow workflows above
   - Test all endpoints

---

## Support & Resources

- **Database Schema:** See `backend/src/dukaanAppDataTableCreationQueries.sql`
- **Migration Scripts:** See `backend/src/migrations/add_image_url_columns.sql`
- **API Documentation:** This file contains all API details
- **Error Codes:** All endpoints return consistent error format

---

**Happy Coding! 🚀**

