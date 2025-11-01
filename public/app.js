// Load challenges from API
document.addEventListener('DOMContentLoaded', loadChallengesFromAPI);

function loadChallengesFromAPI() {
    const container = document.getElementById('challengesContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading challenges...</div>';
    
    // Fetch from our backend API
    fetch('/api/challenges')
        .then(response => response.json())
        .then(result => {
            if (!result.success) throw new Error('Failed to load challenges');
            displayChallenges(result.data);
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<div class="loading" style="color: red;">Failed to load challenges</div>';
        });
}

function displayChallenges(challenges) {
    const container = document.getElementById('challengesContainer');
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
                    <span>📍 ${challenge.km}km</span>
                    <span>👥 ${challenge.participants} hikers</span>
                </div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar" style="width: ${challenge.progress}%"></div>
                </div>
                <p style="font-size: 0.85rem; color: #999; margin-bottom: 1rem;">
                    ${challenge.progress}% complete
                </p>
                <button class="btn-join" onclick="joinChallenge(${challenge.id})">Join Challenge</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Join a challenge
function joinChallenge(challengeId) {
    fetch(`/api/challenges/${challengeId}/join`, { method: 'POST' })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert(`✅ ${result.message}`);
            }
        })
        .catch(error => console.error('Error:', error));
}
