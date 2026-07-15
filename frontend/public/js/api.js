/* ==========================================================================
   GIGFLOW - REST API CLIENT (api.js)
   ========================================================================== */

const BASE_URL = window.location.origin.includes(':5000') 
    ? '/api' 
    : 'http://localhost:5000/api';

const API = {
    // Standardized Fetch Helper with Credentials (Cookies)
    _fetch: async (endpoint, method = 'GET', data = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };

        const config = {
            method,
            headers,
            credentials: 'include' // Ensures HTTP-only cookies are transmitted cross-origin or same-origin
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API Error');
        }

        return result;
    },

    // ==========================================
    // AUTHENTICATION APIs
    // ==========================================
    register: async (userData) => {
        return await API._fetch('/auth/register', 'POST', userData);
    },

    login: async (email, password) => {
        return await API._fetch('/auth/login', 'POST', { email, password });
    },

    logout: async () => {
        return await API._fetch('/auth/logout', 'POST');
    },

    getSession: async () => {
        return await API._fetch('/auth/session', 'GET');
    },

    // ==========================================
    // JOBS APIs
    // ==========================================
    getJobs: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/jobs?${queryParams}` : '/jobs';
        return await API._fetch(endpoint, 'GET');
    },

    getRecommendedJobs: async () => {
        return await API._fetch('/jobs/recommended', 'GET');
    },

    getSavedJobs: async () => {
        return await API._fetch('/jobs/saved', 'GET');
    },

    toggleSaveJob: async (jobId) => {
        return await API._fetch(`/jobs/${jobId}/save`, 'POST');
    },

    applyJob: async (jobId, coverLetter) => {
        return await API._fetch(`/jobs/${jobId}/apply`, 'POST', { cover_letter: coverLetter });
    },

    getApplications: async () => {
        return await API._fetch('/applications', 'GET');
    },

    updateApplicationStatus: async (appId, status) => {
        return await API._fetch(`/applications/${appId}/status`, 'PUT', { status });
    },

    addManualApplication: async (appDetails) => {
        return await API._fetch('/applications/manual', 'POST', appDetails);
    },

    deleteApplication: async (appId) => {
        return await API._fetch(`/applications/${appId}`, 'DELETE');
    },

    // ==========================================
    // PROFILE APIs
    // ==========================================
    getProfile: async () => {
        return await API._fetch('/profile', 'GET');
    },

    updateProfile: async (profileData) => {
        return await API._fetch('/profile', 'PUT', profileData);
    },

    // ==========================================
    // LEARNING & ROADMAP APIs
    // ==========================================
    getLearningRoadmap: async () => {
        return await API._fetch('/learning', 'GET');
    },

    // ==========================================
    // CAREER ANALYTICS APIs
    // ==========================================
    getAnalytics: async () => {
        return await API._fetch('/analytics', 'GET');
    },

    // ==========================================
    // AI TOOLBOX APIs
    // ==========================================
    getResumeSuggestions: async (skills, bio) => {
        return await API._fetch('/ai/resume', 'POST', { skills, bio });
    },

    getATSCheck: async (resumeText, jobDescription) => {
        return await API._fetch('/ai/ats-check', 'POST', { resumeText, jobDescription });
    },

    generateCoverLetter: async (jobTitle, companyName, profileSummary) => {
        return await API._fetch('/ai/cover-letter', 'POST', { jobTitle, companyName, profileSummary });
    },

    sendCoachMessage: async (message, chatHistory = []) => {
        return await API._fetch('/ai/coach', 'POST', { message, chatHistory });
    },

    verifyInterviewAnswer: async (question, answer) => {
        return await API._fetch('/ai/interview', 'POST', { question, answer });
    }
};

window.API = API;
