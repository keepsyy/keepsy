// Keepsy Configuration
// Replace these with your actual credentials

const CONFIG = {
    // MojoAuth (Authentication)
    MOJOAUTH_API_KEY: 'YOUR_MOJOAUTH_API_KEY', // Get from mojoauth.com

    // Supabase (Database)
    SUPABASE_URL: 'YOUR_SUPABASE_URL',
    SUPABASE_KEY: 'YOUR_SUPABASE_ANON_KEY',

    // Cloudinary (Image Storage)
    CLOUDINARY_CLOUD_NAME: 'YOUR_CLOUD_NAME',
    CLOUDINARY_UPLOAD_PRESET: 'keepsy_upload', // Create this unsigned preset in Cloudinary settings
};

// Global Error Handler
window.onerror = function (msg, url, line) {
    console.error(`Error: ${msg}\nLine: ${line}`);
    return false;
};
