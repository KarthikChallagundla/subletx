# SubletX

A modern SaaS platform for secure subscription sharing, built with React, Vite, and Firebase.

## Features

- Clean, SaaS-style UI with Classic Blue theme
- User authentication (register, login, logout)
- List, edit, and delete your own subscription listings
- Browse and filter all available listings
- Secure order and payment flow (with optional payment screenshot upload)
- Admin dashboard for order approval/rejection
- Secure, one-time sharing of credentials between seller and buyer
- Profile management
- Responsive design

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Firebase Authentication](https://firebase.google.com/products/auth)
- [Cloud Firestore](https://firebase.google.com/products/firestore)

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/subletx.git
   cd subletx
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Authentication (Email/Password) and Firestore.
   - Copy your Firebase config and update `src/firebaseConfig.js`:
     ```js
     // src/firebaseConfig.js
     export const firebaseConfig = {
       apiKey: "...",
       authDomain: "...",
       projectId: "...",
       storageBucket: "...",
       messagingSenderId: "...",
       appId: "..."
     };
     ```
4. **Set Firestore Security Rules:**
   - Copy the recommended rules from `firestore.rules` or the section below into the Firebase Console > Firestore > Rules.

5. **Run the app locally:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

## Firestore Security Rules Example

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
    match /orders/{orderId} {
      allow create: if request.auth != null && request.resource.data.buyerId == request.auth.uid;
      allow read: if request.auth != null && (
        resource.data.buyerId == request.auth.uid || resource.data.sellerId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow update: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow delete: if false;
    }
    match /secrets/{secretId} {
      allow create: if request.auth != null && request.resource.data.sellerId == request.auth.uid;
      allow read: if request.auth != null && (
        resource.data.buyerId == request.auth.uid && resource.data.viewed == false
      );
      allow update: if request.auth != null && (
        resource.data.buyerId == request.auth.uid
      );
      allow delete: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Security Notes
- **Your Firebase config in `src/firebaseConfig.js` is safe to commit.**
- **Never commit service account keys or admin credentials.**
- **All sensitive actions are protected by Firestore Security Rules.**

## License

MIT
