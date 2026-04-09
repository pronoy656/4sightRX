import axios from 'axios';

const axiosSecure = axios.create({
    // Replace with your API base URL if different
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// Add a request interceptor
axiosSecure.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        // E.g., getting the token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('access-token') : null;
        if (token) {
            config.headers.authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosSecure.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
    },
    async (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        const status = error.response?.status;
        
        // Handle 401 or 403 authorization errors
        if (status === 401 || status === 403) {
            console.error('Unauthorized access or token expired!', status);
            
            // Log out user and redirect to login securely
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access-token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosSecure;
