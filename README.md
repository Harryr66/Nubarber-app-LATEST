# NuBarber - All-in-One Barbershop Platform

This is a Next.js application built with Firebase, Stripe, and ShadCN UI. It provides a complete solution for barbershops to manage their business online, including a public booking site and a private admin dashboard.

## Downloading Your Project

Follow these steps to download your entire project as a single `.zip` file.

1.  **Click on the File Explorer**: First, click anywhere inside the File Explorer panel on the left side of this window to make sure it's active.
2.  **Select All Files**: Press `Ctrl+A` (on Windows/Linux) or `Cmd+A` (on Mac) to select every file and folder in your project.
3.  **Right-Click to Open Menu**: Right-click on any of the highlighted files. A context menu will appear.
4.  **Download**: Find and click the **"Download"** option in the menu.
5.  **Save the Zip File**: Your browser will begin downloading a file named `files.zip`. This archive contains your complete project. You can then unzip this file on your computer and open the folder in Cursor.

## Moving to a Local Environment (Cursor, VS Code, etc.)

Follow these steps to download your project and run it on your local machine. This is the recommended approach for a stable development experience.

### **Step 1: Download Your Project Code**

First, you need to download the complete codebase as a `.zip` file from your current development environment. Unzip this file in a folder on your computer where you wish to work.

### **Step 2: Install Prerequisites**

*   **Node.js**: You must have Node.js (version 18 or later) installed. You can download it from [nodejs.org](https://nodejs.org/). `npm`, the package manager, is included with Node.js.
*   **Cursor (or other code editor)**: Download and install Cursor from [cursor.sh](https://cursor.sh/) or your preferred code editor.

### **Step 3: Set Up Your Environment Variables**

This is the most critical step. Your application needs secret keys to connect to services like Firebase and Stripe. You must create a `.env.local` file in the root of your project folder.

1.  Create a new file named `.env.local` in the project's root directory.
2.  Copy the entire block below and paste it into your new `.env.local` file.
3.  Follow the instructions in the "Finding Your Credentials" section to replace the placeholder values with your actual keys.

```
# Firebase Project Credentials
# Find these in your Firebase project settings under "General" -> "Your apps" -> "SDK setup and configuration" -> "Config"
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

# Resend API Key for sending emails
# Find this in your Resend dashboard under "API Keys"
RESEND_API_KEY="YOUR_RESEND_API_KEY"

# Stripe API Keys for payments
# Find these in your Stripe dashboard under "Developers" -> "API keys"
STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"

# Google My Business API Credentials
# Find these in Google Cloud Console under "APIs & Services" -> "Credentials"
GMB_CLIENT_ID="YOUR_GMB_CLIENT_ID"
GMB_CLIENT_SECRET="YOUR_GMB_CLIENT_SECRET"
GMB_REDIRECT_URI="http://localhost:9002/api/auth/gmb/callback" # This should be pre-configured

# Application URL
# For local development, this is the address of your running app
NEXT_PUBLIC_APP_URL="http://localhost:9002"
```

---

#### **Finding Your Credentials**

*   **Firebase (`NEXT_PUBLIC_FIREBASE_*`)**: Go to the [Firebase Console](https://console.firebase.google.com/), open your project, click the gear icon (⚙️) for **Project settings**, and find the web app config under the **General** tab.
*   **Resend (`RESEND_API_KEY`)**: Log in to [Resend](https://resend.com/login) and find your key under the **API Keys** section.
*   **Stripe (`STRIPE_SECRET_KEY`)**: Log in to your [Stripe Dashboard](https://dashboard.stripe.com/) and go to the **Developers** section to find your secret keys.
*   **Google My Business (`GMB_*`)**: Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), select your project, and find your OAuth 2.0 Client ID. The Client Secret will be there as well.

---

### **Step 4: Install Project Dependencies**

Open your project folder in Cursor. Then, open the integrated terminal (`Terminal` > `New Terminal`) and run the following command. This will download and install all the necessary packages for the application to run.

```bash
npm install
```

### **Step 5: Run the Development Server**

Once the installation is complete, start the Next.js development server with this command:

```bash
npm run dev
```

Your application should now be running locally! You can view it by opening your browser and navigating to [http://localhost:9002](http://localhost:9002).

From here, you can use Grok and the full functionality of Cursor to continue building and debugging your application.
