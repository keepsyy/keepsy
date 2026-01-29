// auth.js - MojoAuth Handler

const Auth = {
    init: function () {
        // Initialize MojoAuth instance
        // Assuming MojoAuth script is loaded in index.html
        if (!window.MojoAuth) {
            console.error("MojoAuth SDK not loaded");
            return;
        }

        const mojoauth = new MojoAuth(CONFIG.MOJOAUTH_API_KEY, {
            source: [{ type: "email", feature: "otp" }],
            language: "en",
            redirect_url: window.location.href, // Handle redirect manually often better for SPA-feel
        });

        return mojoauth;
    },

    // Check if user is logged in
    checkSession: async function () {
        return new Promise((resolve) => {
            const mojoauth = new MojoAuth(CONFIG.MOJOAUTH_API_KEY);
            mojoauth.signInWithState().then(response => {
                if (response.authenticated) {
                    // Update session
                    localStorage.setItem('keepsy_user', JSON.stringify(response.user));
                    resolve(response.user);
                } else {
                    resolve(null);
                }
            }).catch(() => {
                // If checking state fails, check local token validity or assume logged out
                // For simplicity in this vanilla boilerplate, we rely on the redirect flow
                resolve(null);
            });
        });
    },

    // Explicit Login Trigger
    startLogin: function (containerId) {
        const mojoauth = this.init();
        if (mojoauth) {
            mojoauth.signIn().then(response => {
                if (response.authenticated) {
                    console.log("Logged In User:", response.user);
                    localStorage.setItem('keepsy_user', JSON.stringify(response.user));
                    window.location.href = "timeline.html";
                }
            });
        }
    },

    logout: function () {
        localStorage.removeItem('keepsy_user');
        window.location.href = "index.html";
    },

    getUser: function () {
        const u = localStorage.getItem('keepsy_user');
        return u ? JSON.parse(u) : null;
    }
};
