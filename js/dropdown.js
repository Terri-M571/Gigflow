/* ==========================================================================
   GIGFLOW - SEARCHABLE TYPEAHEAD DROPDOWN WIDGET (dropdown.js)
   ========================================================================== */

// 1. COMPREHENSIVE LIST OF OCCUPATIONS (200+)
const OCCUPATIONS = [
    { label: "3D Artist", category: "Media" },
    { label: "Academic Advisor", category: "Education" },
    { label: "Account Manager", category: "Marketing" },
    { label: "Accountant", category: "Finance" },
    { label: "Actor", category: "Other" },
    { label: "Actuary", category: "Finance" },
    { label: "Administrative Assistant", category: "Business" },
    { label: "Advocate", category: "Legal" },
    { label: "Aerospace Engineer", category: "Engineering" },
    { label: "Agile Coach", category: "Technology" },
    { label: "Agile Coach", category: "Other" },
    { label: "Agronomist", category: "Logistics" },
    { label: "AI Engineer", category: "Technology" },
    { label: "Air Traffic Controller", category: "Other" },
    { label: "Aircraft Mechanic", category: "Other" },
    { label: "Android Developer", category: "Technology" },
    { label: "Animator", category: "Media" },
    { label: "Arbitrator", category: "Other" },
    { label: "Architect", category: "Engineering" },
    { label: "Archivist", category: "Other" },
    { label: "Art Conservator", category: "Other" },
    { label: "Art Director", category: "Other" },
    { label: "Assistant Professor", category: "Education" },
    { label: "Astronomer", category: "Other" },
    { label: "Athletic Trainer", category: "Other" },
    { label: "Attorney", category: "Legal" },
    { label: "Auditor", category: "Finance" },
    { label: "Automation QA Engineer", category: "Technology" },
    { label: "Avionics Technician", category: "Other" },
    { label: "Backend Developer", category: "Technology" },
    { label: "Banker", category: "Finance" },
    { label: "Biomedical Engineer", category: "Engineering" },
    { label: "Biomedical Scientist", category: "Other" },
    { label: "Biotechnologist", category: "Healthcare" },
    { label: "Blockchain Developer", category: "Other" },
    { label: "Botanist", category: "Other" },
    { label: "Brand Manager", category: "Marketing" },
    { label: "Business Analyst", category: "Business" },
    { label: "Business Development Executive", category: "Other" },
    { label: "Business Development Manager", category: "Business" },
    { label: "Carpenter", category: "Other" },
    { label: "Chartered Accountant", category: "Finance" },
    { label: "Chef", category: "Logistics" },
    { label: "Chemical Engineer", category: "Engineering" },
    { label: "Chief Executive Officer (CEO)", category: "Other" },
    { label: "Chief Financial Officer (CFO)", category: "Other" },
    { label: "Chief Marketing Officer (CMO)", category: "Other" },
    { label: "Chief Operating Officer (COO)", category: "Other" },
    { label: "Chief Technology Officer (CTO)", category: "Other" },
    { label: "Choreographer", category: "Other" },
    { label: "Civil Engineer", category: "Engineering" },
    { label: "Claims Adjuster", category: "Other" },
    { label: "Clinical Officer", category: "Healthcare" },
    { label: "Clinical Research Coordinator", category: "Healthcare" },
    { label: "Cloud Architect", category: "Technology" },
    { label: "Cloud Engineer", category: "Technology" },
    { label: "Communications Manager", category: "Marketing" },
    { label: "Communications Officer", category: "NGO" },
    { label: "Community Health Worker", category: "Other" },
    { label: "Compliance Analyst", category: "Other" },
    { label: "Compliance Officer", category: "Legal" },
    { label: "Composer", category: "Other" },
    { label: "Computer Vision Engineer", category: "Technology" },
    { label: "Conservationist", category: "NGO" },
    { label: "Content Creator", category: "Marketing" },
    { label: "Contract Specialist", category: "Legal" },
    { label: "Copy Editor", category: "Other" },
    { label: "Copywriter", category: "Marketing" },
    { label: "Creative Director", category: "Media" },
    { label: "Curriculum Developer", category: "Other" },
    { label: "Customer Service Representative", category: "Logistics" },
    { label: "Customer Success Manager", category: "Marketing" },
    { label: "Customer Support Specialist", category: "Other" },
    { label: "Cybersecurity Analyst", category: "Technology" },
    { label: "Cybersecurity Engineer", category: "Technology" },
    { label: "Dancer", category: "Other" },
    { label: "Data Analyst", category: "Technology" },
    { label: "Data Engineer", category: "Technology" },
    { label: "Data Protection Officer", category: "Other" },
    { label: "Data Scientist", category: "Technology" },
    { label: "Database Administrator", category: "Technology" },
    { label: "Dean", category: "Other" },
    { label: "Delivery Manager", category: "Other" },
    { label: "Dental Hygienist", category: "Healthcare" },
    { label: "Dentist", category: "Healthcare" },
    { label: "Detective", category: "Other" },
    { label: "DevOps Engineer", category: "Technology" },
    { label: "Dietitian", category: "Other" },
    { label: "Digital Marketer", category: "Marketing" },
    { label: "Digital Marketing Specialist", category: "Other" },
    { label: "Diplomat", category: "Other" },
    { label: "Dispatcher", category: "Other" },
    { label: "Doctor", category: "Healthcare" },
    { label: "Ecologist", category: "Other" },
    { label: "Economist", category: "Finance" },
    { label: "Editor", category: "Media" },
    { label: "Education Consultant", category: "Education" },
    { label: "Electrical Engineer", category: "Engineering" },
    { label: "Electrician", category: "Other" },
    { label: "Embedded Systems Engineer", category: "Other" },
    { label: "Emergency Medical Technician (EMT)", category: "Other" },
    { label: "Environmental Engineer", category: "Engineering" },
    { label: "Environmental Scientist", category: "NGO" },
    { label: "Epidemiologist", category: "Other" },
    { label: "Event Coordinator", category: "Other" },
    { label: "Event Planner", category: "Other" },
    { label: "Executive Assistant", category: "Business" },
    { label: "Farm Manager", category: "Logistics" },
    { label: "Fashion Designer", category: "Media" },
    { label: "Finance Manager", category: "Finance" },
    { label: "Financial Analyst", category: "Finance" },
    { label: "Firefighter", category: "Other" },
    { label: "Fitness Instructor", category: "Other" },
    { label: "Fleet Manager", category: "Logistics" },
    { label: "Flight Attendant", category: "Logistics" },
    { label: "Flight Instructor", category: "Other" },
    { label: "Foreign Service Officer", category: "Other" },
    { label: "Frontend Developer", category: "Technology" },
    { label: "Full Stack Developer", category: "Technology" },
    { label: "Fundraising Officer", category: "NGO" },
    { label: "Game Designer", category: "Other" },
    { label: "Game Developer", category: "Other" },
    { label: "General Practitioner", category: "Healthcare" },
    { label: "Geologist", category: "Other" },
    { label: "Geophysicist", category: "Other" },
    { label: "Grant Writer", category: "NGO" },
    { label: "Graphic Designer", category: "Media" },
    { label: "Hardware Engineer", category: "Other" },
    { label: "Help Desk Technician", category: "Other" },
    { label: "High School Teacher", category: "Education" },
    { label: "Hotel Manager", category: "Logistics" },
    { label: "HR Generalist", category: "Logistics" },
    { label: "Human Resource Manager", category: "Logistics" },
    { label: "HVAC Technician", category: "Other" },
    { label: "Illustrator", category: "Media" },
    { label: "Industrial Engineer", category: "Engineering" },
    { label: "Information Security Consultant", category: "Other" },
    { label: "Information Security Manager", category: "Technology" },
    { label: "Instructional Designer", category: "Other" },
    { label: "Insurance Broker", category: "Other" },
    { label: "Interaction Designer", category: "Technology" },
    { label: "Internal Auditor", category: "Finance" },
    { label: "Interpreter", category: "Other" },
    { label: "Inventory Manager", category: "Other" },
    { label: "Investment Analyst", category: "Finance" },
    { label: "Investment Banker", category: "Finance" },
    { label: "iOS Developer", category: "Technology" },
    { label: "IT Consultant", category: "Technology" },
    { label: "Journalist", category: "Media" },
    { label: "Judge", category: "Other" },
    { label: "Key Account Manager", category: "Other" },
    { label: "Laboratory Technician", category: "Healthcare" },
    { label: "Landscape Architect", category: "Engineering" },
    { label: "Lawyer", category: "Legal" },
    { label: "Lecturer", category: "Education" },
    { label: "Legal Assistant", category: "Legal" },
    { label: "Legal Officer", category: "Legal" },
    { label: "Librarian", category: "Other" },
    { label: "Loan Officer", category: "Finance" },
    { label: "Logistics Coordinator", category: "Logistics" },
    { label: "Logistics Manager", category: "Logistics" },
    { label: "Machine Learning Engineer", category: "Technology" },
    { label: "Machinist", category: "Other" },
    { label: "Magistrate", category: "Other" },
    { label: "Management Consultant", category: "Business" },
    { label: "Marine Biologist", category: "Other" },
    { label: "Marine Engineer", category: "Other" },
    { label: "Market Research Analyst", category: "Other" },
    { label: "Marketing Manager", category: "Marketing" },
    { label: "Massage Therapist", category: "Other" },
    { label: "Materials Engineer", category: "Engineering" },
    { label: "Mechanical Engineer", category: "Engineering" },
    { label: "Mediator", category: "Other" },
    { label: "Medical Lab Scientist", category: "Healthcare" },
    { label: "Merchandiser", category: "Other" },
    { label: "Meteorologist", category: "Other" },
    { label: "Mobile Developer", category: "Technology" },
    { label: "Monitoring & Evaluation Officer", category: "NGO" },
    { label: "Museum Curator", category: "Other" },
    { label: "Musician", category: "Other" },
    { label: "Naval Architect", category: "Other" },
    { label: "Network Engineer", category: "Technology" },
    { label: "NLP Engineer", category: "Technology" },
    { label: "Nuclear Engineer", category: "Other" },
    { label: "Nurse", category: "Healthcare" },
    { label: "Nurse Practitioner", category: "Healthcare" },
    { label: "Nutritionist", category: "Other" },
    { label: "Occupational Therapist", category: "Healthcare" },
    { label: "Office Administrator", category: "Business" },
    { label: "Office Manager", category: "Business" },
    { label: "Operations Coordinator", category: "Business" },
    { label: "Operations Manager", category: "Business" },
    { label: "Paralegal", category: "Legal" },
    { label: "Paramedic", category: "Other" },
    { label: "Patent Attorney", category: "Other" },
    { label: "Pediatrician", category: "Healthcare" },
    { label: "Personal Trainer", category: "Other" },
    { label: "Petroleum Engineer", category: "Other" },
    { label: "Pharmacist", category: "Healthcare" },
    { label: "Pharmacy Assistant", category: "Healthcare" },
    { label: "Photographer", category: "Media" },
    { label: "Physical Therapist", category: "Other" },
    { label: "Physiotherapist", category: "Healthcare" },
    { label: "Pilot", category: "Logistics" },
    { label: "Plumber", category: "Other" },
    { label: "Police Officer", category: "Other" },
    { label: "Policy Analyst", category: "Other" },
    { label: "Portfolio Manager", category: "Finance" },
    { label: "Primary School Teacher", category: "Education" },
    { label: "Privacy Analyst", category: "Other" },
    { label: "Procurement Officer", category: "Logistics" },
    { label: "Product Designer", category: "Technology" },
    { label: "Product Manager", category: "Technology" },
    { label: "Professor", category: "Education" },
    { label: "Program Manager", category: "Business" },
    { label: "Program Officer", category: "NGO" },
    { label: "Project Manager", category: "Business" },
    { label: "Project Officer", category: "NGO" },
    { label: "Property Manager", category: "Other" },
    { label: "Provost", category: "Other" },
    { label: "Psychiatrist", category: "Healthcare" },
    { label: "Public Health Specialist", category: "Other" },
    { label: "Public Relations Specialist", category: "Marketing" },
    { label: "QA Engineer", category: "Technology" },
    { label: "Quantitative Analyst", category: "Other" },
    { label: "Quantity Surveyor", category: "Engineering" },
    { label: "Radiologic Technologist", category: "Other" },
    { label: "Real Estate Agent", category: "Other" },
    { label: "Real Estate Broker", category: "Other" },
    { label: "Receptionist", category: "Logistics" },
    { label: "Recruiter", category: "Logistics" },
    { label: "Registered Nurse", category: "Healthcare" },
    { label: "Release Manager", category: "Other" },
    { label: "Reporter", category: "Media" },
    { label: "Research Assistant", category: "NGO" },
    { label: "Research Scientist", category: "NGO" },
    { label: "Retail Buyer", category: "Other" },
    { label: "Risk Analyst", category: "Finance" },
    { label: "Sales Engineer", category: "Other" },
    { label: "Sales Executive", category: "Marketing" },
    { label: "Sales Manager", category: "Marketing" },
    { label: "Sales Representative", category: "Other" },
    { label: "School Administrator", category: "Education" },
    { label: "Scrum Master", category: "Technology" },
    { label: "Scrum Master", category: "Other" },
    { label: "SEM Specialist", category: "Other" },
    { label: "SEO Specialist", category: "Marketing" },
    { label: "SEO Specialist", category: "Other" },
    { label: "Site Reliability Engineer", category: "Technology" },
    { label: "Smart Contract Engineer", category: "Other" },
    { label: "Social Media Manager", category: "Marketing" },
    { label: "Social Worker", category: "Other" },
    { label: "Software Engineer", category: "Technology" },
    { label: "Solutions Architect", category: "Technology" },
    { label: "Sonographer", category: "Other" },
    { label: "Sous Chef", category: "Logistics" },
    { label: "Special Education Teacher", category: "Other" },
    { label: "Store Manager", category: "Other" },
    { label: "Strategy Manager", category: "Business" },
    { label: "Structural Engineer", category: "Engineering" },
    { label: "Supply Chain Analyst", category: "Other" },
    { label: "Supply Chain Manager", category: "Logistics" },
    { label: "Surgeon", category: "Healthcare" },
    { label: "Systems Administrator", category: "Technology" },
    { label: "Talent Acquisition Specialist", category: "Logistics" },
    { label: "Tax Specialist", category: "Finance" },
    { label: "Teacher", category: "Education" },
    { label: "Technical Product Manager", category: "Technology" },
    { label: "Technical Support Engineer", category: "Other" },
    { label: "Technical Writer", category: "Other" },
    { label: "Translator", category: "Other" },
    { label: "Transport Planner", category: "Other" },
    { label: "Tutor", category: "Education" },
    { label: "UI Designer", category: "Technology" },
    { label: "UI/UX Designer", category: "Technology" },
    { label: "Underwriter", category: "Other" },
    { label: "Urban Planner", category: "Engineering" },
    { label: "UX Designer", category: "Technology" },
    { label: "Veterinarian", category: "Logistics" },
    { label: "Video Editor", category: "Media" },
    { label: "Videographer", category: "Media" },
    { label: "Visual Designer", category: "Technology" },
    { label: "Visual Merchandiser", category: "Other" },
    { label: "Warehouse Supervisor", category: "Logistics" },
    { label: "Welder", category: "Other" },
    { label: "Zoologist", category: "Other" },
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
