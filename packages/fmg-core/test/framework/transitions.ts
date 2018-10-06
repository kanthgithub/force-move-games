import assertRevert from '../helpers/assert-revert';

import { CountingGame } from '../../src/test-game/counting-game';
import { Channel, State } from '../../src';

const StateLib = artifacts.require("./State.sol");
const Rules = artifacts.require("./Rules.sol");
const CountingStateContract = artifacts.require("../test-game/contracts/CountingState.sol");
const CountingGameContract = artifacts.require("../test-game/contracts/CountingGame.sol");

contract('Rules', (accounts) => {
    let channel;
    let otherChannel;
    let defaults;
    let framework;
    const resolution = [12, 13];
    const otherResolution = [10, 15];

    let fromState;
    let toState;

    before(async () => {
        framework = await Rules.deployed();

        CountingStateContract.link(StateLib);
        const stateContract = await CountingStateContract.new();
        CountingGameContract.link("CountingState", stateContract.address);
        const gameContract = await CountingGameContract.new();

        channel = new Channel(gameContract.address, 0, [accounts[0], accounts[1]]);
        otherChannel = new Channel(gameContract.address, 1, [accounts[0], accounts[1]]);

        defaults = { channel, resolution, gameCounter: 0};
    });


    const validTransition = async (state1, state2) => {
        return await framework.validTransition(state1.toHex(), state2.toHex());
    };

    describe("preFundSetup -> preFundSetup", () => {
        beforeEach(() => {
            fromState = CountingGame.preFundSetupState({ ...defaults, turnNum: 0, stateCount: 0 });
            toState = CountingGame.preFundSetupState({ ...defaults, turnNum: 1, stateCount: 1 });
        });

        it("allows a valid transition", async () => {
            assert(await validTransition(fromState, toState));
        });

        it("rejects a transition where the turnNum doesn't increment", async () => {
            toState.turnNum = fromState.turnNum;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects any transition where the channel changes", async () => {
            toState.channel = otherChannel;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the balances changes", async () => {
            toState.resolution = otherResolution;
            await assertRevert(validTransition(fromState, toState));
        });
        it("rejects a transition where the count doesn't increment", async () => {
            toState.stateCount = fromState.stateCount;
            await assertRevert(validTransition(fromState, toState));
        });
        it("rejects a transition where the game attributes changes", async () => {
            toState.gameCounter = 45;
            await assertRevert(validTransition(fromState, toState));
        });
    });


    describe("preFundSetup -> PostFundSetup", () => {
        beforeEach(() => {
            fromState = CountingGame.preFundSetupState({ ...defaults, turnNum: 1, stateCount: 1 });
            toState = CountingGame.PostFundSetupState({ ...defaults, turnNum: 2, stateCount: 0 });
        });

        it("allows a valid transition", async() => {
            assert(await validTransition(fromState, toState));
        });

        it("rejects a transition where the turnNum doesn't increment", async () => {
            toState.turnNum = fromState.turnNum;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects any transition where the channel changes", async () => {
            toState.channel = otherChannel;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition not from the last preFundSetup state", async() => {
            fromState.stateCount = 0;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the balances changes", async() => {
            toState.resolution = otherResolution;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the count doesn't reset", async() => {
            toState.stateCount = 2;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the position changes", async() => {
            toState.gameCounter = 45;
            await assertRevert(validTransition(fromState, toState));
        });
    });

    describe("preFundSetup -> conclude", () => {
        beforeEach(() => {
            fromState = CountingGame.preFundSetupState({ ...defaults, turnNum: 1, stateCount: 1 });
            toState = CountingGame.concludeState({ ...defaults, turnNum: 2 });
        });

        it("allows a valid transition", async () => {
            assert(await validTransition(fromState, toState));
        });

        it("rejects a transition where the turnNum doesn't increment", async () => {
            toState.turnNum = fromState.turnNum;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects any transition where the channel changes", async () => {
            toState.channel = otherChannel;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the balances changes", async () => {
            toState.resolution = otherResolution;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition not from the last preFundSetup state", async () => {
            fromState.stateCount = 0;
            await assertRevert(validTransition(fromState, toState));
        });
    });

    describe("PostFundSetup -> PostFundSetup", () => {
        beforeEach(() => {
            fromState = CountingGame.PostFundSetupState({ ...defaults, turnNum: 1, stateCount: 0 });
            toState = CountingGame.PostFundSetupState({ ...defaults, turnNum: 2, stateCount: 1 });
        });

        it("allows a valid transition", async () => {
            assert(await validTransition(fromState, toState));
        });

        it("rejects a transition where the turnNum doesn't increment", async () => {
            toState.turnNum = fromState.turnNum;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects any transition where the channel changes", async () => {
            toState.channel = otherChannel;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the balances changes", async () => {
            toState.resolution = otherResolution;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the count doesn't reset", async () => {
            toState.stateCount = 2;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition from the last PostFundSetup state", async () => {
            fromState.stateCount = 1;
            await assertRevert(validTransition(fromState, toState));
        });
    });


    describe("PostFundSetup -> conclude", () => {
        beforeEach(() => {
            fromState = CountingGame.PostFundSetupState({ ...defaults, turnNum: 1, stateCount: 0 });
            toState = CountingGame.concludeState({ ...defaults, turnNum: 2 });
        });

        it("rejects a transition where the turnNum doesn't increment", async () => {
            toState.turnNum = fromState.turnNum;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects any transition where the channel changes", async () => {
            toState.channel = otherChannel;
            await assertRevert(validTransition(fromState, toState));
        });

        it("allows a valid transition", async() => {
            assert(await validTransition(fromState, toState));
        });

        it("rejects a transition where the balances changes", async () => {
            toState.resolution = otherResolution;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition from the last PostFundSetup state", async () => {
            fromState.stateCount = 1;
            await assertRevert(validTransition(fromState, toState));
        });
    });

    describe("PostFundSetup -> game", () => {
        beforeEach(() => {
            fromState = CountingGame.PostFundSetupState({ ...defaults, turnNum: 1, stateCount: 1, gameCounter: 3 });
            toState = CountingGame.gameState({ ...defaults, turnNum: 2, gameCounter: 4 });
        });

        it("allows a valid transition", async() => {
            assert(await validTransition(fromState, toState));
        });

        it("rejects a transition where the turnNum doesn't increment", async () => {
            toState.turnNum = fromState.turnNum;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects any transition where the channel changes", async () => {
            toState.channel = otherChannel;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition not from the last PostFundSetup state", async () => {
            fromState.stateCount = 0;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the game rules are broken", async() => {
            toState.gameCounter = 2; // game specifies that counter must increment
            await assertRevert(validTransition(fromState, toState));
        });
    });

    describe("game -> game", () => {
        beforeEach(() => {
            fromState = CountingGame.gameState({ ...defaults, turnNum: 1, gameCounter: 3 });
            toState = CountingGame.gameState({ ...defaults, turnNum: 2, gameCounter: 4 });
        });

        it("allows a valid transition", async() => {
            assert(await validTransition(fromState, toState));
        });

        it("rejects a transition where the turnNum doesn't increment", async () => {
            toState.turnNum = fromState.turnNum;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects any transition where the channel changes", async () => {
            toState.channel = otherChannel;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the game rules are broken", async() => {
            toState.gameCounter = 2; // game specifies that counter must increment
            await assertRevert(validTransition(fromState, toState));
        });
    });

    describe("game -> conclude", () => {
        beforeEach(() => {
            fromState = CountingGame.gameState({ ...defaults, turnNum: 1, gameCounter: 3 });
            toState = CountingGame.concludeState({ ...defaults, turnNum: 2 });
        });

        it("allows a valid transition", async() => {
            assert(await validTransition(fromState, toState));
        });

        it("rejects a transition where the turnNum doesn't increment", async () => {
            toState.turnNum = fromState.turnNum;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects any transition where the channel changes", async () => {
            toState.channel = otherChannel;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the balances changes", async () => {
            toState.resolution = otherResolution;
            await assertRevert(validTransition(fromState, toState));
        });
    });

    describe("conclude -> conclude", () => {
        beforeEach(() => {
            fromState = CountingGame.concludeState({ ...defaults, turnNum: 1 });
            toState = CountingGame.concludeState({ ...defaults, turnNum: 2 });
        });

        it("allows a valid transition", async() => {
            assert(await validTransition(fromState, toState));
        });

        it("rejects a transition where the turnNum doesn't increment", async () => {
            toState.turnNum = fromState.turnNum;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects any transition where the channel changes", async () => {
            toState.channel = otherChannel;
            await assertRevert(validTransition(fromState, toState));
        });

        it("rejects a transition where the balances changes", async () => {
            toState.resolution = otherResolution;
            await assertRevert(validTransition(fromState, toState));
        });
    });
});
