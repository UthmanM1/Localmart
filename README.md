# 🛒 LocalMart — Local Marketplace App

> A React Native marketplace app connecting local buyers and sellers within a defined radius. Built for a UK-based client as a hyperlocal alternative to Facebook Marketplace, with cleaner UX, in-app chat, and Stripe payment integration.

**Status:** Delivered to Client · v1.2 Live  
**Client:** Freelance — UK-based startup (private)  
**Platform:** iOS & Android (Expo)  
**Developer:** Uthman Mustapha

---

## 📱 What the App Does

LocalMart lets users list items for sale, browse listings within a chosen radius, chat with sellers, and complete purchases securely through Stripe. The client wanted something cleaner and safer than existing platforms, with verified accounts and in-app payment to reduce scams.

---

## ✨ Features

### 🔐 Authentication & Profiles
- Firebase Auth — email/password with email verification
- Profile completion flow — display name, avatar, location (postcode-based)
- Seller rating system — buyers leave ratings after completed transactions
- Avatar stored on Cloudinary

### 📦 Listings
- Create listing with title, description, price, category, and up to 6 photos
- Photos selected via `expo-image-picker`, uploaded to Cloudinary with progress indicator
- Listings stored in Firestore with geohash for location-based querying
- Edit and delete own listings
- Mark as sold

### 🔍 Browse & Search
- Home feed — listings sorted by distance from user's location
- Category filter tabs (Electronics / Clothing / Furniture / Books / Sports / Other)
- Search bar with real-time Firestore query
- Radius slider — filter listings within 1, 5, 10, or 25 miles
- Pull-to-refresh

### 💬 In-App Chat
- Firestore-powered real-time messaging per listing
- Buyer taps "Message Seller" on any listing to open a thread
- Chat thread list on dedicated Messages tab
- Unread message badge

### 💳 Payments (Stripe)
- Stripe integration via a lightweight Express.js backend (Node.js, hosted on Railway)
- "Buy Now" flow — confirm price → Stripe Payment Sheet → Firestore order record
- Payment Intent created server-side for security (no keys in the app)
- Order confirmation screen with receipt details
- Seller notified via push notification on sale

### 🔔 Push Notifications
- Expo Notifications for new messages, offers, and completed sales
- Notification tokens stored per-user in Firestore, refreshed on login

### 🗂️ My Listings & Orders
- Seller dashboard — active listings, sold items, total earnings
- Buyer dashboard — purchase history, items watching

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK ~50) |
| Language | TypeScript |
| Navigation | React Navigation v6 |
| Auth | Firebase Auth |
| Database | Cloud Firestore |
| Media | Cloudinary |
| Payments | Stripe (react-native-stripe-sdk + Express.js backend) |
| Location | expo-location + geofire-common (geohash queries) |
| Notifications | expo-notifications |
| Backend | Node.js / Express.js (Railway) |

---

## 🎨 Design

- **Palette:** Forest green `#16A34A` · Warm amber `#D97706` · Off-white `#F9FAFB`
- Card-grid layout for listings (2-column)
- Full-screen photo viewer with swipe between images
- Stripe Payment Sheet for familiar, trusted checkout UX

---

## 📂 Project Structure

```
localmart/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Listings feed with filters
│   │   ├── ListingScreen.tsx       # Single listing detail
│   │   ├── CreateListingScreen.tsx # New listing form with photo upload
│   │   ├── ChatListScreen.tsx      # All conversations
│   │   ├── ChatScreen.tsx          # Single chat thread
│   │   ├── ProfileScreen.tsx       # User profile and stats
│   │   └── OrdersScreen.tsx        # Purchase/sale history
│   ├── components/
│   │   ├── ListingCard.tsx         # Compact listing card
│   │   ├── PhotoGrid.tsx           # 2-column listing grid
│   │   ├── RadiusSlider.tsx        # Distance filter
│   │   └── RatingStars.tsx         # Star rating display
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── cloudinary.ts
│   │   ├── stripe.ts               # Payment Intent helper
│   │   └── geo.ts                  # Geohash distance queries
│   └── types/index.ts
├── backend/                        # Express.js payment server
│   ├── server.js
│   └── package.json
├── app.json
└── package.json
```

---

## 🔥 Firestore Collections

| Collection | Fields |
|---|---|
| `listings` | `sellerId`, `title`, `description`, `price`, `category`, `photos[]`, `geohash`, `lat`, `lng`, `status`, `createdAt` |
| `messages/{listingId}/{threadId}/msgs` | `senderId`, `text`, `createdAt`, `read` |
| `orders` | `buyerId`, `sellerId`, `listingId`, `amount`, `stripePaymentId`, `status`, `createdAt` |
| `users` | `uid`, `displayName`, `avatarUrl`, `postcode`, `geohash`, `rating`, `totalSales` |

---

## 💳 Payment Flow

```
Client                          Server (Express)               Stripe
  │                                  │                            │
  ├─ POST /create-payment-intent ───▶│                            │
  │  { amount, currency }            ├─ stripe.paymentIntents ───▶│
  │                                  │   .create(...)             │
  │◀─ { clientSecret } ─────────────┤◀── { id, clientSecret } ───┤
  │                                  │                            │
  ├─ presentPaymentSheet() ─────────────────────────────────────▶ │
  │  (Stripe SDK handles UI)         │                       user pays
  │◀─ { error: null } ──────────────│◀───────────────────────────┤
  │                                  │                            │
  ├─ addDoc('orders', {...}) ───────▶│                            │
```

---

## 🚀 Deployment

- Mobile: EAS Build → App Store & Google Play
- Backend: Node.js/Express on Railway (free tier for MVP, upgradeable)
- Stripe: Test mode during development, live keys on delivery

---

## 👨‍💻 Developer

**Uthman Mustapha** — React Native Developer  
[github.com/uthmanmustapha](https://github.com/uthmanmustapha)
