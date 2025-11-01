// Sample challenges data
const challenges = [
    {
        id: 1,
        name: "Desert Trail Challenge",
        miles: 50,
        daysLeft: 14,
        participants: 234,
        progress: 65,
        description: "Complete 50 virtual miles through scenic desert trails. Support wildlife conservation."
    },
    {
        id: 2,
        name: "Mountain Quest 2025",
        miles: 100,
        daysLeft: 30,
        participants: 567,
        progress: 42,
        description: "Epic 100-mile mountain challenge. Raise funds for rural healthcare."
    },
    {
        id: 3,
        name: "Urban Trail Sprint",
        miles: 25,
        daysLeft: 7,
        participants: 189,
        progress: 85,
        description: "Quick 25-mile city trail challenge. Perfect for beginners!"
    },
    {
        id: 4,
        name: "Coast to Coast Marathon",
        miles: 150,
        daysLeft: 60,
        participants: 432,
        progress: 28,
        description: "Ultimate 150-mile challenge across beautiful coastlines."
    }
];

// Load challenges on page load
document.addEventListener('DOMContentLoaded', loadChallenges);

function loadChallenges() {
    const container = document.getElementById('challengesContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    challenges.forEach(challenge => {
        const card = document.createElement('div');
        card.className = 'challenge-card';
        card.innerHTML = `
            <div class="challenge-header">
                <h3>${challenge.name}</h3>
                <p style="font-size: 0.9rem;">⏱️ ${challenge.daysLeft} days left</p>
            </div>
            <div class="challenge-body">
                <div class="challenge-description">
                    ${challenge.description}
                </div>
                <div class="challenge-info">
                    <span>📍 ${challenge.miles} miles</span>
                    <span>👥 ${challenge.participants} hikers</span>
                </div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar" style="width: ${challenge.progress}%"></div>
                </div>
                <p style="font-size: 0.85rem; color: #999; margin-bottom: 1rem;">
                    ${challenge.progress}% complete
                </p>
                <button class="btn-join">Join Challenge</button>
            </div>
        `;
        container.appendChild(card);
    });
}
