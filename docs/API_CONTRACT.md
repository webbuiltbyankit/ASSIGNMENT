# FORME E-Commerce — Locked Public & Admin API Contract

## 1. Overview & Conventions
- **Base URL**: `/api` (Same-origin development proxy & production rewrite)
- **Currency Unit**: Stored internally as integer paise (`pricePaise`), serialized to display INR integer rupees (`price`) for public endpoints.
- **Envelope Convention**:
  - Success: `{ success: true, ...data }`
  - Failure: `{ success: false, error: { code, message, details?, requestId? } }`
- **Authentication**: Signed JWT stored in HttpOnly, SameSite cookie (`forme_session`).

---

## 2. Public Catalog Endpoints

### `GET /api/products`
Retrieves paginated catalog products matching optional filters.
- **Query Parameters**:
  - `page` (number, default 1)
  - `pageSize` (number, default 12, max 50)
  - `collection` ('men' | 'women')
  - `category` (category slug string)
  - `q` (server-side search query string, regex-escaped)
  - `inStock` ('true')
  - `size` ('S' | 'M' | 'L' | 'XL')
  - `sort` ('featured' | 'newest' | 'priceAsc' | 'priceDesc')
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "items": [
      {
        "id": "67bc9a...",
        "slug": "men-relaxed-linen-shirt-ivory",
        "name": "Relaxed Linen Camp Shirt",
        "collection": "men",
        "category": "shirts",
        "price": 3890,
        "pricePaise": 389000,
        "color": "Warm Ivory",
        "fabric": "100% French Washed Linen",
        "description": "...",
        "care": "...",
        "featured": true,
        "active": true,
        "inStock": true,
        "totalStock": 38,
        "coverImage": "forme-prod-01-front",
        "images": [
          { "assetId": "forme-prod-01-front", "secureUrl": "...", "alt": "...", "role": "primary", "view": "front" }
        ],
        "sizes": [
          { "variantId": "var_01_m", "size": "M", "stock": 14, "isAvailable": true }
        ],
        "createdAt": "2026-01-15T08:00:00.000Z"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 12,
    "totalPages": 2,
    "filters": { "collection": "men", "category": null, "sort": "featured", "q": null }
  }
  ```

### `GET /api/products/:slug`
Retrieves single active product details.
- **Response `200 OK`**: `{ success: true, product: { ...ProductDTO } }`
- **Response `404 Not Found`**: `{ success: false, error: { code: "ERR_PRODUCT_NOT_FOUND", message: "..." } }`

### `GET /api/categories`
Retrieves active clothing categories.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "categories": [
      { "id": "...", "name": "Shirts", "slug": "shirts", "description": "...", "displayOrder": 1, "active": true }
    ]
  }
  ```

---

## 3. Cart & Authoritative Quotation Endpoints

### `POST /api/cart/quote`
Server-authoritative cart calculation. Ignores any client-supplied prices.
- **Request Body**:
  ```json
  {
    "lines": [
      { "productId": "67bc9a...", "variantId": "var_01_m", "quantity": 2 }
    ]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "currency": "INR",
    "totalPaise": 778000,
    "totalINR": 7780,
    "itemCount": 2,
    "validLines": [
      {
        "productId": "67bc9a...",
        "productSlug": "men-relaxed-linen-shirt-ivory",
        "variantId": "var_01_m",
        "title": "Relaxed Linen Camp Shirt",
        "size": "M",
        "quantity": 2,
        "availableStock": 14,
        "unitPricePaise": 389000,
        "unitPriceINR": 3890,
        "lineTotalPaise": 778000,
        "lineTotalINR": 7780,
        "thumbnail": "..."
      }
    ],
    "unavailableLines": [],
    "hasUnavailable": false
  }
  ```

### `GET /api/cart`
Fetches authenticated customer's persisted cart. Requires authentication cookie.

### `PUT /api/cart`
Synchronizes customer cart with database record. Requires authentication cookie.

---

## 4. Authentication Endpoints

### `POST /api/auth/register`
- **Rate Limit**: 20 requests per 15 min per IP.
- **Body**: `{ email, password, name? }`
- **Response `201 Created`**: Sets `forme_session` HttpOnly cookie. Returns public user DTO.

### `POST /api/auth/login`
- **Rate Limit**: 20 requests per 15 min per IP.
- **Body**: `{ email, password }`
- **Response `200 OK`**: Sets `forme_session` HttpOnly cookie. Returns public user DTO.

### `GET /api/auth/me`
- **Headers/Cookies**: `forme_session` cookie.
- **Response `200 OK`**: `{ success: true, user: { id, email, name, role } }`
- **Response `401 Unauthorized`** if not signed in.

### `POST /api/auth/logout`
- **Response `200 OK`**: Clears `forme_session` cookie.

---

## 5. Protected Admin Endpoints
*(All require `role: "admin"`)*
- `GET /api/admin/ping`: Diagnostic authorization verification.
- `GET /api/admin/products`: Full paginated admin inventory list.
- `POST /api/admin/products`: Create product.
- `GET /api/admin/products/:id`: Get complete product for edit.
- `PATCH /api/admin/products/:id`: Update product fields atomically.
- `DELETE /api/admin/products/:id`: Soft delete / archive product.
- `POST /api/admin/uploads/images`: Bounded multipart image upload to Cloudinary.
- `POST /api/admin/categories`: Create category.
- `PATCH /api/admin/categories/:slug`: Update category.
