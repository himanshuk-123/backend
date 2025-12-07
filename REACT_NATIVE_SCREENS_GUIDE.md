# React Native Screens Development Guide

## 📱 Complete Screen List (22 Screens)

### Authentication (3)
1. Login Screen
2. Register Screen
3. Profile Screen

### Customer/Guest (8)
4. Home/Browse Screen
5. Category Shops Screen
6. Shop Detail Screen
7. Shop Products Screen
8. Product Detail Screen
9. Cart Screen
10. Checkout Screen (Future)
11. My Orders Screen (Future)

### Shopkeeper (8)
12. Shopkeeper Dashboard
13. My Shops Screen
14. Create/Edit Shop Screen
15. Shop Products Management Screen
16. Create/Edit Product Screen
17. Inventory Management Screen
18. Shop Analytics Screen (Future)
19. Order Management Screen (Future)

### Common (3)
20. Image Picker Component (Modal)
21. Settings Screen
22. Search Screen

---

## 📋 Screen Structures

---

## 1. LOGIN SCREEN

**Purpose:** User authentication

**Elements:**
- App logo/icon at top
- Email input field
- Password input field (with show/hide toggle)
- Remember me checkbox
- Forgot password link
- Login button
- Register button / "Don't have account? Sign Up" link

**Data to Display:**
- Placeholder: "Email", "Password"
- Button labels: "LOGIN", "REGISTER"

**Features:**
- Email and password input validation
- Password visibility toggle
- Remember me option
- Error message display area
- Loading indicator on button

---

## 2. REGISTER SCREEN

**Purpose:** Create new user account

**Elements:**
- Full name input
- Email input
- Phone number input
- Password input (with show/hide)
- Confirm password input (with show/hide)
- Account type selection (Customer/Shopkeeper radio buttons)
- Terms & Conditions checkbox
- Create account button
- Login link ("Already have account? Login")

**Data to Display:**
- Input placeholders for all fields
- Radio button labels: "Customer", "Shopkeeper"
- Button label: "CREATE ACCOUNT"

**Features:**
- Form validation messages
- Password strength indicator (optional)
- Terms checkbox required
- Error display for each field

---

## 3. PROFILE SCREEN

**Purpose:** View and manage user profile

**Elements:**
- Circular profile image (with edit icon overlay)
- User name (large text)
- User email
- Edit profile button
- Name list item (with arrow)
- Email list item (with arrow)
- Phone number list item (with arrow)
- My Orders button (if customer)
- Settings button
- Logout button

**Data to Display:**
- User image or placeholder
- User name: "John Doe"
- Email: "john@example.com"
- Phone: "+91 9876543210"
- Role badge (Customer/Shopkeeper)

**Features:**
- Tap image to upload new photo
- Tap list items to edit
- Navigate to Orders/Settings
- Logout confirmation

---

## 4. HOME/BROWSE SCREEN

**Purpose:** Browse categories

**Elements:**
- Header with search icon and cart icon (with badge)
- Search bar (placeholder: "Search Products...")
- "Browse by Category" heading
- Grid of category cards (2 columns)

**Category Card Contains:**
- Category icon/image
- Category name (e.g., "Groceries")
- Shop count (e.g., "15 shops")

**Data to Display:**
- Categories list with dummy data:
  - Groceries (15 shops)
  - Electronics (8 shops)
  - Clothing (12 shops)
  - Food (20 shops)
  - Pharmacy (10 shops)
  - Home (15 shops)
  - Games (5 shops)
  - Sports (7 shops)

**Features:**
- Tap category to navigate
- Search functionality
- Cart badge shows item count
- Pull to refresh

---

## 5. CATEGORY SHOPS SCREEN

**Purpose:** Display shops in selected category

**Elements:**
- Header with back button, category name, search icon, filter icon
- "Showing X shops in [Category]" text
- List of shop cards

**Shop Card Contains:**
- Shop image
- Shop name
- Rating stars (e.g., ⭐4.5)
- Address with distance (e.g., "123 Main St, 0.5km away")
- Open/Closed status with hours
- Product count (e.g., "50+ products")

