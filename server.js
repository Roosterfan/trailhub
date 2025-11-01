const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Sample challenges database
const challenges = [
    {
        id: 1,
        name: "Desert Trail Challenge",
        km: 80,
        daysLeft: 14,
        participants: 234,
        progress: 65,
        description: "Complete 80km virtual hike through scenic desert trails. Support wildlife conservation.",
        cause: "Wildlife Conservation"
    },
    {
        id: 2,
        name: "Mountain Quest 2025",
        km: 160,
        daysLeft: 30,
        participants: 567,
        progress: 42,
        description: "Epic 160km mountain challenge. Raise funds for rural healthcare.",
        cause: "Rural Healthcare"
    },
    {
        id: 3,
        name: "Urban Trail Sprint",
        km: 40,
        daysLeft: 7,
        participants: 189,
        progress: 85,
        description: "Quick 40km city trail challenge. Perfect for beginners!",
        cause: "Community Health"
    },
    {
        id: 4,
        name: "Coast to Coast Marathon",
        km: 240,
        daysLeft: 60,
        participants: 432,
        progress: 28,
        description: "Ultimate 240km challenge across beautiful coastlines.",
        cause: "Ocean Conservation"
    }
];

// 🎯 API ENDPOINTS

// GET all challenges
app.get('/api/challenges', (req, res) => {
    res.json({
        success: true,
        data: challenges
    });
});

// GET specific challenge by ID
app.get('/api/challenges/:id', (req, res) => {
    const challenge = challenges.find(c => c.id === parseInt(req.params.id));
    if (!challenge) {
        return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    res.json({ success: true, data: challenge });
});

// GET platform statistics
app.get('/api/stats', (req, res) => {
    const totalHikers = challenges.reduce((sum, c) => sum + c.participants, 0);
    const totalKm = challenges.reduce((sum, c) => sum + c.km, 0);
    
    res.json({
        success: true,
        data: {
            activeHikers: 5000,
            totalKilometres: 200000,
            charityRaised: 250000,
            totalChallenges: challenges.length,
            totalParticipants: totalHikers
        }
    });
});

// POST join challenge
app.post('/api/challenges/:id/join', (req, res) => {
    const challenge = challenges.find(c => c.id === parseInt(req.params.id));
    if (!challenge) {
        return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    
    res.json({
        success: true,
        message: `You've joined ${challenge.name}!`,
        data: challenge
    });
});

// GET leaderboard
app.get('/api/leaderboard', (req, res) => {
    const leaderboard = [
        { rank: 1, name: "Alex Trail", kilometres: 450, challenges: 5 },
        { rank: 2, name: "Jordan Summit", kilometres: 380, challenges: 4 },
        { rank: 3, name: "Casey Adventure", kilometres: 320, challenges: 3 },
        { rank: 4, name: "Morgan Peak", kilometres: 280, challenges: 3 },
        { rank: 5, name: "Riley Challenge", kilometres: 240, challenges: 2 }
    ];
    
    res.json({
        success: true,
        data: leaderboard
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'TrailHub API is running! 🥾' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🥾 TrailHub Backend Server Running!`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`\n✅ API Endpoints Ready:`);
    console.log(`   GET  /api/challenges`);
    console.log(`   GET  /api/challenges/:id`);
    console.log(`   POST /api/challenges/:id/join`);
    console.log(`   GET  /api/stats`);
    console.log(`   GET  /api/leaderboard`);
    console.log(`   GET  /api/health\n`);
});
