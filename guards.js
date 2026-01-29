// guards.js - Session Protection

(function () {
    const isTimeline = window.location.pathname.includes('timeline.html');
    const isIndex = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');

    const user = Auth.getUser();

    if (isTimeline) {
        if (!user) {
            console.warn("Unauthorized access attempt. Redirecting...");
            window.location.href = 'index.html';
        }
    }

    if (isIndex) {
        if (user) {
            console.log("User already logged in. Redirecting to timeline...");
            window.location.href = 'timeline.html';
        }
    }
})();
