/* ==========================================================================
   GIGFLOW - SEARCHABLE TYPEAHEAD DROPDOWN WIDGET (dropdown.js)
   ========================================================================== */

// 1. COMPREHENSIVE LIST OF OCCUPATIONS (200+)
const OCCUPATIONS = [
    // Technology
    { label: "Software Engineer", category: "Technology" },
    { label: "Frontend Developer", category: "Technology" },
    { label: "Backend Developer", category: "Technology" },
    { label: "Full Stack Developer", category: "Technology" },
    { label: "Mobile Developer", category: "Technology" },
    { label: "Android Developer", category: "Technology" },
    { label: "iOS Developer", category: "Technology" },
    { label: "DevOps Engineer", category: "Technology" },
    { label: "Site Reliability Engineer", category: "Technology" },
    { label: "Cloud Engineer", category: "Technology" },
    { label: "Cloud Architect", category: "Technology" },
    { label: "AI Engineer", category: "Technology" },
    { label: "Machine Learning Engineer", category: "Technology" },
    { label: "NLP Engineer", category: "Technology" },
    { label: "Computer Vision Engineer", category: "Technology" },
    { label: "Data Scientist", category: "Technology" },
    { label: "Data Analyst", category: "Technology" },
    { label: "Data Engineer", category: "Technology" },
    { label: "Database Administrator", category: "Technology" },
    { label: "Cybersecurity Analyst", category: "Technology" },
    { label: "Cybersecurity Engineer", category: "Technology" },
    { label: "Information Security Manager", category: "Technology" },
    { label: "UI Designer", category: "Technology" },
    { label: "UX Designer", category: "Technology" },
    { label: "UI/UX Designer", category: "Technology" },
    { label: "Product Designer", category: "Technology" },
    { label: "Visual Designer", category: "Technology" },
    { label: "Interaction Designer", category: "Technology" },
    { label: "QA Engineer", category: "Technology" },
    { label: "Automation QA Engineer", category: "Technology" },
    { label: "Product Manager", category: "Technology" },
    { label: "Technical Product Manager", category: "Technology" },
    { label: "Scrum Master", category: "Technology" },
    { label: "Agile Coach", category: "Technology" },
    { label: "Systems Administrator", category: "Technology" },
    { label: "Network Engineer", category: "Technology" },
    { label: "Solutions Architect", category: "Technology" },
    { label: "IT Consultant", category: "Technology" },

    // Business & Management
    { label: "Business Analyst", category: "Business" },
    { label: "Project Manager", category: "Business" },
    { label: "Program Manager", category: "Business" },
    { label: "Operations Manager", category: "Business" },
    { label: "Operations Coordinator", category: "Business" },
    { label: "Office Administrator", category: "Business" },
    { label: "Office Manager", category: "Business" },
    { label: "Executive Assistant", category: "Business" },
    { label: "Administrative Assistant", category: "Business" },
    { label: "Management Consultant", category: "Business" },
    { label: "Business Development Manager", category: "Business" },
    { label: "Strategy Manager", category: "Business" },

    // Finance & Accounting
    { label: "Accountant", category: "Finance" },
    { label: "Chartered Accountant", category: "Finance" },
    { label: "Auditor", category: "Finance" },
    { label: "Internal Auditor", category: "Finance" },
    { label: "Tax Specialist", category: "Finance" },
    { label: "Financial Analyst", category: "Finance" },
    { label: "Finance Manager", category: "Finance" },
    { label: "Investment Analyst", category: "Finance" },
    { label: "Investment Banker", category: "Finance" },
    { label: "Portfolio Manager", category: "Finance" },
    { label: "Risk Analyst", category: "Finance" },
    { label: "Economist", category: "Finance" },
    { label: "Banker", category: "Finance" },
    { label: "Loan Officer", category: "Finance" },
    { label: "Actuary", category: "Finance" },

    // Healthcare & Life Sciences
    { label: "Doctor", category: "Healthcare" },
    { label: "General Practitioner", category: "Healthcare" },
    { label: "Surgeon", category: "Healthcare" },
    { label: "Pediatrician", category: "Healthcare" },
    { label: "Psychiatrist", category: "Healthcare" },
    { label: "Nurse", category: "Healthcare" },
    { label: "Registered Nurse", category: "Healthcare" },
    { label: "Nurse Practitioner", category: "Healthcare" },
    { label: "Clinical Officer", category: "Healthcare" },
    { label: "Pharmacist", category: "Healthcare" },
    { label: "Pharmacy Assistant", category: "Healthcare" },
    { label: "Dentist", category: "Healthcare" },
    { label: "Dental Hygienist", category: "Healthcare" },
    { label: "Laboratory Technician", category: "Healthcare" },
    { label: "Medical Lab Scientist", category: "Healthcare" },
    { label: "Physiotherapist", category: "Healthcare" },
    { label: "Occupational Therapist", category: "Healthcare" },
    { label: "Clinical Research Coordinator", category: "Healthcare" },
    { label: "Biotechnologist", category: "Healthcare" },

    // Engineering & Architecture
    { label: "Civil Engineer", category: "Engineering" },
    { label: "Mechanical Engineer", category: "Engineering" },
    { label: "Electrical Engineer", category: "Engineering" },
    { label: "Chemical Engineer", category: "Engineering" },
    { label: "Structural Engineer", category: "Engineering" },
    { label: "Quantity Surveyor", category: "Engineering" },
    { label: "Industrial Engineer", category: "Engineering" },
    { label: "Materials Engineer", category: "Engineering" },
    { label: "Biomedical Engineer", category: "Engineering" },
    { label: "Aerospace Engineer", category: "Engineering" },
    { label: "Environmental Engineer", category: "Engineering" },
    { label: "Architect", category: "Engineering" },
    { label: "Landscape Architect", category: "Engineering" },
    { label: "Urban Planner", category: "Engineering" },

    // Education & Academia
    { label: "Teacher", category: "Education" },
    { label: "Primary School Teacher", category: "Education" },
    { label: "High School Teacher", category: "Education" },
    { label: "Lecturer", category: "Education" },
    { label: "Assistant Professor", category: "Education" },
    { label: "Professor", category: "Education" },
    { label: "School Administrator", category: "Education" },
    { label: "Academic Advisor", category: "Education" },
    { label: "Education Consultant", category: "Education" },
    { label: "Tutor", category: "Education" },

    // Marketing, Sales & PR
    { label: "Marketing Manager", category: "Marketing" },
    { label: "Brand Manager", category: "Marketing" },
    { label: "SEO Specialist", category: "Marketing" },
    { label: "Digital Marketer", category: "Marketing" },
    { label: "Social Media Manager", category: "Marketing" },
    { label: "Content Creator", category: "Marketing" },
    { label: "Copywriter", category: "Marketing" },
    { label: "Public Relations Specialist", category: "Marketing" },
    { label: "Communications Manager", category: "Marketing" },
    { label: "Sales Executive", category: "Marketing" },
    { label: "Account Manager", category: "Marketing" },
    { label: "Sales Manager", category: "Marketing" },
    { label: "Customer Success Manager", category: "Marketing" },

    // Media, Arts & Design
    { label: "Journalist", category: "Media" },
    { label: "Reporter", category: "Media" },
    { label: "Editor", category: "Media" },
    { label: "Graphic Designer", category: "Media" },
    { label: "Illustrator", category: "Media" },
    { label: "Photographer", category: "Media" },
    { label: "Videographer", category: "Media" },
    { label: "Video Editor", category: "Media" },
    { label: "Animator", category: "Media" },
    { label: "3D Artist", category: "Media" },
    { label: "Creative Director", category: "Media" },
    { label: "Fashion Designer", category: "Media" },

    // Legal & Compliance
    { label: "Lawyer", category: "Legal" },
    { label: "Attorney", category: "Legal" },
    { label: "Advocate", category: "Legal" },
    { label: "Legal Officer", category: "Legal" },
    { label: "Legal Assistant", category: "Legal" },
    { label: "Compliance Officer", category: "Legal" },
    { label: "Contract Specialist", category: "Legal" },
    { label: "Paralegal", category: "Legal" },

    // NGO, Research & Environment
    { label: "Program Officer", category: "NGO" },
    { label: "Project Officer", category: "NGO" },
    { label: "Communications Officer", category: "NGO" },
    { label: "Monitoring & Evaluation Officer", category: "NGO" },
    { label: "Fundraising Officer", category: "NGO" },
    { label: "Grant Writer", category: "NGO" },
    { label: "Research Assistant", category: "NGO" },
    { label: "Research Scientist", category: "NGO" },
    { label: "Environmental Scientist", category: "NGO" },
    { label: "Conservationist", category: "NGO" },

    // Logistics, Transport & Services
    { label: "Logistics Manager", category: "Logistics" },
    { label: "Logistics Coordinator", category: "Logistics" },
    { label: "Supply Chain Analyst", category: "Logistics" },
    { label: "Procurement Officer", category: "Logistics" },
    { label: "Warehouse Supervisor", category: "Logistics" },
    { label: "Fleet Manager", category: "Logistics" },
    { label: "Chef", category: "Logistics" },
    { label: "Sous Chef", category: "Logistics" },
    { label: "Hotel Manager", category: "Logistics" },
    { label: "Receptionist", category: "Logistics" },
    { label: "Customer Service Representative", category: "Logistics" },
    { label: "HR Generalist", category: "Logistics" },
    { label: "HR Manager", category: "Logistics" },
    { label: "Recruiter", category: "Logistics" },
    { label: "Talent Acquisition Specialist", category: "Logistics" },
    { label: "Agronomist", category: "Logistics" },
    { label: "Veterinarian", category: "Logistics" },
    { label: "Farm Manager", category: "Logistics" }
];

