/* ==========================================================================
   GIGFLOW - LEARNING HUB DYNAMICS (learning.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Session Safeguard
    if (typeof checkSession === 'function') checkSession();

    loadLearningData();
});

const industryData = {
    "Software Engineering": {
        roadmap: {
            title: "Senior Software Engineer Roadmap",
            checkpoint: "System Design Patterns",
            progress: 45
        },
        courses: [
            {
                tag: "Architecture",
                tagClass: "badge-primary",
                title: "Scalable Microservices with Node.js",
                instructor: "Alex Chen • Lead Engineer",
                progress: 60,
                color: "var(--primary)"
            },
            {
                tag: "Frontend",
                tagClass: "badge-secondary",
                title: "Advanced React & State Management",
                instructor: "Sarah Jenkins • UI Architect",
                progress: 25,
                color: "var(--secondary)"
            }
        ]
    },
    "Product Design": {
        roadmap: {
            title: "Lead Product Designer Roadmap",
            checkpoint: "Framer Micro-interactions",
            progress: 60
        },
        courses: [
            {
                tag: "UI/UX Design",
                tagClass: "badge-primary",
                title: "Next-Generation Design Systems",
                instructor: "Elena Rostova • Figma Expert",
                progress: 65,
                color: "var(--primary)"
            },
            {
                tag: "Prototyping",
                tagClass: "badge-secondary",
                title: "Advanced Framer Animations",
                instructor: "Marcus Vance • UX Director",
                progress: 30,
                color: "var(--secondary)"
            }
        ]
    },
    "Data Science": {
        roadmap: {
            title: "Senior Data Scientist Roadmap",
            checkpoint: "Advanced Machine Learning Models",
            progress: 35
        },
        courses: [
            {
                tag: "Machine Learning",
                tagClass: "badge-primary",
                title: "Predictive Modeling with Python",
                instructor: "Dr. Emily Turing • Data Scientist",
                progress: 80,
                color: "var(--primary)"
            },
            {
                tag: "Data Viz",
                tagClass: "badge-secondary",
                title: "Interactive Dashboards in D3.js",
                instructor: "James Data • Viz Expert",
                progress: 10,
                color: "var(--secondary)"
            }
        ]
    },
    "Digital Marketing": {
        roadmap: {
            title: "Growth Marketing Lead Roadmap",
            checkpoint: "AI-Driven Campaign Automation",
            progress: 50
        },
        courses: [
            {
                tag: "Growth",
                tagClass: "badge-primary",
                title: "Conversion Rate Optimization Strategies",
                instructor: "Mia Growth • Marketing VP",
                progress: 40,
                color: "var(--primary)"
            },
            {
                tag: "Analytics",
                tagClass: "badge-secondary",
                title: "Advanced GA4 & Tag Manager",
                instructor: "Tom Analytics • Data Analyst",
                progress: 75,
                color: "var(--secondary)"
            }
        ]
    },
    "Business Management": {
        roadmap: {
            title: "Executive Leadership Roadmap",
            checkpoint: "Agile Scaling Strategies",
            progress: 20
        },
        courses: [
            {
                tag: "Leadership",
                tagClass: "badge-primary",
                title: "Leading Cross-Functional Teams",
                instructor: "Robert CEO • Executive Coach",
                progress: 90,
                color: "var(--primary)"
            },
            {
                tag: "Operations",
                tagClass: "badge-secondary",
                title: "Scaling Agile Methodologies",
                instructor: "Linda Agile • Scrum Master",
                progress: 5,
                color: "var(--secondary)"
            }
        ]
    }
};

function loadLearningData() {
    const userIndustry = window.currentUser?.industry || "Software Engineering"; // default fallback
    
    // Fallback if industry not in database
    const data = industryData[userIndustry] || industryData["Software Engineering"];

    const roadmapContainer = document.getElementById('learning-roadmap-container');
    const coursesList = document.getElementById('learning-courses-list');

    if (roadmapContainer) {
        roadmapContainer.innerHTML = `
            <h3 style="font-size: 1.1rem; margin-bottom: 16px;">Target Career Roadmap</h3>
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${data.roadmap.title}</h4>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0;">Next target milestone: <b>${data.roadmap.checkpoint}</b></p>
                </div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--secondary);">${data.roadmap.progress}% Done</div>
            </div>
            <!-- Progress Line -->
            <div class="progress-bar-container" style="background-color: var(--surface-low); height: 8px; border-radius: 4px; overflow: hidden; margin-top: 16px;">
                <div class="progress-bar-fill" style="width: ${data.roadmap.progress}%; background-color: var(--primary); height: 100%;"></div>
            </div>
        `;
    }

    if (coursesList) {
        coursesList.innerHTML = '';
        data.courses.forEach(course => {
            coursesList.innerHTML += `
                <div class="card hover-lift" style="padding: 20px;">
                    <span class="badge ${course.tagClass}" style="margin-bottom: 12px;">${course.tag}</span>
                    <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 4px;">${course.title}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">${course.instructor}</p>
                    
                    <div class="flex-between" style="font-size: 0.8rem; font-weight: 700; margin-bottom: 6px;">
                        <span>Progress</span>
                        <span>${course.progress}%</span>
                    </div>
                    <div class="progress-bar-container" style="background-color: var(--surface-low); height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 16px;">
                        <div class="progress-bar-fill" style="width: ${course.progress}%; background-color: ${course.color}; height: 100%;"></div>
                    </div>
                    <button class="btn ${course.tagClass === 'badge-primary' ? 'btn-primary' : 'btn-secondary'} w-full" style="font-size: 0.8rem; padding: 8px 0;" onclick="showToast('Loading course workspace...', 'success')">Resume Learning</button>
                </div>
            `;
        });
    }
}
