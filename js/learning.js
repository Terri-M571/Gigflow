/* ==========================================================================
   GIGFLOW - LEARNING HUB DYNAMICS (learning.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Session Safeguard
    if (typeof checkSession === 'function') checkSession();

    loadLearningData();
});

async function loadLearningData() {
    const roadmapContainer = document.getElementById('learning-roadmap-container');
    const coursesList = document.getElementById('learning-courses-list');

    if (roadmapContainer) {
        roadmapContainer.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--text-muted);">
                <span class="material-symbols-outlined spinner" style="font-size: 2rem; color: var(--primary);">refresh</span>
                <p style="margin-top: 12px;">AI is analyzing your profile to generate a personalized learning roadmap...</p>
            </div>
        `;
    }

    try {
        const response = await fetch(`${BASE_URL}/ai/learning/roadmap`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('gigflow_token')}`
            }
        });
        
        const resData = await response.json();
        if (resData.success && resData.learningData) {
            const data = resData.learningData;

            if (roadmapContainer) {
                roadmapContainer.innerHTML = `
                    <h3 style="font-size: 1.1rem; margin-bottom: 16px;">Target Career Roadmap</h3>
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                        <div>
                            <h4 style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">${data.roadmap.title}</h4>
                            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0;">Next target milestone: <b>${data.roadmap.checkpoint}</b></p>
                        </div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: var(--secondary);">${data.roadmap.progress || 0}% Done</div>
                    </div>
                    <!-- Progress Line -->
                    <div class="progress-bar-container" style="background-color: var(--surface-low); height: 8px; border-radius: 4px; overflow: hidden; margin-top: 16px;">
                        <div class="progress-bar-fill" style="width: ${data.roadmap.progress || 0}%; background-color: var(--primary); height: 100%;"></div>
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
                                <span>${course.progress || 0}%</span>
                            </div>
                            <div class="progress-bar-container" style="background-color: var(--surface-low); height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 16px;">
                                <div class="progress-bar-fill" style="width: ${course.progress || 0}%; background-color: ${course.color}; height: 100%;"></div>
                            </div>
                            <button class="btn ${course.tagClass === 'badge-primary' ? 'btn-primary' : 'btn-secondary'} w-full" style="font-size: 0.8rem; padding: 8px 0;" onclick="showToast('Loading course workspace...', 'success')">Resume Learning</button>
                        </div>
                    `;
                });
            }
        } else {
            showToast("Failed to load learning roadmap", "error");
        }
    } catch (e) {
        console.error(e);
        showToast("Error generating learning roadmap", "error");
    }
}
