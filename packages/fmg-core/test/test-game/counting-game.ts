import { CountingGame } from '../../src/test-game/counting-game';
import assertRevert from '../helpers/assert-revert';

import { Channel, State } from '../../src';

var StateLib = artifacts.require("./State.sol");
var CountingStateContract = artifacts.require("./CountingState.sol");
var CountingGameContract = artifacts.require("./CountingGame.sol");
// enum names aren't supported in ABI, so have to use integers for time being
const START = 0;
const CONCLUDED = 1;

contract('CountingGame', (accounts) => {
  let game, state0, state1, stateBalChange;

  before(async () => {
    CountingStateContract.link(StateLib);
    let stateContract = await CountingStateContract.new();
    CountingGameContract.link("CountingState", stateContract.address);
    game = await CountingGameContract.new();
    let channel = new Channel(game.address, 0, [accounts[0], accounts[1]]);

    let defaults = { channel: channel, resolution: [5, 4] };

    state0 = CountingGame.gameState({...defaults, turnNum: 6, gameCounter: 1});
    state1 = CountingGame.gameState({...defaults, turnNum: 7, gameCounter: 2});

    stateBalChange = CountingGame.gameState({
      ...defaults,
      resolution: [6, 3],
      turnNum: 7,
      gameCounter: 2
    });
  });

  // Transition fuction tests
  // ========================

  it("allows a move where the count increment", async () => {
    var output = await game.validTransition.call(state0.toHex(), state1.toHex());
    assert.equal(output, true);
  });

  // it("allows START -> CONCLUDED if totals match", async () => {
  //   var output = await game.validTransition.call(start, allowedConcluded);
  //   assert.equal(output, true);
  // });

  it("doesn't allow transitions if totals don't match", async () => {
    await assertRevert(game.validTransition.call(state0.toHex(), stateBalChange.toHex()));
  });
});
