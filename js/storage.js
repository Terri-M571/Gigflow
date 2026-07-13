/* ==========================================================================
   GIGFLOW - DATA ARCHITECTURE & STORAGE MODULE (storage.js)
   ========================================================================== */

const STORAGE_KEYS = {
    USER_SESSION: 'gigflow_user_session',
    USERS: 'gigflow_users',
    JOBS: 'gigflow_jobs',
    PROJECTS: 'gigflow_projects',
    APPLICATIONS: 'gigflow_applications',
    COACHES: 'gigflow_coaches',
    COURSES: 'gigflow_courses',
    BOOKMARKS: 'gigflow_bookmarks',
    INTERVIEWS: 'gigflow_interviews'
};

const StorageManager = {
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Error reading from LocalStorage:", e);
            return null;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error("Error writing to LocalStorage:", e);
            return false;
        }
    },

    remove: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};

// Initial Mock Databases (Kenya Market)
const INITIAL_JOBS = [
    {
        id: 'job-1',
        title: 'Senior AI Engineer',
        company: 'Safaricom PLC',
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf4hySZerAbzCcJ_kM-_XSJjrdMrcACMVozxxJYW5CTwIOJS78__WRd5lCUGimCWpVmNGW1SE5DRGr8iJrwLti3fW6GtrW8LxiEctN99oMR0IFbEZFhKAJNN0PZouEPDOX-XZheq5HAqTk30Md8dwzMuxKIgxemswg5Db7F8LzqRL0N9gOA53pDQyEFQ8JXgpLdc_x3uPmSkr_w3WD06T8mVWx6Gx_EAU41mNn-We8cPW0eqMPJIdr',
        location: 'Nairobi',
        type: 'Full-time',
        salary: 'Ksh 350,000 - 500,000 / mo',
        skills: ['PyTorch', 'LLMs', 'NLP', 'Python'],
        experience: 'Senior (5+ years)',
        description: 'Safaricom is leading digital transformation in East Africa. We are seeking a Senior AI Engineer to join our M-Pesa product squad to build intelligent credit scoring and fraud detection models.',
        created: '1 day ago',
        rating: 4.8
    },
    {
        id: 'job-2',
        title: 'VP of Product Design',
        company: 'Equity Bank Kenya',
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5lv45Cj1zsVdut0bvgiJuwaok2q6QLI6kS1J_xbb2U33pSKfBHLoKdjZpskOtl6loDF5kvFJVbB-BIW6IBL4dssD9verhZxjl3d57dGcMhPnmEd8NsX9QY6nJqysj4JTprtWo0cLQ0VF-2cm6Q1RPsoBdmht2dh7cUrd77KYlFbR89YAauQ1sgzvH7rKcEKhIGG4LHidW4QVzvjDRr2WacpIqmFgBG42VtCwPZBbKpJJgT1Qw-css',
        location: 'Nairobi',
        type: 'Full-time',
        salary: 'Ksh 450,000 - 650,000 / mo',
        skills: ['Leadership', 'Design Strategy', 'Figma', 'Fintech'],
        experience: 'Executive (8+ years)',
        description: 'Lead a team of 15 designers across Equity digital products. Help define the future of international banking systems and asset allocations.',
        created: '2 days ago',
        rating: 4.5
    },
    {
        id: 'job-3',
        title: 'Staff Frontend Architect',
        company: 'Cellulant',
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBODYkmqQRs_WT_UDlC_xtnqMYKq-P1CEjWaY47oB32O-YFXsuvixqeLeItj4IS6TgeM0bYhpY2Y9YYXVW03w7nQIXPi3i1b8-uRMjt-9a2mQa64TxD5IVKl8u_mNEl0OpVooqxvpWljzptuWWH8M-Mt_bsGKhZo1EmAZ5QvB9IcqQxH6Zci9sgNA2mvn_Ic43EUl10Vx071l02VKKvLuvaEWNnp2z9dNHk9aXkg55AapUEGM-DZf1v',
        location: 'Remote (Kenya)',
        type: 'Contract',
        salary: 'Ksh 3,500 - 5,000 / hr',
        skills: ['React', 'Next.js', 'WebAssembly', 'Performance'],
        experience: 'Senior (6+ years)',
        description: 'Construct complex real-time web viewers for payment sequence flows. Focus heavily on layout rendering, high-bandwidth canvas visualizations, and client-side speeds.',
        created: '3 days ago',
        rating: 4.9
    },
    {
        id: 'job-4',
        title: 'Communications Coordinator',
        company: 'EABL (East African Breweries)',
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfe7naSQ_kIyiR-gJm1TB4YLOgEXOAJFGRwZD5koJmGK8caOJGdolihBsDQSzWf1omFNDfKa-KuuPfLjZAfnMVFQ3CCILf262Khubla0FfhIm-CQlUSAN3NC3h5GRU3eu_mmUqkV9ZGLQIpuIDKpfkIwbodui6LTXXN-bk4s2MAhr2UQMa0lU1qVBMhe3tmOAWpkk9PSKlIg_o0RpNMvLE-BJDxMAqX1Wcv1eGUteqjzoNBRODSgmg',
        location: 'Nairobi',
        type: 'Full-time',
        salary: 'Ksh 180,000 - 250,000 / mo',
        skills: ['Public Relations', 'Copywriting', 'Digital Marketing', 'Media Relations'],
        experience: 'Mid-Level (3-5 years)',
        description: 'Manage corporate communications, brand public relations campaigns, and internal communications across East African markets.',
        created: '4 days ago',
        rating: 4.6
    },
    {
        id: 'job-5',
        title: 'UX/UI Designer',
        company: 'Andela Kenya',
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBt6eQAuNYmmuIwfydorlasT_p4edKihOIdSnldMs1tW4ix4oRgPtk5JaiVtyu4eLxvtVU-WDpxIZQeFZb6F5rZfyfjlccO1tToLShDhL_pqiXA3t5gVjeShfm9k1cq47s-XSZBfVTsV72S6crlWcxjKRMnnrntD1WwdakVrrtcMCUp0jI8Byoz_-s_Xj__pjcYXhbkby1YtM-OqLpkqbIoSF_glvweoCPo_TqYhteHyVmldAtaa-cw',
        location: 'Nairobi',
        type: 'Full-time',
        salary: 'Ksh 250,000 - 380,000 / mo',
        skills: ['UX Research', 'Figma', 'Prototyping'],
        experience: 'Mid-Senior (4+ years)',
        description: 'Design interactive playground interfaces for our developer AI products. Translate technical API outputs into sleek layouts.',
        created: '5 days ago',
        rating: 4.4
    }
];

