// PPG Arts and Science College CTF - Main JavaScript Logic

// Global Variables
let timerInterval = null;
let timeRemaining = 5400; // 90 minutes in seconds
let timerRunning = false;
let currentTeam = '';
let resetUsed = false; // Track if reset has been used
let gameState = {
    solvedRounds: [],
    totalScore: 0,
    submissions: []
};

// Correct Flags for Validation
const correctFlags = {
    1: 'PPG{PDF_FORENSICS}',
    2: 'PPG{IMAGE_EXIF_MASTER}',
    3: 'PPG{CRYPTO_MASTER}',
    4: 'PPG{QR_ANALYSIS_COMPLETE}',
    5: 'PPG{ADVANCED_CHALLENGE_COMPLETE}'
};

// Round Points
const roundPoints = {
    1: 10,
    2: 10,
    3: 10,
    4: 10,
    5: 20
};

// Initialize on Page Load
document.addEventListener('DOMContentLoaded', function() {
    checkTeamRegistration();
    loadGameState();
    initializeEventListeners();
    updateLeaderboard();
    updateUI();
});

// Check if team is registered
function checkTeamRegistration() {
    currentTeam = localStorage.getItem('ctfTeamName');
    if (!currentTeam) {
        document.getElementById('registrationModal').style.display = 'flex';
        disableGameplay();
    } else {
        document.getElementById('registrationModal').style.display = 'none';
        document.getElementById('teamDisplay').textContent = `Team: ${currentTeam}`;
        enableGameplay();
    }
}

// Register Team
function registerTeam() {
    const teamNameInput = document.getElementById('teamNameInput');
    const teamName = teamNameInput.value.trim();
    
    if (!teamName) {
        showMessage('Please enter a team name', 'error');
        return;
    }
    
    if (teamName.length < 3) {
        showMessage('Team name must be at least 3 characters', 'error');
        return;
    }
    
    currentTeam = teamName;
    localStorage.setItem('ctfTeamName', currentTeam);
    gameState.teamName = currentTeam;
    saveGameState();
    
    document.getElementById('registrationModal').style.display = 'none';
    document.getElementById('teamDisplay').textContent = `Team: ${currentTeam}`;
    
    showMessage(`Welcome ${currentTeam}! Good luck!`, 'success');
    enableGameplay();
    updateLeaderboard();
}

// Enable/Disable Gameplay
function disableGameplay() {
    document.querySelectorAll('.flag-input').forEach(input => {
        input.disabled = true;
    });
    document.querySelectorAll('.submit-btn').forEach(btn => {
        btn.disabled = true;
    });
}

function enableGameplay() {
    document.querySelectorAll('.flag-input').forEach(input => {
        input.disabled = false;
    });
    document.querySelectorAll('.submit-btn').forEach(btn => {
        btn.disabled = false;
    });
}

// Timer Functions
function startTimer(resumeMode = false) {
    if (timerRunning && !resumeMode) {
        showMessage('Timer is already running', 'warning');
        return;
    }
    
    timerRunning = true;
    document.getElementById('startTimerBtn').disabled = true;
    
    // Clear any existing timer interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(function() {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 600) { // 10 minutes warning
            document.getElementById('timer').classList.add('warning');
            if (timeRemaining === 600) {
                showMessage('⚠️ Only 10 minutes remaining!', 'warning');
            }
        }
        
        if (timeRemaining <= 0) {
            endGame();
        }
        
        // Save state every 10 seconds
        if (timeRemaining % 10 === 0) {
            saveGameState();
        }
    }, 1000);
    
    if (!resumeMode) {
        showMessage('Timer started! Good luck!', 'success');
    } else {
        showMessage('Timer resumed from previous session', 'info');
    }
    
    saveGameState();
}

