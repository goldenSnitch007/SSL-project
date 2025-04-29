// ==========================================================================
// Howzatt! Cricket Scorekeeper - score.js
// Author: [Your Name/ID based on original]
// Handles all application logic and state management.
// ==========================================================================

// ==========================================================================
// Global State Variable
// ==========================================================================
let matchState = null; // Holds the entire state of the current match

// ==========================================================================
// Helper Function to Load Match State from LocalStorage
// ==========================================================================
const loadMatchState = () => {
    const stateJSON = localStorage.getItem('currentMatchState');
    if (stateJSON) {
        try {
            return JSON.parse(stateJSON); // Parse the JSON string back into an object
        } catch (e) {
            console.error("Error parsing match state from localStorage:", e);
            // Handle error, maybe clear broken storage or redirect to setup
            localStorage.removeItem('currentMatchState');
            alert("Corrupt match data found. Please start a new match.");
            // Avoid immediate redirect from here if loadMatchState is called elsewhere
            return null;
        }
    }
    return null; // Return null if no state found
};

// ==========================================================================
// Helper Function to Save Match State to LocalStorage
// ==========================================================================
const saveMatchState = () => {
    if (matchState) {
        try {
            localStorage.setItem('currentMatchState', JSON.stringify(matchState));
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
            alert("Could not save match progress. LocalStorage might be full or disabled.");
            // Decide how to handle this - maybe prevent further actions?
        }
    }
};

// ==========================================================================
// Helper Function to Format Overs (e.g., from balls)
// ==========================================================================
const formatOvers = (totalBalls) => {
    if (typeof totalBalls !== 'number' || totalBalls < 0) return '0.0';
    const overs = Math.floor(totalBalls / 6);
    const balls = totalBalls % 6;
    return `${overs}.${balls}`;
};

// ==========================================================================
// Helper Function to Calculate Economy
// ==========================================================================
const calculateEconomy = (runs, totalBalls) => {
    if (totalBalls <= 0) return '0.00';
    // Ensure calculation uses balls, not formatted overs string
    return ((runs / totalBalls) * 6).toFixed(2);
};

// ==========================================================================
// Helper Function to Calculate Strike Rate
// ==========================================================================
const calculateStrikeRate = (runs, balls) => {
    if (balls <= 0) return '0.00';
    return ((runs / balls) * 100).toFixed(2);
};