**Data to Display:**
- Shop list with dummy data:
  - Fresh Grocery Store ⭐4.5, 0.5km, Open, 50 products
  - Organic Food Mart ⭐4.8, 1.2km, Open, 80 products
  - Quick Mart ⭐4.2, 2.5km, Closed, 35 products
- Load more button at bottom

**Features:**
- Tap shop to view details
- Filter by distance
- Sort options (Distance, Rating, Name)
- Search within category
- Pull to refresh
- Pagination

---

## 6. SHOP DETAIL SCREEN

**Purpose:** View shop information

**Elements:**
- Shop banner image (full width)
- Shop name with rating (e.g., "Fresh Grocery Store ⭐4.5")
- Address with distance icon
- Phone number with call icon
- Open/Closed status with hours
- "About" section with description
- Rating button (e.g., "⭐ 4.5 (125 reviews)")
- Call shop button
- Get directions button
- View products button (primary, large)

**Data to Display:**
- Shop image
- Name: "Fresh Grocery Store"
- Address: "123 Main Street, Near Park"
- Distance: "0.5 km away"
- Phone: "+91 9876543210"
- Status: "Open Now • 9AM - 9PM"
- Description: "Fresh vegetables and fruits from local farms..."
- Rating: "4.5 (125 reviews)"

**Features:**
- Tap image to view full size
- Call button opens dialer
- Directions button opens maps
- Navigate to products
- Share shop option

---

## 7. SHOP PRODUCTS SCREEN

**Purpose:** Display products from a shop

**Elements:**
- Header with back button, shop name, search icon, filter icon
- "Showing X products" text
- Category filter chips: [All] [Vegetables] [Fruits] [Other]
- Product grid (2 columns)

**Product Card Contains:**
- Product image
- Product name
- Price (e.g., "₹95/kg")
- Stock status badge (In Stock / Out of Stock)

**Data to Display:**
- Products grid with dummy data:
  - Apples, ₹95/kg, In Stock
  - Tomatoes, ₹45/500g, In Stock
  - Bananas, ₹60/kg, In Stock
  - Potatoes, ₹30/kg, In Stock
- Load more button

**Features:**
- Tap product for details
- Quick add to cart (optional icon on card)
- Filter by category
- Sort options
- Search within shop
- Pagination

---

## 8. PRODUCT DETAIL SCREEN

**Purpose:** View product information and add to cart

**Elements:**
- Large product image (swipeable if multiple)
- Product name with rating
- "From: [Shop Name]" link
- Price display (e.g., "₹95.00 / kg")
- Original price with discount (if applicable)
- Description section
- Stock quantity text (e.g., "Stock: 50 units available")
- Quantity selector (- button, number, + button)
- Add to Cart button (primary)
- Buy Now button (secondary)

**Data to Display:**
- Product image
- Name: "Fresh Red Apples"
- Shop: "Fresh Grocery Store"
- Price: "₹95.00 / kg"
- Original: "₹100.00 (5% off)"
- Description: "Organic red apples, 1kg pack..."
- Stock: "50 units available"
- Default quantity: 1

**Features:**
- Swipe through images
- Quantity increase/decrease
- Add to cart with success message
- Buy now navigates to checkout
- Navigate to shop

---

## 9. CART SCREEN

**Purpose:** Manage cart items

**Elements:**
- Header with back button, "Shopping Cart" title, Clear button
- List of cart items

**Cart Item Contains:**
- Product image (small)
- Product name
- Price per unit (e.g., "₹95/kg")
- Shop name (e.g., "From: Fresh Store")
- Quantity selector (-, number, +)
- Item total price (e.g., "₹190.00")
- Remove button (trash icon)

**Order Summary Card Contains:**
- "Order Summary" heading
- Subtotal line
- Delivery charge line
- Divider
- Total amount (large, bold)
- Proceed to Checkout button (primary, full width)

**Data to Display:**
- Cart items with dummy data:
  - Fresh Apples, ₹95/kg, Fresh Store, Qty: 2, Total: ₹190
  - Organic Tomatoes, ₹45/500g, Quick Mart, Qty: 1, Total: ₹45
- Order summary:
  - Subtotal: ₹235.00
  - Delivery: ₹30.00
  - Total: ₹265.00