function resetTimer() {
    // Check if reset has already been used
    if (resetUsed) {
        showMessage('❌ Reset already used! You only get one chance per game.', 'error');
        return;
    }
    
    // Only allow reset if timer is not running or if game is over
    if (timerRunning && timeRemaining > 0) {
        showMessage('❌ Cannot reset timer while game is in progress!', 'error');
        return;
    }
    
    if (confirm('⚠️ WARNING: This is your ONLY reset chance!\n\nAll progress will be lost.\nAre you absolutely sure?')) {
        if (confirm('🔒 FINAL CONFIRMATION:\n\nType "RESET" to confirm game reset:')) {
            const resetCode = prompt('Type "RESET" to confirm:');
            if (resetCode === 'RESET') {
                clearInterval(timerInterval);
                timerRunning = false;
                timeRemaining = 5400; // Reset to 90 minutes
                
                // Mark reset as used
                resetUsed = true;
                
                // Reset game state
                gameState = {
                    solvedRounds: [],
                    totalScore: 0,
                    submissions: []
                };
                
                // Reset UI
                document.querySelectorAll('.round-card').forEach(card => {
                    card.classList.remove('solved');
                });
                document.querySelectorAll('.flag-input').forEach(input => {
                    input.disabled = false;
                    input.value = '';
                });
                document.querySelectorAll('.submit-btn').forEach(btn => {
                    btn.disabled = false;
                });
                
                updateTimerDisplay();
                updateProgress();
                updateLeaderboard();
                document.getElementById('timer').classList.remove('warning', 'expired');
                document.getElementById('startTimerBtn').disabled = false;
                
                // Update reset button to show it's been used
                updateResetButton();
                
                // Save state with reset used flag
                saveGameState();
                
                showMessage('🔄 Game reset! This was your only reset chance.', 'warning');
            } else {
                showMessage('❌ Reset cancelled. Incorrect confirmation code.', 'error');
            }
        } else {
            showMessage('❌ Reset cancelled.', 'info');
        }
    } else {
        showMessage('❌ Reset cancelled.', 'info');
    }
}

function updateResetButton() {
    const resetBtn = document.getElementById('resetTimerBtn');
    if (resetBtn) {
        if (resetUsed) {
            resetBtn.textContent = 'Reset Used ❌';
            resetBtn.disabled = true;
            resetBtn.style.opacity = '0.5';
            resetBtn.style.cursor = 'not-allowed';
        } else {
            resetBtn.textContent = 'Reset Timer (1 Chance)';
            resetBtn.disabled = false;
            resetBtn.style.opacity = '1';
            resetBtn.style.cursor = 'pointer';
        }
    }
}

function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;
    
    if (timeRemaining <= 0) {
        document.getElementById('timer').classList.add('expired');
    }
}

function endGame() {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('timer').classList.add('expired');
    showMessage('⏰ Time\'s up! Game over.', 'error');
    disableGameplay();
    
    // Show final results
    setTimeout(() => {
        alert(`Game Over!\n\nTeam: ${currentTeam}\nFinal Score: ${gameState.totalScore}\nRounds Solved: ${gameState.solvedRounds.length}`);
    }, 1000);
}

// Flag Submission
function submitFlag(roundNumber) {
    if (!currentTeam) {
        showMessage('Please register your team first', 'error');
        return;
    }
    
    if (!timerRunning && timeRemaining === 5400) {
        showMessage('Please start the timer first', 'warning');
        return;
    }
    
    if (timeRemaining <= 0) {
        showMessage('Time is up! No more submissions allowed.', 'error');
        return;
    }
    
    if (gameState.solvedRounds.includes(roundNumber)) {
        showMessage('You have already solved this round!', 'warning');
        return;
    }
    
    const flagInput = document.getElementById(`flag${roundNumber}`);
    const submittedFlag = flagInput.value.trim();
    
    if (!submittedFlag) {
        showMessage('Please enter a flag', 'error');
        return;
    }
    
    // Check if submitted flag is correct
    if (submittedFlag === correctFlags[roundNumber]) {
        // Correct flag
        gameState.solvedRounds.push(roundNumber);
        gameState.totalScore += roundPoints[roundNumber];
        gameState.submissions.push({
            round: roundNumber,
            flag: submittedFlag,
            timestamp: new Date().toISOString()
        });
        
        // Update UI
        document.getElementById(`round${roundNumber}`).classList.add('solved');
        flagInput.disabled = true;
        flagInput.nextElementSibling.disabled = true;
        flagInput.value = '✅ SOLVED';
        
        showMessage(`🎉 Correct! +${roundPoints[roundNumber]} points`, 'success');
        updateProgress();
        updateLeaderboard();
        saveGameState();
        
        // Check if all rounds are solved
        if (gameState.solvedRounds.length === 5) {
            setTimeout(() => {
                showMessage('🏆 Congratulations! You\'ve completed all challenges!', 'success');
            }, 1000);
        }
    } else {
        // Incorrect flag
        showMessage('❌ Incorrect flag. Try again!', 'error');
        flagInput.classList.add('shake');
        setTimeout(() => {
            flagInput.classList.remove('shake');
        }, 500);
    }
}