const INITIAL_PROJECTS = [
    {
        id: 'proj-1',
        title: 'Fintech Mobile App UI Redesign',
        client: 'Little Cab',
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBODYkmqQRs_WT_UDlC_xtnqMYKq-P1CEjWaY47oB32O-YFXsuvixqeLeItj4IS6TgeM0bYhpY2Y9YYXVW03w7nQIXPi3i1b8-uRMjt-9a2mQa64TxD5IVKl8u_mNEl0OpVooqxvpWljzptuWWH8M-Mt_bsGKhZo1EmAZ5QvB9IcqQxH6Zci9sgNA2mvn_Ic43EUl10Vx071l02VKKvLuvaEWNnp2z9dNHk9aXkg55AapUEGM-DZf1v',
        budget: 'Ksh 180,000',
        category: 'UI/UX Design',
        duration: '4 weeks',
        skills: ['Branding', 'Figma', 'Web Design'],
        description: 'We need a complete redesign of our landing page and visual brand standards to match our recent breakthroughs in ride-hailing services.',
        rating: 4.9,
        proposals: 14
    },
    {
        id: 'proj-2',
        title: 'Merchant Integration Module',
        client: 'Jumia Kenya',
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwf6R4XeDCwIfDPFI3CZ_OBICvQKdgKKpGjVOjnSp2zvKC0coFgo0RpEkh2aD208WxqN24OGvC2hX_C39sR3J0-Oc34ssUrhw-bKrzwxM0CycS5HACG1_UzDQ9kwKjMuAuP3NlBlfCw36-Yp-8QbIFfMq5_YYpCWHvpvhPGoFYocytjNq1TpRtSf4Kmcd-3Mf6gGt63fGBjpToZ_sXmqJa8evf_FD9e53QX1NjAMBVLriWyS-6BqVEWAGtcnPxxN6P8g',
        budget: 'Ksh 120,000',
        category: 'Development',
        duration: '2 weeks',
        skills: ['Shopify Liquid', 'CSS3', 'JavaScript'],
        description: 'Create a tailored merchant e-commerce site with interactive color and material selectors.',
        rating: 4.7,
        proposals: 8
    },
    {
        id: 'proj-3',
        title: 'Marketing Video Graphics',
        client: 'Copia Kenya',
        logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf4hySZerAbzCcJ_kM-_XSJjrdMrcACMVozxxJYW5CTwIOJS78__WRd5lCUGimCWpVmNGW1SE5DRGr8iJrwLti3fW6GtrW8LxiEctN99oMR0IFbEZFhKAJNN0PZouEPDOX-XZheq5HAqTk30Md8dwzMuxKIgxemswg5Db7F8LzqRL0N9gOA53pDQyEFQ8JXgpLdc_x3uPmSkr_w3WD06T8mVWx6Gx_EAU41mNn-We8cPW0eqMPJIdr',
        budget: 'Ksh 85,000',
        category: 'Video & Motion Graphics',
        duration: '10 days',
        skills: ['After Effects', 'AI Voiceovers', 'Motion Design'],
        description: '1-minute product teaser for a SaaS analytics tool launch. Assets and high-level brief provided.',
        rating: 4.8,
        proposals: 5
    }
];

