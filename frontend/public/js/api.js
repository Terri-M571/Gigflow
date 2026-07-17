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

        const token = localStorage.getItem('gigflow_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
            cache: 'no-cache',
            credentials: 'include' // Ensures HTTP-only cookies are transmitted cross-origin or same-origin
        };

        if (data instanceof FormData) {
            delete headers['Content-Type'];
            config.body = data;
        } else if (data) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            
            if (response.status === 401) {
                localStorage.removeItem('gigflow_token');
                localStorage.removeItem('gigflow_user');
                
                let friendlyMsg = 'Your session has expired. Please sign in again.';
                if (endpoint.includes('/profile/resume')) {
                    friendlyMsg = 'Please log in to upload your resume.';
                }
                
                setTimeout(() => {
                    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                    if (currentPage !== 'login.html' && currentPage !== 'signup.html' && currentPage !== 'index.html') {
                        window.location.href = 'login.html';
                    }
                }, 1800);
                
                throw new Error(friendlyMsg);
            }

            const result = await response.json();

            if (!response.ok) {
                let msg = result.message || 'API Error';
                if (msg.includes('No token') || msg.includes('authorization denied') || msg.includes('Unauthorized') || msg.includes('invalid') || msg.includes('expired')) {
                    if (endpoint.includes('/profile/resume')) {
                        msg = 'Please log in to upload your resume.';
                    } else {
                        msg = 'Your session has expired. Please sign in again.';
                    }
                }
                throw new Error(msg);
            }

            if (result.success && result.token) {
                localStorage.setItem('gigflow_token', result.token);
            }

            return result;
        } catch (err) {
            if (err.message.includes('Failed to fetch') || err.message.includes('fetch') || err instanceof TypeError) {
                throw new Error('❌ Server unavailable');
            }
            throw err;
        }
    },

    // ==========================================
    // AUTHENTICATION APIs
    // ==========================================
    getAuthConfig: async () => {
        return await API._fetch('/auth/config', 'GET');
    },

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

    requestPasswordReset: async (email) => {
        return await API._fetch('/auth/forgot-password', 'POST', { email });
    },

    resetPassword: async (token, password) => {
        return await API._fetch('/auth/reset-password', 'POST', { token, password });
    },

    // ==========================================
    // JOBS APIs
    // ==========================================
    getJobs: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/jobs/search?${queryParams}` : '/jobs/search';
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
    },

    // ==========================================
    // DOCUMENT & ASSET APIs
    // ==========================================
    uploadResume: async (formData, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${BASE_URL}/profile/resume`);
            xhr.withCredentials = true; // Support HTTP-Only cookies
            
            const token = localStorage.getItem('gigflow_token');
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && typeof onProgress === 'function') {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress(percent);
                }
            };
            
            xhr.onload = () => {
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(res);
                    } else if (xhr.status === 401) {
                        localStorage.removeItem('gigflow_token');
                        localStorage.removeItem('gigflow_user');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1800);
                        reject(new Error('Please log in to upload your resume.'));
                    } else {
                        let msg = res.message || 'Upload failed';
                        if (msg.includes('No token') || msg.includes('authorization denied') || msg.includes('Unauthorized') || msg.includes('invalid') || msg.includes('expired')) {
                            msg = 'Please log in to upload your resume.';
                        }
                        reject(new Error(msg));
                    }
                } catch (err) {
                    reject(new Error('Upload failed. Please try again.'));
                }
            };
            
            xhr.onerror = () => reject(new Error('Upload failed. Please try again.'));
            xhr.send(formData);
        });
    },

    deleteResume: async () => {
        return await API._fetch('/profile/resume', 'DELETE');
    },

    uploadPortfolio: async (formData, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${BASE_URL}/profile/portfolio`);
            xhr.withCredentials = true;
            
            const token = localStorage.getItem('gigflow_token');
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && typeof onProgress === 'function') {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress(percent);
                }
            };
            
            xhr.onload = () => {
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(res);
                    } else if (xhr.status === 401) {
                        localStorage.removeItem('gigflow_token');
                        localStorage.removeItem('gigflow_user');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1800);
                        reject(new Error('Please log in to upload your portfolio.'));
                    } else {
                        let msg = res.message || 'Upload failed';
                        if (msg.includes('No token') || msg.includes('authorization denied') || msg.includes('Unauthorized') || msg.includes('invalid') || msg.includes('expired')) {
                            msg = 'Please log in to upload your portfolio.';
                        }
                        reject(new Error(msg));
                    }
                } catch (err) {
                    reject(new Error('Upload failed. Please try again.'));
                }
            };
            
            xhr.onerror = () => reject(new Error('Upload failed. Please try again.'));
            xhr.send(formData);
        });
    },

    deletePortfolio: async () => {
        return await API._fetch('/profile/portfolio', 'DELETE');
    },

    // ==========================================
    // COVER LETTER APIs
    // ==========================================
    getCoverLetters: async () => {
        return await API._fetch('/cover-letters', 'GET');
    },
    
    saveCoverLetter: async (letterData) => {
        return await API._fetch('/cover-letters', 'POST', letterData);
    },

    updateCoverLetter: async (id, letterData) => {
        return await API._fetch(`/cover-letters/${id}`, 'PUT', letterData);
    },

    deleteCoverLetter: async (id) => {
        return await API._fetch(`/cover-letters/${id}`, 'DELETE');
    }
};

window.API = API;