// Update Progress Bar
function updateProgress() {
    const progress = (gameState.solvedRounds.length / 5) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Leaderboard Functions
function updateLeaderboard() {
    const leaderboardData = getLeaderboardData();
    const leaderboardBody = document.getElementById('leaderboardBody');
    
    if (leaderboardData.length === 0) {
        leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No teams yet</td></tr>';
        return;
    }
    
    leaderboardBody.innerHTML = leaderboardData.map((team, index) => {
        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
        return `
            <tr>
                <td class="${rankClass}">#${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.score}</td>
                <td>${team.solved}/5</td>
            </tr>
        `;
    }).join('');
}

function getLeaderboardData() {
    // Get all teams from localStorage
    const allTeams = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ctf_gamestate_')) {
            const teamData = JSON.parse(localStorage.getItem(key));
            if (teamData.teamName && teamData.totalScore > 0) {
                allTeams.push({
                    name: teamData.teamName,
                    score: teamData.totalScore,
                    solved: teamData.solvedRounds ? teamData.solvedRounds.length : 0
                });
            }
        }
    }
    
    // Add current team if not in storage
    if (currentTeam && gameState.totalScore > 0) {
        const existingIndex = allTeams.findIndex(t => t.name === currentTeam);
        if (existingIndex === -1) {
            allTeams.push({
                name: currentTeam,
                score: gameState.totalScore,
                solved: gameState.solvedRounds.length
            });
        }
    }
    
    // Sort by score (descending) then by team name
    return allTeams.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
    });
}

// Game State Management
function saveGameState() {
    const stateKey = `ctf_gamestate_${currentTeam}`;
    const stateToSave = {
        ...gameState,
        teamName: currentTeam,
        timeRemaining: timeRemaining,
        timerRunning: timerRunning,
        resetUsed: resetUsed,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(stateKey, JSON.stringify(stateToSave));
}

function loadGameState() {
    if (!currentTeam) return;
    
    const stateKey = `ctf_gamestate_${currentTeam}`;
    const savedState = localStorage.getItem(stateKey);
    
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        gameState = {
            solvedRounds: parsedState.solvedRounds || [],
            totalScore: parsedState.totalScore || 0,
            submissions: parsedState.submissions || []
        };
        
        // Restore reset status
        resetUsed = parsedState.resetUsed || false;
        
        // Restore timer state if applicable
        if (parsedState.timerRunning && parsedState.timeRemaining > 0) {
            timeRemaining = parsedState.timeRemaining;
            timerRunning = parsedState.timerRunning;
            updateTimerDisplay();
            
            // Auto-restore timer if it was running
            if (parsedState.timerRunning && timeRemaining > 0) {
                document.getElementById('startTimerBtn').disabled = true;
                
                // Check if game ended while page was closed
                const lastUpdated = new Date(parsedState.lastUpdated);
                const now = new Date();
                const elapsedSeconds = Math.floor((now - lastUpdated) / 1000);
                
                if (elapsedSeconds >= timeRemaining) {
                    // Game ended while page was closed
                    timeRemaining = 0;
                    timerRunning = false;
                    endGame();
                } else {
                    // Adjust time remaining for elapsed time
                    timeRemaining -= elapsedSeconds;
                    if (timeRemaining <= 0) {
                        endGame();
                    } else {
                        // Resume timer
                        startTimer(true); // Resume mode
                    }
                }
            }
        }
        
        // Update reset button state
        updateResetButton();
        
        // Check if advanced challenge was solved in separate window
        const advancedSolved = localStorage.getItem('advancedChallengeSolved');
        const advancedFlag = localStorage.getItem('advancedChallengeFlag');
        if (advancedSolved === 'true' && advancedFlag && !gameState.solvedRounds.includes(5)) {
            gameState.solvedRounds.push(5);
            gameState.totalScore += 20;
            gameState.submissions.push({
                round: 5,
                flag: advancedFlag,
                timestamp: new Date().toISOString()
            });
            localStorage.removeItem('advancedChallengeSolved');
            localStorage.removeItem('advancedChallengeFlag');
        }
    }
}