// ==========================================================================
// DOMContentLoaded Listener (Main execution entry point)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- Attempt to load match state ---
    matchState = loadMatchState();

    // --- Setup Page Logic ---
    const setupForm = document.getElementById('setupForm');
    if (setupForm) {
        const team1NameInput = document.getElementById('team1Name');
        const team2NameInput = document.getElementById('team2Name');
        const matchFormatSelect = document.getElementById('matchFormat');
        const tossWinnerSelect = document.getElementById('tossWinner');
        const tossDecisionSelect = document.getElementById('tossDecision');
        const startMatchButton = document.getElementById('startMatchButton');

        // Function to Update Toss Winner Dropdown dynamically
        const updateTossWinnerOptions = () => {
            const team1Name = team1NameInput.value.trim();
            const team2Name = team2NameInput.value.trim();
            // Store previously selected value to try and restore it
            const previousSelection = tossWinnerSelect.value;
            tossWinnerSelect.innerHTML = '<option value="" disabled selected>--Select Toss Winner--</option>'; // Reset options

            if (team1Name) {
                const option1 = document.createElement('option'); option1.value = team1Name; option1.textContent = team1Name; tossWinnerSelect.appendChild(option1);
            }
            if (team2Name) {
                const option2 = document.createElement('option'); option2.value = team2Name; option2.textContent = team2Name; tossWinnerSelect.appendChild(option2);
            }
            // Re-enable dropdown and try to restore previous selection
            tossWinnerSelect.disabled = !(team1Name && team2Name);
            if (tossWinnerSelect.disabled) {
                 tossWinnerSelect.innerHTML = '<option value="" disabled selected>--Enter Team Names First--</option>';
            } else {
                 // Try to re-select previous value if it still exists
                 if (previousSelection && [...tossWinnerSelect.options].some(opt => opt.value === previousSelection)) {
                     tossWinnerSelect.value = previousSelection;
                 }
            }
        };

        // Function to Handle Start Match Button Click
        const handleStartMatch = () => {
            const team1Name = team1NameInput.value.trim();
            const team2Name = team2NameInput.value.trim();
            const matchFormat = matchFormatSelect.value;
            const tossWinner = tossWinnerSelect.value;
            const tossDecision = tossDecisionSelect.value;

            // Validation
            if (!team1Name || !team2Name || !matchFormat || !tossWinner || !tossDecision) { alert('Please fill in all match setup details.'); return; }
            if (team1Name.toLowerCase() === team2Name.toLowerCase()) { alert('Team names must be different.'); return; }

            // Determine batting/bowling teams
            let battingTeam, bowlingTeam;
             if (tossWinner === team1Name) { battingTeam = (tossDecision === 'Bat') ? team1Name : team2Name; bowlingTeam = (tossDecision === 'Bat') ? team2Name : team1Name; } else { battingTeam = (tossDecision === 'Bat') ? team2Name : team1Name; bowlingTeam = (tossDecision === 'Bat') ? team1Name : team2Name; }

            // Initialize the global matchState object
             matchState = {
                team1Name: team1Name, team2Name: team2Name, totalOvers: parseInt(matchFormat), tossWinner: tossWinner, tossDecision: tossDecision, currentInnings: 1, battingTeam: battingTeam, bowlingTeam: bowlingTeam,
                innings: {
                    // Innings 1 structure
                    1: { teamName: battingTeam, score: 0, wickets: 0, oversBowled: 0, ballsBowledThisOver: 0, currentOverEvents: [], extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, total: 0 }, batters: [], bowlers: [], fallOfWickets: [], commentaryLog: [] },
                    // Innings 2 structure
                    2: { teamName: bowlingTeam, score: 0, wickets: 0, oversBowled: 0, ballsBowledThisOver: 0, currentOverEvents: [], extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, total: 0 }, batters: [], bowlers: [], fallOfWickets: [], commentaryLog: [] }
                },
                target: null, matchOver: false, winner: null, resultDescription: '',
                currentStrikerIndex: -1, // Index in the current inning's batters array
                currentNonStrikerIndex: -1,
                currentBowlerIndex: -1 // Index in the current inning's bowlers array
            };
            saveMatchState(); // Save the newly created state
            window.location.href = 'live.html'; // Navigate to live scoring
        };

        // Attach Event Listeners for setup page
        team1NameInput.addEventListener('input', updateTossWinnerOptions);
        team2NameInput.addEventListener('input', updateTossWinnerOptions);
        startMatchButton.addEventListener('click', handleStartMatch);
        updateTossWinnerOptions(); // Initial call
    }
    // --- End of Setup Page Logic ---


    // --- Live Match Page Logic ---
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) { // Check if we are on live.html

        // Redirect if state is missing (critical check)
        if (!matchState) {
            alert("No match data found or data corrupted. Redirecting to setup.");
            window.location.href = 'setup.html';
            return; // Stop execution for this page
        }

        // --- Get References to Live Page DOM Elements ---
        const runRatesDiv = document.getElementById('runRates');
        const currentRunRateSpan = document.getElementById('currentRunRate');
        const requiredRunRateSpan = document.getElementById('requiredRunRate');
        const strikerNameTd = document.getElementById('strikerName'), strikerStatusSpan = document.getElementById('strikerStatus'), strikerRunsTd = document.getElementById('strikerRuns'), strikerBallsTd = document.getElementById('strikerBalls'), strikerFoursTd = document.getElementById('strikerFours'), strikerSixesTd = document.getElementById('strikerSixes'), strikerSRTd = document.getElementById('strikerSR');
        const nonStrikerNameTd = document.getElementById('nonStrikerName'), nonStrikerStatusSpan = document.getElementById('nonStrikerStatus'), nonStrikerRunsTd = document.getElementById('nonStrikerRuns'), nonStrikerBallsTd = document.getElementById('nonStrikerBalls'), nonStrikerFoursTd = document.getElementById('nonStrikerFours'), nonStrikerSixesTd = document.getElementById('nonStrikerSixes'), nonStrikerSRTd = document.getElementById('nonStrikerSR');
        const currentBowlerNameTd = document.getElementById('currentBowlerName'), bowlerOversTd = document.getElementById('bowlerOvers'), bowlerMaidensTd = document.getElementById('bowlerMaidens'), bowlerRunsTd = document.getElementById('bowlerRuns'), bowlerWicketsTd = document.getElementById('bowlerWickets'), bowlerEconomyTd = document.getElementById('bowlerEconomy'), overProgressSpan = document.getElementById('overProgress');
        const scoringControlsDiv = document.querySelector('.scoring-controls');
        const commentaryDisplayDiv = document.getElementById('commentaryDisplay');
        const gotoScorecardButton = document.getElementById('gotoScorecardButton');

        // --- Temporary variables for current over (reset in newBowler) ---
        let runsThisOver = 0;
        let wicketsThisOver = 0;

        // --- Helper functions to get current players/inning ---
        const getCurrentInning = () => matchState.innings[matchState.currentInnings];
        const getCurrentBowler = () => matchState.currentBowlerIndex !== -1 ? getCurrentInning().bowlers[matchState.currentBowlerIndex] : null;
        const getStriker = () => matchState.currentStrikerIndex !== -1 ? getCurrentInning().batters[matchState.currentStrikerIndex] : null;
        const getNonStriker = () => matchState.currentNonStrikerIndex !== -1 ? getCurrentInning().batters[matchState.currentNonStrikerIndex] : null;

        // --- Core Logic Functions ---

        // Adds a line to the commentary log in matchState
        const addCommentary = (text) => {
            if (!matchState || matchState.matchOver) return;
            const currentInning = getCurrentInning();
            const overs = currentInning.oversBowled;
             // Get ball number *for display* (adjust if just completed over)
             let ballNumForDisplay = currentInning.ballsBowledThisOver;
             if (ballNumForDisplay === 0 && currentInning.currentOverEvents?.length > 0) {
                 // If ball count is 0 but events exist, it means over just ended. Show previous over's ball 6.
                 ballNumForDisplay = 6;
             } else if (ballNumForDisplay === 0) {
                  ballNumForDisplay = 1; // Start of new over
             }
             const ballIdentifier = `${overs}.${ballNumForDisplay}`;

            currentInning.commentaryLog.push(`${ballIdentifier}: ${text}`);
             // Limit commentary log size (optional)
             const MAX_LOG_SIZE = 100;
             if (currentInning.commentaryLog.length > MAX_LOG_SIZE) {
                 currentInning.commentaryLog.shift(); // Remove oldest entry
             }
        };

        // Rotates strike based on runs or end of over
        const rotateStrike = (runs = -1) => { // runs=-1 for end of over rotation
             if (runs === 1 || runs === 3 || runs === 5 || runs === -1) { // Odd runs or end of over
                [matchState.currentStrikerIndex, matchState.currentNonStrikerIndex] =
                [matchState.currentNonStrikerIndex, matchState.currentStrikerIndex];
                 // Only add commentary if it's due to runs, not end of over (handled separately)
                 if (runs !== -1) {
                      addCommentary("Strike rotated.");
                 }
            }
        };

         // Handles setup for a new batter after a wicket
        const newBatter = (isRunOut = false, dismissedBatterIndex = -1) => {
            if (matchState.matchOver) return;
            const currentInning = getCurrentInning();
            if (dismissedBatterIndex === -1) dismissedBatterIndex = matchState.currentStrikerIndex;

            const dismissedBatter = currentInning.batters[dismissedBatterIndex];
            if (!dismissedBatter) { console.error("Dismissed batter not found!"); return; }

            // Record Fall of Wicket (store over/ball for better display later)
            const fowOver = currentInning.oversBowled;
            const fowBall = currentInning.ballsBowledThisOver; // Ball number *when* wicket fell
            currentInning.fallOfWickets.push({
                score: currentInning.score,
                wickets: currentInning.wickets, // Wicket number (already incremented before calling newBatter)
                batterName: dismissedBatter.name,
                batterRuns: dismissedBatter.runs,
                batterBalls: dismissedBatter.balls,
                atOver: fowOver + (fowBall / 10) // Store as decimal e.g., 4.2
            });

            // Check if innings over (all out) - Use 10 wickets as standard
             if (currentInning.wickets >= 10) {
                 // Don't prompt for new batter if all out
                 addCommentary(`All out! Last wicket: ${dismissedBatter.name}.`);
                 endOfInnings();
                 return;
             }

            // Prompt for new batter's name
            let newBatterName = '';
            const otherBatterIndex = (dismissedBatterIndex === matchState.currentStrikerIndex) ? matchState.currentNonStrikerIndex : matchState.currentStrikerIndex;
            const otherBatter = (otherBatterIndex !== -1) ? currentInning.batters[otherBatterIndex] : null;

            while (!newBatterName || (otherBatter && otherBatter.name.toLowerCase() === newBatterName.toLowerCase())) {
                newBatterName = prompt(`Enter name for the next batter (replacing ${dismissedBatter.name}) for ${currentInning.teamName}:`)?.trim();
                if (!newBatterName) return; // User cancelled - problematic, maybe retry? For now, just return.
                if (otherBatter && otherBatter.name.toLowerCase() === newBatterName.toLowerCase()) {
                    alert(`New batter name cannot be the same as the batter already at the crease (${otherBatter.name}).`);
                }
            }

            // Add new batter object
            currentInning.batters.push({ name: newBatterName, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, outMethod: '' });
            const newBatterArrayIndex = currentInning.batters.length - 1;

            // New batter replaces the dismissed one's index (striker or non-striker)
            if (dismissedBatterIndex === matchState.currentStrikerIndex) {
                matchState.currentStrikerIndex = newBatterArrayIndex;
            } else {
                matchState.currentNonStrikerIndex = newBatterArrayIndex;
            }

            addCommentary(`${newBatterName} comes to the crease.`);
        };

         // Handles setup for a new bowler at the end of an over
        const newBowler = () => {
             if (matchState.matchOver) return;
             const currentInning = getCurrentInning();
             let bowlerName = '';
             const previousBowler = getCurrentBowler();

             while (!bowlerName || (previousBowler && previousBowler.name.toLowerCase() === bowlerName.toLowerCase())) {
                 bowlerName = prompt(`Over complete. Enter name for the next bowler for ${matchState.bowlingTeam}:`)?.trim();
                  if (!bowlerName) return; // User cancelled
                  if (previousBowler && previousBowler.name.toLowerCase() === bowlerName.toLowerCase()) {
                      alert("Bowler cannot bowl consecutive overs. Please enter a different bowler.");
                  }
             }

             // Check if bowler exists, otherwise add
             let existingBowlerIndex = currentInning.bowlers.findIndex(b => b.name.toLowerCase() === bowlerName.toLowerCase());
             if (existingBowlerIndex !== -1) {
                 matchState.currentBowlerIndex = existingBowlerIndex;
             } else {
                 currentInning.bowlers.push({ name: bowlerName, overs: 0, ballsBowled: 0, maidens: 0, runsConceded: 0, wickets: 0 });
                 matchState.currentBowlerIndex = currentInning.bowlers.length - 1;
             }

             addCommentary(`${getCurrentBowler().name} starts the new over.`);
             // Reset over counters
             runsThisOver = 0;
             wicketsThisOver = 0;
             currentInning.currentOverEvents = []; // Clear events for the new over
        };

        // Central function to process the effects of a ball bowled
        const processBall = (isLegalDelivery, runsScoredByBatter = 0, runsScoredAsExtras = 0, isWicket = false, wicketMethod = '', eventString = '') => {
             if (matchState.matchOver) return;

             const currentInning = getCurrentInning();
             const bowler = getCurrentBowler();
             const striker = getStriker(); // Get striker *before* potential wicket/newBatter

             if (!bowler || !striker) { console.error("Error: Bowler or Striker not defined!"); return; }

             // Add event string to over progress *before* potentially ending over
             if (!currentInning.currentOverEvents) currentInning.currentOverEvents = [];
             currentInning.currentOverEvents.push(eventString);

             // --- Update Scores ---
             currentInning.score += runsScoredByBatter + runsScoredAsExtras;
             runsThisOver += runsScoredByBatter + runsScoredAsExtras;

             // --- Update Bowler Stats ---
             bowler.runsConceded += runsScoredByBatter + runsScoredAsExtras;
              if (isLegalDelivery) {
                  bowler.ballsBowled += 1;
                  currentInning.ballsBowledThisOver += 1;
              }

             // --- Update Batter Stats ---
              if (runsScoredByBatter > 0) {
                  striker.runs += runsScoredByBatter;
                  if (runsScoredByBatter === 4) striker.fours += 1;
                  if (runsScoredByBatter === 6) striker.sixes += 1;
              }
              if (isLegalDelivery) {
                  striker.balls += 1;
              }

             // --- Handle Wicket (Bowler credited wickets like Caught, Bowled, LBW, Stumped) ---
             if (isWicket) {
                 currentInning.wickets += 1;
                 wicketsThisOver += 1;
                 bowler.wickets += 1; // Credit bowler
                 striker.isOut = true;
                 striker.outMethod = wicketMethod;
                  addCommentary(`WICKET! ${striker.name} ${wicketMethod} b ${bowler.name} ${striker.runs}(${striker.balls})`);
                 newBatter(false, matchState.currentStrikerIndex); // Call newBatter AFTER recording wicket details
                 // Check if innings/match ended due to this wicket
                 if (matchState.matchOver || currentInning.wickets >= 10) return;
             }

             // --- Check for End of Over ---
             if (isLegalDelivery && currentInning.ballsBowledThisOver >= 6) {
                 endOfOver();
                 if (matchState.matchOver) return; // Check if match ended after over completion
             } else {
                  // Check if match ends mid-over (target reached) only if it wasn't end of over
                  checkMatchEnd();
             }
         };

        // Logic executed at the end of a legal 6-ball over
        const endOfOver = () => {
            if (matchState.matchOver) return;
            const currentInning = getCurrentInning();
            const bowler = getCurrentBowler();

            currentInning.oversBowled += 1;
            // Don't reset ballsBowledThisOver here, reset happens in newBowler/start of next processBall
            currentInning.ballsBowledThisOver = 0; // Reset for next over

            // Calculate Maidens: Check if runsThisOver is 0 (wickets don't break maiden)
            if (runsThisOver === 0) {
                bowler.maidens += 1;
                 addCommentary(`End of Over ${currentInning.oversBowled}: Maiden! ${bowler.name} ${formatOvers(bowler.ballsBowled)} - ${bowler.runsConceded}/${bowler.wickets}`);
            } else {
                 addCommentary(`End of Over ${currentInning.oversBowled}: ${runsThisOver} run(s). ${currentInning.teamName} ${currentInning.score}/${currentInning.wickets}`);
            }

            // Check if innings ended due to overs completion
             if (currentInning.oversBowled >= matchState.totalOvers) {
                 endOfInnings();
                 return;
             }

            // Prepare for next over
            rotateStrike(-1); // Rotate strike for the new over
            newBowler();      // Prompt for the next bowler (this also resets runsThisOver etc)
        };

        // Logic executed when an innings concludes
        const endOfInnings = () => {
             if (matchState.matchOver) return;
             const currentInningNum = matchState.currentInnings;
             const currentInning = getCurrentInning();
             const completedOvers = formatOvers((currentInning.oversBowled * 6) + currentInning.ballsBowledThisOver);
             addCommentary(`End of Innings ${currentInningNum}. ${currentInning.teamName} finish at ${currentInning.score}/${currentInning.wickets} after ${completedOvers} overs.`);

             if (currentInningNum === 1) {
                 // Prepare for second innings
                 matchState.currentInnings = 2;
                 matchState.target = currentInning.score + 1;
                 [matchState.battingTeam, matchState.bowlingTeam] = [matchState.bowlingTeam, matchState.battingTeam];
                 matchState.currentStrikerIndex = -1;
                 matchState.currentNonStrikerIndex = -1;
                 matchState.currentBowlerIndex = -1;
                 // Reset over-specific counters for innings 2 start
                 runsThisOver = 0;
                 wicketsThisOver = 0;
                 initializePlayers(); // Prompt for players for Innings 2
                 addCommentary(`${matchState.battingTeam} require ${matchState.target} runs to win from ${matchState.totalOvers} overs.`);
             } else {
                 // Second innings finished, check final result
                 checkMatchEnd(true); // Force final check
             }
        };

        // Checks if the match has concluded and sets the result
         const checkMatchEnd = (forceCheck = false) => {
             if (matchState.matchOver) return; // Already ended
             const currentInning = getCurrentInning();
             if (matchState.currentInnings === 1 && !forceCheck) return; // Can't end after Innings 1 unless forced (e.g. endOfInnings call)

             let resultDesc = '';
             let winner = null;
             let ended = false;

             const runsNeeded = matchState.target - currentInning.score;
             const ballsRemaining = (matchState.totalOvers * 6) - ((currentInning.oversBowled * 6) + currentInning.ballsBowledThisOver);
             const oversFinished = currentInning.oversBowled >= matchState.totalOvers;
             const allOut = currentInning.wickets >= 10;

             if (matchState.currentInnings === 2 && currentInning.score >= matchState.target) {
                 // Chasing team won
                 winner = matchState.battingTeam;
                 const wicketsRemaining = 10 - currentInning.wickets;
                 resultDesc = `${winner} won by ${wicketsRemaining} wicket(s)`;
                 if (ballsRemaining > 0) { resultDesc += ` (with ${ballsRemaining} ball(s) remaining)`; }
                 ended = true;
             } else if (oversFinished || allOut) {
                  // Innings 2 ended without reaching target
                 if (currentInning.score === matchState.target - 1) { // Tie
                     winner = 'Tie'; resultDesc = "Match Tied!";
                 } else { // Team batting first won
                     winner = matchState.bowlingTeam; // Team that batted first
                     resultDesc = `${winner} won by ${runsNeeded - 1} run(s)`;
                 }
                 ended = true;
             }

             if (ended) {
                 matchState.matchOver = true;
                 matchState.winner = winner;
                 matchState.resultDescription = resultDesc;
                 addCommentary(`MATCH OVER: ${resultDesc}`);
                 updateLiveDisplay(); // Final display update
                 saveMatchState(); // Save final state
                 alert(`Match Over!\n${resultDesc}\n\nRedirecting to summary...`);
                 // Disable scoring buttons (optional)
                 scoringControlsDiv.style.pointerEvents = 'none';
                 scoringControlsDiv.style.opacity = '0.5';
                  setTimeout(() => { window.location.href = 'summary.html'; }, 1500);
             }
         };

        // Function to prompt for initial players if not already set
        const initializePlayers = () => {
             // Only run if the match isn't already over
             if (matchState.matchOver) return;

             const currentInning = getCurrentInning();

             // Initialize Batters if needed
             if (matchState.currentStrikerIndex === -1 || matchState.currentNonStrikerIndex === -1 || currentInning.batters.length < 2) {
                 let batter1Name = '', batter2Name = '';
                 while (!batter1Name) { batter1Name = prompt(`Enter name for opening batter 1 (Striker) for ${currentInning.teamName}:`)?.trim(); }
                 while (!batter2Name || batter2Name.toLowerCase() === batter1Name.toLowerCase()) {
                     batter2Name = prompt(`Enter name for opening batter 2 (Non-Striker) for ${currentInning.teamName}:`)?.trim();
                     if (batter2Name && batter2Name.toLowerCase() === batter1Name.toLowerCase()) { alert("Non-striker name must be different from striker."); }
                 }
                 // Reset batters array for the current innings before adding new ones
                  currentInning.batters = [
                      { name: batter1Name, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, outMethod: '' },
                      { name: batter2Name, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, outMethod: '' }
                  ];
                  matchState.currentStrikerIndex = 0;
                  matchState.currentNonStrikerIndex = 1;
                  addCommentary(`${batter1Name} and ${batter2Name} are opening the innings for ${currentInning.teamName}. ${batter1Name} is on strike.`);
             }

             // Initialize Bowler if needed
             if (matchState.currentBowlerIndex === -1) {
                  let bowlerName = '';
                  while (!bowlerName) { bowlerName = prompt(`Enter name for the first bowler for ${matchState.bowlingTeam}:`)?.trim(); }
                  let existingBowlerIndex = currentInning.bowlers.findIndex(b => b.name.toLowerCase() === bowlerName.toLowerCase());
                  if (existingBowlerIndex !== -1) {
                      matchState.currentBowlerIndex = existingBowlerIndex;
                  } else {
                      currentInning.bowlers.push({ name: bowlerName, overs: 0, ballsBowled: 0, maidens: 0, runsConceded: 0, wickets: 0 });
                      matchState.currentBowlerIndex = currentInning.bowlers.length - 1;
                  }
                  addCommentary(`${getCurrentBowler().name} will open the bowling.`);
                  // Initialize over counters
                  runsThisOver = 0;
                  wicketsThisOver = 0;
                  currentInning.currentOverEvents = [];
             }
             saveMatchState(); // Save state after potentially adding players
        };

        // --- Event Handler Functions ---

        const handleRun = (runs) => {
             if (matchState.matchOver) return;
             const striker = getStriker();
             if (!striker) return;
             addCommentary(`${runs} run(s) scored by ${striker.name}.`);
             processBall(true, runs, 0, false, '', String(runs));
             rotateStrike(runs);
        };

         const handleExtra = (type) => {
             if (matchState.matchOver) return;
             const currentInning = getCurrentInning();
             const bowler = getCurrentBowler();
             if (!bowler) return;
             let commentary = '', eventString = '';

             switch (type) {
                 case 'Wd':
                     currentInning.extras.wides += 1; currentInning.extras.total += 1; commentary = `Wide bowled by ${bowler.name}.`; eventString = 'Wd'; processBall(false, 0, 1, false, '', eventString);
                     break;
                 case 'Nb':
                     currentInning.extras.noballs += 1; currentInning.extras.total += 1;
                     let runsOnNb = parseInt(prompt("Runs scored OFF THE BAT on No Ball? (Enter 0 if none)", "0")) || 0; runsOnNb = Math.max(0, Math.min(6, runsOnNb)); // Clamp 0-6
                     commentary = `No Ball bowled by ${bowler.name}.`; eventString = 'Nb'; if(runsOnNb > 0) { commentary += ` ${runsOnNb} run(s) scored.`; eventString += `+${runsOnNb}`; } commentary += " Free hit next ball!"; // Add free hit info
                     processBall(false, runsOnNb, 1, false, '', eventString); // Not legal, batter gets runs, 1 extra run penalty
                     // TODO: Implement free hit state tracking if desired
                     break;
                 case 'B': case 'Lb':
                     let byeRuns = parseInt(prompt(`How many ${type === 'B' ? 'Byes' : 'Leg Byes'}? (1-4)`, "1")) || 1; byeRuns = Math.max(1, Math.min(4, byeRuns));
                     if (type === 'B') currentInning.extras.byes += byeRuns; else currentInning.extras.legbyes += byeRuns;
                     currentInning.extras.total += byeRuns; commentary = `${byeRuns} ${type === 'B' ? 'Bye' : 'Leg Bye'}(s).`; eventString = `${byeRuns}${type}`;
                     processBall(true, 0, byeRuns, false, '', eventString); // Legal delivery, only extra runs
                     rotateStrike(byeRuns);
                     break;
             }
             addCommentary(commentary);
        };

        const handleWicket = () => {
            if (matchState.matchOver) return;
            const wicketMethod = prompt("Enter wicket method (e.g., Caught, Bowled, LBW, Stumped):", "Caught")?.trim();
             if (!wicketMethod) return; // User cancelled
             processBall(true, 0, 0, true, wicketMethod, 'W');
        };

        const handleRunOut = () => {
             if (matchState.matchOver) return;
             const currentInning = getCurrentInning();
             const bowler = getCurrentBowler();
             if (!bowler) return;

             let completedRuns = parseInt(prompt("Runs completed before Run Out? (0-4)", "0")); completedRuns = isNaN(completedRuns) ? 0 : Math.max(0, Math.min(4, completedRuns));
             let whoOutInput = prompt("Who got out? Enter 'S' for Striker, 'N' for Non-Striker:", "S").toUpperCase();
             let dismissedBatterIndex = (whoOutInput === 'N') ? matchState.currentNonStrikerIndex : matchState.currentStrikerIndex;

             if(dismissedBatterIndex === -1 || !currentInning.batters[dismissedBatterIndex]){ console.error("Invalid batter index for run out."); return; }

             const dismissedBatter = currentInning.batters[dismissedBatterIndex];
             if (dismissedBatter.isOut) { alert(`${dismissedBatter.name} is already out.`); return; } // Prevent marking out twice

             dismissedBatter.isOut = true; dismissedBatter.outMethod = 'Run Out';
             currentInning.wickets += 1; wicketsThisOver += 1; // Update wicket counts

             addCommentary(`RUN OUT! ${dismissedBatter.name} is run out attempting run ${completedRuns + 1}.`);

             // Update score with COMPLETED runs
             currentInning.score += completedRuns; runsThisOver += completedRuns;

             // Ball Count: Assume legal delivery for simplicity
             const isLegal = true;
             if (isLegal) {
                 currentInning.ballsBowledThisOver += 1; bowler.ballsBowled += 1;
                 const striker = getStriker(); if (striker) striker.balls += 1; // Striker always faces the ball initially
             }

              // Add event string for over progress
             if (!currentInning.currentOverEvents) currentInning.currentOverEvents = [];
             currentInning.currentOverEvents.push(`${completedRuns}RO`);

             // Handle new batter AFTER all updates for the ball are done
             newBatter(true, dismissedBatterIndex);
             if (matchState.matchOver || currentInning.wickets >= 10) return; // Check if innings/match ended

             // Rotate strike based on COMPLETED runs
             if (completedRuns % 2 !== 0) { rotateStrike(1); }

             // Check end of over/match
             if (isLegal && currentInning.ballsBowledThisOver >= 6) { endOfOver(); }
             else { checkMatchEnd(); }
        };

        // --- Central Event Listener for Scoring Buttons ---
        const handleScoreButtonClick = (event) => {
            if (!matchState || matchState.matchOver) return; // Don't process if match ended
            if (event.target.classList.contains('scoring-button')) {
                const eventType = event.target.dataset.eventType;
                const value = event.target.dataset.value;
                switch (eventType) {
                    case 'run': handleRun(parseInt(value)); break;
                    case 'extra': handleExtra(value); break;
                    case 'wicket': handleWicket(); break;
                    case 'run_out': handleRunOut(); break;
                    default: console.warn("Unknown event type:", eventType); return;
                }
                // Update display and save state AFTER processing the event, unless match ended
                 if (!matchState.matchOver) {
                    updateLiveDisplay();
                    saveMatchState();
                 }
            }
        };

        // Attach the listener using event delegation
        scoringControlsDiv.addEventListener('click', handleScoreButtonClick);

        // --- Update Live Display Function (Refined) ---
        const updateLiveDisplay = () => {
             if (!matchState) return;
             const currentInning = getCurrentInning();
             const battingTeam = matchState.battingTeam;
             const bowlingTeam = matchState.bowlingTeam;

             // Score Header
             let scoreString = `${battingTeam} ${currentInning.score}/${currentInning.wickets}`;
             let oversDisplay = `(${currentInning.oversBowled}.${currentInning.ballsBowledThisOver})`;
             scoreString += ` ${oversDisplay}`;
             if (matchState.currentInnings === 1) { scoreString += ` vs ${bowlingTeam}`; runRatesDiv.style.display = 'none'; }
             else { const fi = matchState.innings[1]; scoreString += ` vs ${bowlingTeam} ${fi.score}/${fi.wickets} (${formatOvers((fi.oversBowled * 6) + fi.ballsBowledThisOver)}) Target: ${matchState.target}`; runRatesDiv.style.display = 'block'; const totalOvers = currentInning.oversBowled + (currentInning.ballsBowledThisOver / 6); currentRunRateSpan.textContent = totalOvers > 0 ? (currentInning.score / totalOvers).toFixed(2) : '0.00'; const runsNeeded = matchState.target - currentInning.score; const ballsRem = (matchState.totalOvers * 6) - ((currentInning.oversBowled * 6) + currentInning.ballsBowledThisOver); requiredRunRateSpan.textContent = ballsRem > 0 && runsNeeded > 0 ? ((runsNeeded / ballsRem) * 6).toFixed(2) : (runsNeeded <= 0 ? '0.00' : (ballsRem <= 0 ? '∞' : '0.00')); } // Handle RRR edge cases
             scoreDisplay.textContent = scoreString;

             // Batting Table
             const striker = getStriker(); const nonStriker = getNonStriker();
             if (striker) { strikerNameTd.textContent = striker.name; strikerStatusSpan.textContent = '*'; strikerRunsTd.textContent = striker.runs; strikerBallsTd.textContent = striker.balls; strikerFoursTd.textContent = striker.fours; strikerSixesTd.textContent = striker.sixes; strikerSRTd.textContent = calculateStrikeRate(striker.runs, striker.balls); }
             else { strikerNameTd.textContent = '-'; strikerStatusSpan.textContent = ''; strikerRunsTd.textContent = '-'; strikerBallsTd.textContent = '-'; strikerFoursTd.textContent = '-'; strikerSixesTd.textContent = '-'; strikerSRTd.textContent = '-';}
             if (nonStriker) { nonStrikerNameTd.textContent = nonStriker.name; nonStrikerStatusSpan.textContent = ''; nonStrikerRunsTd.textContent = nonStriker.runs; nonStrikerBallsTd.textContent = nonStriker.balls; nonStrikerFoursTd.textContent = nonStriker.fours; nonStrikerSixesTd.textContent = nonStriker.sixes; nonStrikerSRTd.textContent = calculateStrikeRate(nonStriker.runs, nonStriker.balls); }
             else { nonStrikerNameTd.textContent = '-'; nonStrikerStatusSpan.textContent = ''; nonStrikerRunsTd.textContent = '-'; nonStrikerBallsTd.textContent = '-'; nonStrikerFoursTd.textContent = '-'; nonStrikerSixesTd.textContent = '-'; nonStrikerSRTd.textContent = '-';}


             // Bowling Table
             const bowler = getCurrentBowler();
             if (bowler) { currentBowlerNameTd.textContent = bowler.name; bowlerOversTd.textContent = formatOvers(bowler.ballsBowled); bowlerMaidensTd.textContent = bowler.maidens; bowlerRunsTd.textContent = bowler.runsConceded; bowlerWicketsTd.textContent = bowler.wickets; bowlerEconomyTd.textContent = calculateEconomy(bowler.runsConceded, bowler.ballsBowled); }
             else { currentBowlerNameTd.textContent = '-'; bowlerOversTd.textContent = '-'; bowlerMaidensTd.textContent = '-'; bowlerRunsTd.textContent = '-'; bowlerWicketsTd.textContent = '-'; bowlerEconomyTd.textContent = '-'; }

             // Over Progress
             overProgressSpan.textContent = (currentInning.currentOverEvents || []).join(' ');

             // Commentary
             commentaryDisplayDiv.innerHTML = ''; (currentInning.commentaryLog || []).forEach(line => { const p = document.createElement('p'); p.textContent = line; commentaryDisplayDiv.appendChild(p); }); commentaryDisplayDiv.scrollTop = commentaryDisplayDiv.scrollHeight;

            // Disable controls if match is over
            if (matchState.matchOver) {
                scoringControlsDiv.style.pointerEvents = 'none';
                scoringControlsDiv.style.opacity = '0.5';
            }
        };

        // --- Navigation ---
        gotoScorecardButton.addEventListener('click', () => { window.location.href = 'scorecard.html'; });

        // --- Initial Setup for Live Page ---
        if (!matchState.matchOver) { initializePlayers(); } // Prompt only if match not already over
        updateLiveDisplay(); // Populate the page

    }
    // --- End of Live Match Page Logic ---


    // --- Scorecard Page Logic ---
    const scorecardContainer = document.getElementById('scorecardContainer');
    if (scorecardContainer) { // Check if on scorecard.html

        // Redirect if state is missing
        if (!matchState) { alert("No match data found. Redirecting to setup."); window.location.href = 'setup.html'; return; }

        // Get References
        const gotoLiveButton = document.getElementById('gotoLiveButton');
        const innings1Section = document.getElementById('innings1Section'), innings1Title = document.getElementById('innings1Title'), innings1BattingTableBody = document.querySelector('#innings1BattingTable tbody'), innings1Extras = document.getElementById('innings1Extras'), innings1TotalScore = document.getElementById('innings1TotalScore'), innings1BowlingTableBody = document.querySelector('#innings1BowlingTable tbody'), innings1Fow = document.getElementById('innings1Fow');
        const innings2Section = document.getElementById('innings2Section'), innings2Title = document.getElementById('innings2Title'), innings2BattingTableBody = document.querySelector('#innings2BattingTable tbody'), innings2Extras = document.getElementById('innings2Extras'), innings2TotalScore = document.getElementById('innings2TotalScore'), innings2BowlingTableBody = document.querySelector('#innings2BowlingTable tbody'), innings2Fow = document.getElementById('innings2Fow');

        // Function to Render Scorecard
        const renderScorecard = () => {
             if (!matchState) return;
             // Innings 1
             const innings1 = matchState.innings[1];
             innings1Title.textContent = `Innings 1: ${innings1.teamName}`;
             innings1BattingTableBody.innerHTML = ''; innings1BowlingTableBody.innerHTML = '';
             innings1.batters.forEach(b => { const sr = calculateStrikeRate(b.runs, b.balls); let dis = b.isOut ? (b.outMethod || 'Out') : 'Not Out'; const r = innings1BattingTableBody.insertRow(); r.innerHTML = `<td>${b.name}</td><td>${dis}</td><td>${b.runs}</td><td>${b.balls}</td><td>${b.fours}</td><td>${b.sixes}</td><td>${sr}</td>`; });
             innings1.bowlers.forEach(b => { if (b.ballsBowled > 0) { const o = formatOvers(b.ballsBowled); const e = calculateEconomy(b.runsConceded, b.ballsBowled); const r = innings1BowlingTableBody.insertRow(); r.innerHTML = `<td>${b.name}</td><td>${o}</td><td>${b.maidens}</td><td>${b.runsConceded}</td><td>${b.wickets}</td><td>${e}</td>`; } });
             const e1 = innings1.extras; innings1Extras.textContent = `${e1.total} (Wd ${e1.wides}, Nb ${e1.noballs}, B ${e1.byes}, Lb ${e1.legbyes})`; innings1TotalScore.textContent = `${innings1.score}/${innings1.wickets} (${formatOvers((innings1.oversBowled*6)+innings1.ballsBowledThisOver)} ov)`;
             let fow1Str = innings1.fallOfWickets.map(f => `${f.score}/${f.wickets} (${f.batterName}, ${f.atOver.toFixed(1)} ov)`).join(', '); innings1Fow.textContent = fow1Str || 'No wickets fell.';

             // Innings 2 (Conditional)
             if (matchState.currentInnings === 2 || matchState.matchOver) {
                 innings2Section.style.display = 'block'; const innings2 = matchState.innings[2]; innings2Title.textContent = `Innings 2: ${innings2.teamName}`;
                 innings2BattingTableBody.innerHTML = ''; innings2BowlingTableBody.innerHTML = '';
                 innings2.batters.forEach(b => { const sr = calculateStrikeRate(b.runs, b.balls); let dis = b.isOut ? (b.outMethod || 'Out') : 'Not Out'; const r = innings2BattingTableBody.insertRow(); r.innerHTML = `<td>${b.name}</td><td>${dis}</td><td>${b.runs}</td><td>${b.balls}</td><td>${b.fours}</td><td>${b.sixes}</td><td>${sr}</td>`; });
                 innings2.bowlers.forEach(b => { if (b.ballsBowled > 0) { const o = formatOvers(b.ballsBowled); const e = calculateEconomy(b.runsConceded, b.ballsBowled); const r = innings2BowlingTableBody.insertRow(); r.innerHTML = `<td>${b.name}</td><td>${o}</td><td>${b.maidens}</td><td>${b.runsConceded}</td><td>${b.wickets}</td><td>${e}</td>`; } });
                 const e2 = innings2.extras; innings2Extras.textContent = `${e2.total} (Wd ${e2.wides}, Nb ${e2.noballs}, B ${e2.byes}, Lb ${e2.legbyes})`; innings2TotalScore.textContent = `${innings2.score}/${innings2.wickets} (${formatOvers((innings2.oversBowled*6)+innings2.ballsBowledThisOver)} ov)`;
                 let fow2Str = innings2.fallOfWickets.map(f => `${f.score}/${f.wickets} (${f.batterName}, ${f.atOver.toFixed(1)} ov)`).join(', '); innings2Fow.textContent = fow2Str || (innings2.score === 0 && innings2.wickets === 0 ? 'Yet to bat.' : 'No wickets fell.');
             } else { innings2Section.style.display = 'none'; }
        };

        // Navigation
        gotoLiveButton.addEventListener('click', () => { window.location.href = 'live.html'; });
        // Initial Render
        renderScorecard();
    }
    // --- End of Scorecard Page Logic ---


    // --- Summary Page Logic ---
    const summaryContainer = document.getElementById('summaryContainer');
    if (summaryContainer) { // Check if on summary.html

        // Redirect if state missing or match not over
        if (!matchState) { alert("No match data found. Redirecting to setup."); window.location.href = 'setup.html'; return; }
        if (!matchState.matchOver) { alert("Match is not yet complete. Redirecting to live scoring."); window.location.href = 'live.html'; return; }

        // Get References
        const matchResultDiv = document.getElementById('matchResult');
        const finalScore1P = document.getElementById('finalScore1');
        const finalScore2P = document.getElementById('finalScore2');
        const resetMatchButton = document.getElementById('resetMatchButton');

        // Function to Populate Summary
        const populateSummary = () => {
            if (!matchState || !matchState.matchOver) return;
            const resultPara = matchResultDiv.querySelector('p') || matchResultDiv;
             resultPara.textContent = matchState.resultDescription || "Match result unavailable.";
            // Style result display
            matchResultDiv.classList.remove('winner', 'tie');
            if (matchState.winner && matchState.winner !== 'Tie') matchResultDiv.classList.add('winner');
            else if (matchState.winner === 'Tie') matchResultDiv.classList.add('tie');
            // Display final scores
             const i1 = matchState.innings[1], i2 = matchState.innings[2];
             finalScore1P.textContent = `${i1.teamName}: ${i1.score}/${i1.wickets} (${formatOvers((i1.oversBowled*6)+i1.ballsBowledThisOver)} ov)`;
             finalScore2P.textContent = `${i2.teamName}: ${i2.score}/${i2.wickets} (${formatOvers((i2.oversBowled*6)+i2.ballsBowledThisOver)} ov)`;
        };

        // Function to Handle Reset
        const handleResetMatch = () => {
            if (confirm("Are you sure you want to start a new match? All current match data will be cleared.")) {
                localStorage.removeItem('currentMatchState');
                window.location.href = 'setup.html';
            }
        };

        // Add Listener
        resetMatchButton.addEventListener('click', handleResetMatch);
        // Initial Population
        populateSummary();
    }
    // --- End of Summary Page Logic ---

}); // End of DOMContentLoaded listener