**Features:**
- Update quantity
- Remove items
- Clear all items
- Navigate to checkout (if logged in, else login)
- Empty cart state message

---

## 10. CHECKOUT SCREEN (Future)

**Purpose:** Review and place order

**Elements:**
- Delivery Address section with address card and "Change Address" button
- Order Items list (read-only cart items)
- Payment Method selection (radio buttons):
  - Cash on Delivery
  - UPI
  - Card
- Order Summary (same as cart)
- Place Order button

**Data to Display:**
- Address: "John Doe, 123 Main Street, City, State - 123456"
- Order items list
- Payment methods
- Order summary totals

**Features:**
- Select/change address
- Choose payment method
- Review order items
- Place order with confirmation

---

## 11. SHOPKEEPER DASHBOARD

**Purpose:** Overview of shopkeeper's business

**Elements:**
- Welcome message: "Welcome back, [Name]!"
- Stats card:
  - Today's Orders: 12
  - Today's Revenue: ₹5,450
- My Shops button (primary)
- Add New Shop button (primary)
- View Analytics button
- Order Management button

**Data to Display:**
- User name
- Today's stats (orders, revenue)
- Button labels

**Features:**
- Navigate to shops
- Create new shop
- View analytics
- Manage orders

---

## 12. MY SHOPS SCREEN

**Purpose:** List shopkeeper's shops

**Elements:**
- Header with back button, "My Shops" title, "+ Add Shop" button
- List of shop cards

**Shop Card Contains:**
- Shop image
- Shop name
- Category badge
- Active/Inactive status badge
- Product count (e.g., "📦 50 products")
- Edit button
- Manage Products button

**Data to Display:**
- Shops list with dummy data:
  - Fresh Grocery Store, Groceries, ✅ Active, 50 products
  - Electronics Store, Electronics, ⏸️ Inactive, 30 products

**Features:**
- Tap to edit shop
- Navigate to products management
- Add new shop
- Pull to refresh

---

## 13. CREATE/EDIT SHOP SCREEN

**Purpose:** Create or edit shop details

**Elements:**
- Shop image upload area (with "+ Add Photo" text)
- Shop Name input (required)
- Category dropdown (required)
- Description text area (multiline)
- Address input (required)
- Pincode input (required)
- Location button: "📍 Use Current Location"
- Save Shop button (primary, full width)

**Data to Display:**
- Input placeholders
- Category options: Groceries, Electronics, Clothing, Food, etc.
- Button labels

**Features:**
- Image upload
- Form validation
- Location picker
- Save/Create shop

---

## 14. SHOP PRODUCTS MANAGEMENT SCREEN

**Purpose:** Manage products in a shop

**Elements:**
- Header with back button, "My Products" title, "+ Add Product" button
- Shop name display: "Shop: [Shop Name]"
- Filter tabs: [All] [In Stock] [Out of Stock]
- List of product cards

**Product Card Contains:**
- Product image
- Product name
- Price (e.g., "₹95/kg")
- Stock quantity (e.g., "Stock: 50 units")
- Edit button
- Update Stock button

**Data to Display:**
- Products list with dummy data:
  - Apples, ₹95/kg, Stock: 50 units
  - Tomatoes, ₹45/500g, Stock: 0 units
- Filter tabs

**Features:**
- Filter by stock status
- Edit product
- Update inventory
- Add new product
- Delete product
- Search products

---

## 15. CREATE/EDIT PRODUCT SCREEN

**Purpose:** Create or edit product

**Elements:**
- Shop dropdown (required) - "Select Shop"
- Product image upload area (with "+ Add Photo")
- Product Name input (required)
- Description text area
- Base Price input (required, with ₹ symbol)
- Selling Price input (required, with ₹ symbol)
- Stock Quantity input (required, with "units" label)
- Save Product button (primary, full width)

**Data to Display:**
- Input placeholders
- Shop dropdown options
- Button labels

**Features:**
- Shop selection
- Image upload
- Form validation
- Save product

---

## 16. INVENTORY MANAGEMENT SCREEN

**Purpose:** Update product stock and price

**Elements:**
- Product name display: "Product: [Name]"
- Shop name display: "Shop: [Shop Name]"
- Stock Quantity section:
  - Current stock display: "Current: 50 units"
  - Quantity selector (-, number input, +)
