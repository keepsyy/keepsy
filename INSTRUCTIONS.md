# Keepsy Backend Instructions

I have generated all the necessary files for the backend. Follow these steps to run the application locally.

## 1. Prerequisites
- Ensure you have **Node.js** installed.

## 2. Setup
Open your terminal in this directory:
`c:\Users\hetsh\.gemini\antigravity\scratch\keepsy`

Run the following command to install dependencies:
```bash
npm install
```

## 3. Run the Server
Start the backend server:
```bash
node server.js
```

You should see:
> Connected to keepsy.db
> Tables initialized
> Keepsy Backend running on http://localhost:3000

## 4. Usage

### Create Invite
1.  Open `create.html` in your browser (preferably via `http://localhost:3000/create.html` if you move it, but opening the file directly might cause CORS issues if headers aren't set for file://. It's best to rely on the static file serving I added to `server.js`).
    -   **Recommended**: Go to **http://localhost:3000/create.html**
2.  Click **Invite your partner**.
3.  Enter an Email or Phone.
4.  Click **Copy link**.
    -   Link format: `http://localhost:3000/invite/<UUID>`

### Verify Invite
1.  Paste the generated link in your browser.
2.  You will see the **Verify to continue** screen.
3.  Complete the Phone.Email verification.
4.  Upon success, you will see "You're in".

## 5. Dev Mode (Testing)
If you want to simulate a successful verification without using real OTP credits:
1.  (This requires manual API call or frontend tweak, but the backend supports it)
2.  If you send `verifiedValue: '123456'` to the verify endpoint with `isDevMode: true`, it will succeed.