// 2. COMPREHENSIVE LIST OF INDUSTRIES (Alphabetical)
const INDUSTRIES = [
    "Advertising",
    "Aerospace",
    "Agriculture",
    "Artificial Intelligence",
    "Architecture",
    "Automotive",
    "Aviation",
    "Banking",
    "Beauty",
    "Biotechnology",
    "Cloud Computing",
    "Consumer Goods",
    "Consulting",
    "Construction",
    "Cosmetics",
    "Cybersecurity",
    "Defence",
    "Design",
    "E-commerce",
    "E-learning",
    "Education",
    "Energy",
    "Engineering",
    "Entertainment",
    "Environmental Services",
    "Event Management",
    "Fashion",
    "Film",
    "Finance",
    "Financial Services",
    "FinTech",
    "Food Production",
    "Government",
    "Healthcare",
    "Higher Education",
    "Hospitality",
    "Humanitarian Aid",
    "Information Technology",
    "Insurance",
    "International Development",
    "Journalism",
    "Legal Services",
    "Logistics",
    "Luxury Goods",
    "Manufacturing",
    "Manufacturing Technology",
    "Marketing",
    "Media",
    "Medical Devices",
    "Mining",
    "Music",
    "NGOs",
    "Oil & Gas",
    "Pharmaceuticals",
    "Printing",
    "Professional Services",
    "Public Administration",
    "Public Relations",
    "Publishing",
    "Real Estate",
    "Renewable Energy",
    "Research",
    "Restaurants",
    "Retail",
    "Security Services",
    "Shipping",
    "Software Development",
    "Space Technology",
    "Sports",
    "Supply Chain",
    "Telecommunications",
    "Television",
    "Textile",
    "Tourism",
    "Transportation",
    "Utilities",
    "Waste Management"
];