function updateUI() {
    // Update solved rounds UI
    gameState.solvedRounds.forEach(roundNumber => {
        const roundElement = document.getElementById(`round${roundNumber}`);
        if (roundElement) {
            roundElement.classList.add('solved');
            const flagInput = document.getElementById(`flag${roundNumber}`);
            const submitBtn = flagInput.nextElementSibling;
            flagInput.disabled = true;
            submitBtn.disabled = true;
            flagInput.value = '✅ SOLVED';
        }
    });
    
    updateProgress();
    updateLeaderboard();
}

// Message Display
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Event Listeners
function initializeEventListeners() {
    // Allow copy/paste only in flag inputs and specific areas
    document.addEventListener('copy', function(e) {
        const target = e.target;
        const isAllowed = target.classList.contains('flag-input') || 
                         target.classList.contains('team-input') ||
                         target.classList.contains('cipher-text') ||
                         target.closest('.cipher-text') ||
                         target.closest('.hint-section');
        
        if (!isAllowed) {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('paste', function(e) {
        const target = e.target;
        const isAllowed = target.classList.contains('flag-input') || 
                         target.classList.contains('team-input');
        
        if (!isAllowed) {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('cut', function(e) {
        const target = e.target;
        const isAllowed = target.classList.contains('flag-input') || 
                         target.classList.contains('team-input') ||
                         target.closest('.cipher-text') ||
                         target.closest('.hint-section');
        
        if (!isAllowed) {
            e.preventDefault();
            return false;
        }
    });
    
    // Team name input enter key
    document.getElementById('teamNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            registerTeam();
        }
    });
    
    // Prevent right-click globally
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Prevent text selection
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            return false;
        }
    });
    
    // Prevent drag
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Keyboard shortcuts disabled
    document.addEventListener('keydown', function(e) {
        // F12, Ctrl+Shift+I, Ctrl+U (view source)
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') || 
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                return false;
            }
        }
    });
    
    // Page visibility change (detect tab switching)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && timerRunning) {
            // Note: In a real competition, you might want to penalize tab switching
            // For educational purposes, we'll just log it
            console.log('Tab switched during active game');
        }
    });
    
    // Before page unload
    window.addEventListener('beforeunload', function(e) {
        if (timerRunning && timeRemaining > 0 && gameState.totalScore > 0) {
            e.preventDefault();
            e.returnValue = 'Game in progress. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
}

// Utility Functions
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function isValidFlagFormat(flag) {
    return /^PPG\{[A-Z0-9_]+\}$/.test(flag);
}

// Debug Functions (remove in production)
function debugClearAllData() {
    if (confirm('This will clear ALL CTF data. Are you sure?')) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('ctf_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        location.reload();
    }
}

// Export functions for global access
window.registerTeam = registerTeam;
window.startTimer = startTimer;
window.resetTimer = resetTimer;
window.submitFlag = submitFlag;
window.debugClearAllData = debugClearAllData;
