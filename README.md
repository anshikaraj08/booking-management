<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1PFUxoL6i6uumLFaMBAgO4ZnMMaRXbjAG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. **Email Setup (for Newsletter functionality):**
   - Update `EMAIL_USER` in [.env.local](.env.local) with your Gmail address
   - Generate an App Password from Google Account settings:
     - Go to Google Account → Security → 2-Step Verification → App passwords
     - Generate a new app password for "Mail"
     - Set `EMAIL_PASS` in [.env.local](.env.local) to this app password
4. Run the app:
   `npm run dev`