const INITIAL_APPLICATIONS = [
    {
        id: 'app-1',
        title: 'Communications Coordinator',
        company: 'EABL',
        logo: 'EA',
        location: 'Nairobi',
        date: 'Applied 2 days ago',
        status: 'interview'
    },
    {
        id: 'app-2',
        title: 'Senior AI Engineer',
        company: 'Safaricom PLC',
        logo: 'SF',
        location: 'Nairobi',
        date: 'Applied 5 days ago',
        status: 'applied'
    },
    {
        id: 'app-3',
        title: 'Staff Frontend Architect',
        company: 'Cellulant',
        logo: 'CL',
        location: 'Remote (Kenya)',
        date: 'Applied 1 week ago',
        status: 'rejected'
    }
];

const INITIAL_COACHES = [
    {
        id: 'coach-1',
        name: 'Elena Rostova',
        title: 'Director of Design at Safaricom',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiL7RjE3aj4KVZM8KmEQFgVag44EJYYPwdAb0NF3KZ45tQe7_2nbazc8mqaRLpMaJ9KWwoTRVFdOf57Uqy3BylONbwSJR5VtFDeCkjzrC2hb1_5Tq2IlAtL0EdggS-ncgRoYZ6DSSshvyOli1xZNyGcF-ixk8b0Bqwh8w7QKzGz3ocydumVbZ466JqNNXe2k8b8vvuZbdm3K69PCVAGK--dMqIyPkKrweQ3ZrGSwb5kPUqknVai7go',
        specialty: 'Portfolio Review & UX Strategy',
        rate: 'Ksh 8,000/hr',
        rating: 4.9,
        available: 'Tomorrow at 3:00 PM'
    },
    {
        id: 'coach-2',
        name: 'Marcus Vance',
        title: 'Principal Architect at Andela',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMLh0SJONRVJyVz0nvgnMZPQcQcWeaoeuFD_oWSkaYN9g2FE22Ur_sr-BjAvGemgO-4LZeBc88PsOFNPz8xkzHbYfLA-4un_aiO6Xj0dxmEHwl6934coJLwwqkdV9ZbooVKEX1xIQUyUpJOdHsio-aiVcGnZfwAKuCmfPyLfEPAwrvBBcklKYDfN_0pn7LQgGSdBkw4BFbrk-7BKKCUV55eVHsKm0RH1uqwaA00eStbFOTHQ1VF-QK',
        specialty: 'Technical System Designs',
        rate: 'Ksh 10,000/hr',
        rating: 4.8,
        available: 'Wednesday at 10:00 AM'
    }
];

const INITIAL_COURSES = [
    {
        id: 'course-1',
        title: 'Next-Generation Design Systems',
        instructor: 'Elena Rostova',
        progress: 65,
        rating: 4.9,
        hours: 12,
        roadmap: 'UX Design Architect'
    },
    {
        id: 'course-2',
        title: 'Mastering AI-Assisted Front-End Workflows',
        instructor: 'Marcus Vance',
        progress: 30,
        rating: 4.8,
        hours: 8,
        roadmap: 'AI Engineer'
    }
];

// Initialize Storage Databases
(function initDB() {
    // Force reset for Kenyan market data
    StorageManager.set(STORAGE_KEYS.JOBS, INITIAL_JOBS);
    StorageManager.set(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    StorageManager.set(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    StorageManager.set(STORAGE_KEYS.COACHES, INITIAL_COACHES);
    StorageManager.set(STORAGE_KEYS.COURSES, INITIAL_COURSES);
})();
