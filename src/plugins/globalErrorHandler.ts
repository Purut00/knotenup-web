import type { App } from 'vue';

export const globalErrorHandler = {
    install(app: App) {
        app.config.errorHandler = (err, _instance, info) => {
            // 1. Log to console (in production, this might be sent to Sentry/LogRocket)
            console.error("Global Error:", err);
            console.error("Vue Info:", info);

            // 2. Prevent total crash if possible (Vue handles this mostly, but good to have)
            // We can also trigger a toast/notification here if we want user visibility
            // alert("Something went wrong. Please try refreshing."); 
        };

        // Handle Unhandled Promise Rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error("Unhandled Promise Rejection:", event.reason);
            // event.preventDefault(); // Prevent default console error if needed
        });
    }
};
