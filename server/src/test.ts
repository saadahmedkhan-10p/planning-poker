import { RoomManager } from './roomManager.js';

function runTests() {
  console.log('🧪 Starting Automated AgilePoint Planning Poker Tests...');
  const manager = new RoomManager();

  // 1. Create Room
  const room = manager.createRoom('Sprint 101 Pointing', {
    deckType: 'fibonacci',
    autoReveal: true
  }, 'test-sprint-101');

  if (room.id !== 'test-sprint-101') throw new Error('Failed to set custom room ID');
  console.log('✓ Room creation passed');

  // 2. Add Participants
  const p1 = manager.joinRoom(room.id, { id: 'u1', name: 'Alice', role: 'facilitator' }).participant;
  const p2 = manager.joinRoom(room.id, { id: 'u2', name: 'Bob', role: 'estimator' }).participant;
  const p3 = manager.joinRoom(room.id, { id: 'u3', name: 'Charlie', role: 'estimator' }).participant;
  const p4 = manager.joinRoom(room.id, { id: 'u4', name: 'Dana', role: 'observer' }).participant;

  if (room.facilitatorId !== 'u1') throw new Error('Facilitator ID mismatch');
  if (p4.role !== 'observer') throw new Error('Observer role mismatch');
  console.log('✓ Participants joining and role assignment passed');

  // 3. Backlog Management
  manager.addStory(room.id, {
    title: 'AUTH-1: Implement JWT Refresh Tokens',
    description: 'Security enhancement for session handling'
  });

  const activeStory = room.stories.find(s => s.status === 'active');
  if (!activeStory) throw new Error('Active story missing');
  console.log('✓ Story creation and backlog assignment passed');

  // 4. Voting Flow
  manager.castVote(room.id, 'u1', '5');
  manager.castVote(room.id, 'u2', '5');
  // u3 vote should trigger autoReveal because all connected estimators (u1, u2, u3) have now voted!
  const res3 = manager.castVote(room.id, 'u3', '8');

  if (!res3.shouldAutoReveal) throw new Error('Auto-reveal failed to trigger when all estimators voted');
  if (!room.isRevealed) throw new Error('Room is not marked revealed after auto-reveal');
  console.log('✓ Voting and auto-reveal logic passed');

  // 5. Statistics Calculation
  const stats = manager.calculateStats(room);
  console.log('Calculated Stats:', stats);

  // Votes: 5, 5, 8. Sum = 18, Avg = 6.0, Mode = 5, Median = 5
  if (stats.average !== 6) throw new Error(`Average expected 6, got ${stats.average}`);
  if (stats.mode !== '5') throw new Error(`Mode expected 5, got ${stats.mode}`);
  if (stats.median !== '5') throw new Error(`Median expected 5, got ${stats.median}`);
  if (stats.agreementPercent !== 67) throw new Error(`Agreement expected 67%, got ${stats.agreementPercent}`);
  if (!stats.outliers?.lowestVoters?.includes('Alice') || !stats.outliers?.highestVoters?.includes('Charlie')) {
    throw new Error('Outlier detection failed');
  }
  console.log('✓ Consensus stats, average, mode, median, and outlier detection passed');

  // 6. Reset Round
  manager.resetVotes(room.id);
  if (room.isRevealed) throw new Error('Reset failed: room still revealed');
  if (p1.voted || p2.voted || p3.voted) throw new Error('Reset failed: votes not cleared');
  console.log('✓ Reset round passed');

  console.log('\n🎉 ALL 6 AUTOMATED TESTS PASSED SUCCESSFULLY!');
}

runTests();
