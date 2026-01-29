import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from './components/toast-container';
import { initializeTheme } from './hooks/use-appearance';
import { ToastProvider } from './hooks/use-toast';

// Configure axios defaults for Laravel
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Function to update CSRF token everywhere
const updateCSRFToken = (token: string) => {
    if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            metaTag.setAttribute('content', token);
        }
    }
};

// Function to get fresh CSRF token from meta tag
const getCSRFToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

// Set initial CSRF token
const csrfToken = getCSRFToken();
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Function to fetch a fresh CSRF token from the server
const refreshCSRFToken = async (): Promise<string | null> => {
    try {
        // Make a request to get a fresh CSRF token
        const response = await fetch('/csrf-token', {
            method: 'GET',
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            const newToken = data.csrf_token;
            if (newToken) {
                updateCSRFToken(newToken);
            }
            return newToken;
        }
    } catch {
        // Silently fail and return null
    }
    return null;
};

// Track if we're currently refreshing the token to avoid multiple refreshes
let isRefreshingToken = false;
let tokenRefreshPromise: Promise<string | null> | null = null;

// Handle CSRF token mismatch (419) errors for axios requests - retry once with fresh token
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Refresh token only once at a time
            if (!isRefreshingToken) {
                isRefreshingToken = true;
                tokenRefreshPromise = refreshCSRFToken();
            }
            
            const newToken = await tokenRefreshPromise;
            isRefreshingToken = false;
            
            if (newToken) {
                originalRequest.headers['X-CSRF-TOKEN'] = newToken;
                return axios(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

// Listen for Inertia navigate events to keep CSRF token synced
router.on('success', (event) => {
    const props = event.detail.page.props as { csrf_token?: string };
    if (props.csrf_token) {
        updateCSRFToken(props.csrf_token);
    }
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <ToastProvider>
                    <App {...props} />
                    <ToastContainer />
                </ToastProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
