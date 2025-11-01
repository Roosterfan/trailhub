const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

const users = {};
const userChallenges = {};
const discussions = [];
const verificationQueue = [];

let challenges = [
  { id: 1, name: "5K Morning Walk", distance: 5, difficulty: "Easy", reward: 100, stepsTarget: 6250, createdBy: "System" },
  { id: 2, name: "10K Weekend Hike", distance: 10, difficulty: "Medium", reward: 250, stepsTarget: 12500, createdBy: "System" },
  { id: 3, name: "Mountain Peak Challenge", distance: 15, difficulty: "Hard", reward: 500, stepsTarget: 18750, createdBy: "System" }
];

let nextChallengeId = 4;
const ADMIN_PASSWORD = 'admin123';

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function kmToSteps(km) {
  return Math.round(km * 1250);
}

function stepsToKm(steps) {
  return (steps / 1250).toFixed(2);
}

// ======== AUTH ========
app.post('/api/signup', (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: '❌ Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '❌ Password must be at least 6 characters' });
  }
  if (users[email]) {
    return res.status(400).json({ error: '❌ Email already registered' });
  }

  users[email] = {
    name,
    password,
    verified: true,
    createdAt: new Date(),
    totalKm: 0,
    totalSteps: 0,
    points: 0,
    verifiedKm: 0,
    verificationBadges: 0,
    isAdmin: false
  };
  userChallenges[email] = {};

  res.json({ success: true, message: '✅ Account created! Login now.' });
});

app.post('/api/login', (req, res) => {
  const { email, password, adminPassword } = req.body;

  if (!users[email]) {
    return res.status(400).json({ error: '❌ Email not found' });
  }
  if (users[email].password !== password) {
    return res.status(400).json({ error: '❌ Wrong password' });
  }
  let isAdmin = !!(adminPassword && adminPassword === ADMIN_PASSWORD);
  users[email].isAdmin = isAdmin;

  res.json({
    success: true,
    user: {
      email,
      name: users[email].name,
      isAdmin,
      totalKm: users[email].totalKm || 0,
      totalSteps: users[email].totalSteps || 0,
      verifiedKm: users[email].verifiedKm || 0,
      verificationBadges: users[email].verificationBadges || 0
    }
  });
});

// ======== CHALLENGES ========
app.get('/api/challenges', (req, res) => {
  res.json({ challenges });
});

app.post('/api/challenges/create', (req, res) => {
  const { email, name, distance, difficulty, reward, adminPassword } = req.body;
  if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '❌ Only administrators can create challenges' });
  }
  if (!users[email]) {
    return res.status(400).json({ error: 'User not found' });
  }
  if (!name || !distance || !difficulty) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const parsedDistance = parseFloat(distance);
  const parsedReward = parseInt(reward) || 100;

  if (isNaN(parsedDistance) || parsedDistance <= 0) {
    return res.status(400).json({ error: 'Distance must be a positive number' });
  }

  const newChallenge = {
    id: nextChallengeId++,
    name: String(name).trim(),
    distance: parsedDistance,
    difficulty: String(difficulty).trim(),
    reward: parsedReward,
    stepsTarget: kmToSteps(parsedDistance),
    createdBy: users[email].name,
    createdAt: new Date()
  };

  challenges.push(newChallenge);
  res.json({ success: true, challenge: newChallenge });
});

app.post('/api/challenges/delete', (req, res) => {
  const { challengeId, adminPassword } = req.body;

  if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '❌ Admin access required' });
  }
  const index = challenges.findIndex(c => c.id === parseInt(challengeId));
  if (index === -1) {
    return res.status(400).json({ error: 'Challenge not found' });
  }
  challenges.splice(index, 1);
  res.json({ success: true });
});

app.post('/api/challenges/join', (req, res) => {
  const { email, challengeId } = req.body;

  if (!users[email]) {
    return res.status(400).json({ error: 'User not found' });
  }
  if (userChallenges[email][challengeId]) {
    return res.status(400).json({ error: 'Already joined' });
  }
  userChallenges[email][challengeId] = {
    kmCompleted: 0,
    stepsCompleted: 0,
    kmVerified: 0,
    joinedDate: new Date(),
    verified: false,
    proofImage: null
  };

  res.json({ success: true });
});

app.post('/api/challenges/log-distance', (req, res) => {
  const { email, challengeId, kmCompleted, stepsCompleted, proofImage } = req.body;
  if (!users[email] || !userChallenges[email][challengeId]) {
    return res.status(400).json({ error: 'Challenge not found' });
  }
  const km = parseFloat(kmCompleted) || 0;
  const steps = parseInt(stepsCompleted) || 0;

  if (km < 0 && steps < 0) {
    return res.status(400).json({ error: 'Please enter km or steps' });
  }
  let finalKm = km;
  if (steps > 0 && km === 0) {
    finalKm = parseFloat(stepsToKm(steps));
  }

  userChallenges[email][challengeId].kmCompleted = finalKm;
  userChallenges[email][challengeId].stepsCompleted = steps || kmToSteps(finalKm);
  userChallenges[email][challengeId].proofImage = proofImage || null;
  userChallenges[email][challengeId].submittedAt = new Date();

  users[email].totalKm = (users[email].totalKm || 0) + finalKm;
  users[email].totalSteps = (users[email].totalSteps || 0) + userChallenges[email][challengeId].stepsCompleted;
  users[email].points = (users[email].points || 0) + (finalKm * 5);

  if (proofImage) {
    verificationQueue.push({
      id: verificationQueue.length + 1,
      email,
      challengeId,
      km: finalKm,
      steps: userChallenges[email][challengeId].stepsCompleted,
      proofImage,
      status: 'pending',
      submittedAt: new Date()
    });
    return res.json({ success: true, message: '📸 Submitted for verification' });
  }

  res.json({ success: true, message: 'Progress logged!' });
});

