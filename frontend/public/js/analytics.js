/* ==========================================================================
   GIGFLOW - ANALYTICS CHARTS GENERATOR (analytics.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    renderAnalyticsCharts();
});

function renderAnalyticsCharts() {
    // 1. Applications Bar Chart
    const appsBarContainer = document.getElementById('analytics-bar-chart');
    if (appsBarContainer) {
        const monthlyData = [
            { label: 'Jan', value: 8 },
            { label: 'Feb', value: 14 },
            { label: 'Mar', value: 18 },
            { label: 'Apr', value: 12 },
            { label: 'May', value: 24 },
            { label: 'Jun', value: 19 }
        ];

        appsBarContainer.innerHTML = '';
        const maxValue = Math.max(...monthlyData.map(d => d.value));

        monthlyData.forEach(data => {
            const pct = (data.value / maxValue) * 100;
            appsBarContainer.innerHTML += `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar-fill" style="height: ${pct}%;" data-value="${data.value}"></div>
                    <span class="chart-bar-label">${data.label}</span>
                </div>
            `;
        });
    }

    // 2. Earnings Line Chart (SVG Dynamic Path)
    const earningsLineContainer = document.getElementById('analytics-line-chart');
    if (earningsLineContainer) {
        const earningsData = [
            { label: 'W1', value: 800 },
            { label: 'W2', value: 1200 },
            { label: 'W3', value: 950 },
            { label: 'W4', value: 2200 },
            { label: 'W5', value: 1800 },
            { label: 'W6', value: 3200 }
        ];

        const width = earningsLineContainer.clientWidth || 500;
        const height = 220;
        const padding = 30;

        const maxVal = Math.max(...earningsData.map(d => d.value));
        const minVal = 0;

        // Generate points
        const points = earningsData.map((d, index) => {
            const x = padding + (index * (width - 2 * padding) / (earningsData.length - 1));
            const y = height - padding - ((d.value - minVal) * (height - 2 * padding) / (maxVal - minVal));
            return { x, y, label: d.label, val: d.value };
        });

        // Construct SVG string
        let svgString = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">`;
        
        // Add Grid lines
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i * (height - 2 * padding) / 4);
            const gridVal = Math.round(maxVal - (i * maxVal / 4));
            svgString += `
                <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--surface-container-highest)" stroke-width="1" stroke-dasharray="4,4"/>
                <text x="${padding - 8}" y="${y + 4}" fill="var(--text-muted)" font-size="10" font-weight="600" text-anchor="end">$${gridVal}</text>
            `;
        }

        // Draw Line Path
        const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        svgString += `<path d="${pathData}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

        // Draw Gradient Fill under line
        const areaPathData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
        svgString += `
            <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
                </linearGradient>
            </defs>
            <path d="${areaPathData}" fill="url(#chart-glow)"/>
        `;

        // Draw Data Points circles & X Labels
        points.forEach(p => {
            svgString += `
                <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--surface)" stroke="var(--primary)" stroke-width="3" style="cursor: pointer;" title="$${p.val}"/>
                <text x="${p.x}" y="${height - 10}" fill="var(--text-muted)" font-size="10" font-weight="600" text-anchor="middle">${p.label}</text>
            `;
        });

        svgString += `</svg>`;
        earningsLineContainer.innerHTML = svgString;
    }
}
