pragma solidity ^0.4.18;

import './CommonState.sol';
import './IncrementationState.sol';

contract IncrementationGame {
  using CommonState for bytes;
  using IncrementationState for bytes;

  // The following transitions are allowed:
  //
  // Start -> Final
  //
  function validTransition(bytes _old, bytes _new) public pure returns (bool) {
    if (_old.stateType() == IncrementationState.StateType.Start) {
      // regardless of whether we move to a Start or Final state, we must have:
      // 1. balances remain the same
      // 2. points must increase
      require(_new.aBal() == _old.aBal());
      require(_new.bBal() == _old.bBal());
      require(_new.points() == _old.points() + 1);

      return true;
    }

    revert();
  }

  // in this case the resolution function is pure, but it doesn't have to be in general
  function resolve(bytes _state) public pure returns (uint aBal, uint bBal) {
    aBal = _state.aBal();
    bBal = _state.bBal();
  }
}