- Selling Price section:
  - Current price display: "Current: ₹95.00"
  - Price input field (with ₹ symbol)
- Update Inventory button (primary, full width)

**Data to Display:**
- Product name: "Fresh Red Apples"
- Shop name: "Fresh Grocery Store"
- Current stock: "50 units"
- Current price: "₹95.00"

**Features:**
- Update stock quantity
- Update selling price
- Save changes

---

## 17. IMAGE PICKER COMPONENT

**Purpose:** Reusable image selection modal

**Elements:**
- Modal overlay
- Camera button with icon
- Gallery button with icon
- Cancel button

**Features:**
- Open camera
- Choose from gallery
- Image preview
- Crop/edit option (optional)

---

## 18. SETTINGS SCREEN

**Purpose:** App settings and preferences

**Elements:**
- Account section:
  - Edit Profile (with arrow)
  - Change Password (with arrow)
- Preferences section:
  - Language (with arrow)
  - Notifications (toggle)
  - Location Services (toggle)
- About section:
  - App Version
  - Terms & Conditions (with arrow)
  - Privacy Policy (with arrow)
  - Help & Support (with arrow)
- Logout button (red, full width)

**Data to Display:**
- App version: "1.0.0"
- Settings labels
- Toggle states

**Features:**
- Navigate to profile
- Change password
- Toggle notifications
- Toggle location
- View terms/privacy
- Logout with confirmation

---

## 19. SEARCH SCREEN

**Purpose:** Global search for products and shops

**Elements:**
- Search input with icon (auto-focus)
- Recent Searches section (chips/tags)
- Result tabs: [Products] [Shops]
- Products section:
  - "Products (X)" heading
  - Product cards grid/list
- Shops section:
  - "Shops (X)" heading
  - Shop cards list

**Data to Display:**
- Recent searches: "Apples", "Groceries", "Electronics"
- Search results count: "25 found"
- Products: 15
- Shops: 10

**Features:**
- Real-time search
- Recent searches display
- Tab switching (Products/Shops)
- Filter by category
- Navigate to product/shop on tap

---

## 📁 Recommended Folder Structure

```
src/
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── ProfileScreen.js
│   ├── customer/
│   │   ├── HomeScreen.js
│   │   ├── CategoryShopsScreen.js
│   │   ├── ShopDetailScreen.js
│   │   ├── ShopProductsScreen.js
│   │   ├── ProductDetailScreen.js
│   │   ├── CartScreen.js
│   │   └── CheckoutScreen.js
│   ├── shopkeeper/
│   │   ├── DashboardScreen.js
│   │   ├── MyShopsScreen.js
│   │   ├── CreateEditShopScreen.js
│   │   ├── ShopProductsManagementScreen.js
│   │   ├── CreateEditProductScreen.js
│   │   └── InventoryManagementScreen.js
│   └── common/
│       ├── SearchScreen.js
│       └── SettingsScreen.js
├── components/
│   ├── common/
│   ├── product/
│   ├── shop/
│   ├── cart/
│   └── image/
└── navigation/
```

---

## 🔄 Navigation Flow

### Customer Flow
```
Home → Category Shops → Shop Detail → Shop Products → Product Detail → Cart → Checkout
```

### Shopkeeper Flow
```
Dashboard → My Shops → Shop Products Management → Create/Edit Product
         ↓
    Create/Edit Shop
```

---

## 📱 Implementation Priority

### Phase 1 (Core Customer)
1. Login Screen
2. Register Screen
3. Home Screen
4. Category Shops Screen
5. Shop Products Screen
6. Product Detail Screen
7. Cart Screen

### Phase 2 (Enhanced)
8. Shop Detail Screen
9. Profile Screen
10. Image Picker Component

### Phase 3 (Shopkeeper)
11. Shopkeeper Dashboard
12. My Shops Screen
13. Create/Edit Shop Screen
14. Create/Edit Product Screen
15. Inventory Management Screen

### Phase 4 (Advanced)
16. Search Screen
17. Settings Screen
18. Checkout Screen

---

**Use this guide to understand the UI structure for each screen. Integrate backend APIs manually as needed! 🚀**