/**
 * Initializes a custom Searchable Dropdown.
 * @param {string} containerId - Container ID
 * @param {string} inputId - Text Input Element ID
 * @param {Array} items - Array of strings or objects {label, category}
 * @param {Object} options - Configuration overrides
 */
function initSearchableDropdown(containerId, inputId, items, options = {}) {
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    if (!container || !input) return;

    // Create unique IDs/classes for target dropdown parts
    const menuId = `${inputId}-dropdown-menu`;
    
    // Create menu list div if not exists
    let menu = container.querySelector('.dropdown-menu-list');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = menuId;
        menu.className = 'dropdown-menu-list';
        menu.style = `
            display: none; 
            position: absolute; 
            top: 100%; 
            left: 0; 
            right: 0; 
            background: var(--surface, #ffffff); 
            border: 1px solid var(--border-color, #e0e0e0); 
            border-radius: 12px; 
            max-height: 250px; 
            overflow-y: auto; 
            z-index: 1000; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.08); 
            margin-top: 4px;
        `;
        container.appendChild(menu);
    }

    // Input autocomplete reset
    input.setAttribute('autocomplete', 'off');

    // Create a hidden input to store the raw value if specified
    const hiddenInputId = options.hiddenInputId || `${inputId}-hidden`;
    let hiddenInput = document.getElementById(hiddenInputId);
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = hiddenInputId;
        hiddenInput.name = input.name || inputId;
        input.removeAttribute('name'); // Prevent submitting text field
        container.appendChild(hiddenInput);
    }

    let activeIndex = -1;
    let filteredItems = [];

    // Render list items based on filter query
    function render(query = '') {
        menu.innerHTML = '';
        activeIndex = -1;
        
        const q = query.toLowerCase().trim();
        
        // Filter elements
        filteredItems = items.filter(item => {
            const label = typeof item === 'string' ? item : item.label;
            return label.toLowerCase().includes(q);
        });

        if (filteredItems.length === 0) {
            menu.innerHTML = `<div style="padding: 12px; font-size: 0.85rem; color: var(--text-muted, #888); text-align: center;">No matches found</div>`;
            return;
        }

        // Group by category if requested and objects have them
        let currentCategory = '';
        filteredItems.forEach((item, index) => {
            const label = typeof item === 'string' ? item : item.label;
            const category = typeof item === 'string' ? null : item.category;

            if (options.groupByCategory && category && category !== currentCategory) {
                currentCategory = category;
                const header = document.createElement('div');
                header.style = `
                    padding: 8px 12px 4px 12px; 
                    font-size: 0.72rem; 
                    font-weight: 700; 
                    text-transform: uppercase; 
                    color: var(--primary, #004AC6); 
                    background: var(--surface-low, #f8f9fa);
                    letter-spacing: 0.05em;
                `;
                header.textContent = currentCategory;
                menu.appendChild(header);
            }

            const optionEl = document.createElement('div');
            optionEl.className = 'dropdown-option-item';
            optionEl.style = `
                padding: 10px 16px; 
                font-size: 0.88rem; 
                color: var(--text-color, #333); 
                cursor: pointer;
                transition: background 0.15s ease;
            `;
            optionEl.textContent = label;
            optionEl.dataset.index = index;

            optionEl.addEventListener('mouseenter', () => {
                highlightIndex(index);
            });

            optionEl.addEventListener('click', () => {
                selectItem(item);
            });

            menu.appendChild(optionEl);
        });
    }

    function highlightIndex(index) {
        const optionItems = menu.querySelectorAll('.dropdown-option-item');
        optionItems.forEach(el => {
            el.style.background = 'transparent';
            el.style.color = 'var(--text-color, #333)';
        });

        if (index >= 0 && index < optionItems.length) {
            const activeEl = optionItems[index];
            activeEl.style.background = 'var(--primary-container, #eef4ff)';
            activeEl.style.color = 'var(--primary, #004AC6)';
            activeIndex = index;
            // Scroll to view if needed
            activeEl.scrollIntoView({ block: 'nearest' });
        }
    }

    function selectItem(item) {
        const label = typeof item === 'string' ? item : item.label;
        input.value = label;
        hiddenInput.value = label;
        hideMenu();
        if (typeof options.onSelect === 'function') {
            options.onSelect(label);
        }
    }

    function showMenu() {
        // Toggle arrow icon if exists
        const arrow = container.querySelector('.dropdown-arrow');
        if (arrow) arrow.style.transform = 'translateY(-50%) rotate(180deg)';

        menu.style.display = 'block';
        render(input.value);
    }

    function hideMenu() {
        const arrow = container.querySelector('.dropdown-arrow');
        if (arrow) arrow.style.transform = 'translateY(-50%) rotate(0deg)';

        menu.style.display = 'none';
    }

    // Input handlers
    input.addEventListener('focus', () => {
        showMenu();
    });

    input.addEventListener('input', () => {
        showMenu();
        // Clear hidden input if text doesn't exactly match a selected item
        const match = items.find(item => {
            const label = typeof item === 'string' ? item : item.label;
            return label.toLowerCase() === input.value.toLowerCase();
        });
        hiddenInput.value = match ? (typeof match === 'string' ? match : match.label) : '';
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        if (menu.style.display === 'none') {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                showMenu();
                e.preventDefault();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            let nextIndex = activeIndex + 1;
            if (nextIndex >= filteredItems.length) nextIndex = 0;
            highlightIndex(nextIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            let prevIndex = activeIndex - 1;
            if (prevIndex < 0) prevIndex = filteredItems.length - 1;
            highlightIndex(prevIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < filteredItems.length) {
                selectItem(filteredItems[activeIndex]);
            } else if (filteredItems.length > 0) {
                selectItem(filteredItems[0]); // fallback to select first matching
            }
        } else if (e.key === 'Escape') {
            hideMenu();
            input.blur();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            hideMenu();
        }
    });
}

// Expose globally
window.OCCUPATIONS = OCCUPATIONS;
window.INDUSTRIES = INDUSTRIES;
window.initSearchableDropdown = initSearchableDropdown;