// ======== VERIFICATION ========
app.get('/api/verification-queue', (req, res) => {
  const { adminPassword } = req.query;
  if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '❌ Admin required' });
  }
  res.json({ queue: verificationQueue });
});

app.post('/api/verification/approve', (req, res) => {
  const { verificationId, adminPassword } = req.body;
  if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '❌ Admin required' });
  }
  const verification = verificationQueue.find(v => v.id === parseInt(verificationId));
  if (!verification) {
    return res.status(400).json({ error: 'Not found' });
  }

  users[verification.email].verifiedKm = (users[verification.email].verifiedKm || 0) + verification.km;
  users[verification.email].points = (users[verification.email].points || 0) + (verification.km * 5);
  users[verification.email].verificationBadges = (users[verification.email].verificationBadges || 0) + 1;

  userChallenges[verification.email][verification.challengeId].kmVerified = verification.km;
  userChallenges[verification.email][verification.challengeId].verified = true;

  verification.status = 'approved';
  res.json({ success: true });
});

app.post('/api/verification/reject', (req, res) => {
  const { verificationId, adminPassword } = req.body;
  if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '❌ Admin required' });
  }
  const verification = verificationQueue.find(v => v.id === parseInt(verificationId));
  if (!verification) return res.status(400).json({ error: 'Not found' });
  verification.status = 'rejected';
  res.json({ success: true });
});

app.get('/api/user/:email/challenges', (req, res) => {
  const { email } = req.params;
  if (!users[email]) {
    return res.status(400).json({ error: 'User not found' });
  }
  const joinedChallenges = [];
  if (userChallenges[email]) {
    for (const [cId, progress] of Object.entries(userChallenges[email])) {
      const challenge = challenges.find(c => c.id === parseInt(cId));
      if (challenge) {
        joinedChallenges.push({
          ...challenge,
          kmCompleted: progress.kmCompleted || 0,
          stepsCompleted: progress.stepsCompleted || 0,
          kmVerified: progress.kmVerified || 0,
          verified: progress.verified || false,
          joinedDate: progress.joinedDate,
          percentComplete: Math.min(100, ((progress.kmCompleted || 0) / challenge.distance) * 100),
          percentSteps: Math.min(100, ((progress.stepsCompleted || 0) / challenge.stepsTarget) * 100)
        });
      }
    }
  }
  res.json({ joinedChallenges });
});

// ======== LEADERBOARD ========
app.get('/api/leaderboard', (req, res) => {
  const leaderboard = Object.keys(users)
    .map(email => ({
      name: users[email].name,
      email,
      totalKm: users[email].totalKm || 0,
      totalSteps: users[email].totalSteps || 0,
      verifiedKm: users[email].verifiedKm || 0,
      points: users[email].points || 0,
      verificationBadges: users[email].verificationBadges || 0,
      challengesJoined: Object.keys(userChallenges[email] || {}).length
    }))
    .sort((a, b) => b.verificationBadges !== a.verificationBadges ? b.verificationBadges - a.verificationBadges : b.points - a.points)
    .slice(0, 50);

  res.json({ leaderboard });
});

// ======== DISCUSSIONS ========
app.get('/api/discussions', (req, res) => {
  res.json({ discussions });
});

app.post('/api/discussions', (req, res) => {
  const { email, name, message, image } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const post = {
    id: discussions.length + 1,
    email,
    name: name || 'Anonymous',
    message,
    image: image || null,
    timestamp: new Date(),
    likes: 0,
    replies: []
  };

  discussions.unshift(post);
  res.json({ success: true, post });
});

app.post('/api/discussions/delete', (req, res) => {
  const { postId, adminPassword } = req.body;

  if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '❌ Admin required' });
  }

  const index = discussions.findIndex(p => p.id === parseInt(postId));
  if (index === -1) {
    return res.status(400).json({ error: 'Post not found' });
  }

  discussions.splice(index, 1);
  res.json({ success: true });
});

app.post('/api/discussions/delete-image', (req, res) => {
  const { postId, adminPassword } = req.body;

  if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '❌ Admin required' });
  }
  const post = discussions.find(p => p.id === parseInt(postId));
  if (!post || !post.image) {
    return res.status(400).json({ error: 'No image found' });
  }
  post.image = null;
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log('🥾 ============ TrailHub Backend ============');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log('✅ Status: RUNNING');
  console.log('👟 Pedometer + Distance Tracking');
  console.log('💬 Discussion Board with Emoji + Admin Delete');
  console.log('👑 Admin Panel (Create, Delete, Verify)');
  console.log('==========================================');
});
