import { assign } from 'lodash';
import { handleActions, Action } from 'redux-actions';

import { ShopContent, IState } from './model';
import {
  SHOW_PAYMENT_OPTIONS
} from './constants/ActionTypes';

const initialState: IState = <ShopContent>{
  items: [],
  isBasketVisible: false
};

export default handleActions<IState, ShopContent>(
  {
    [SHOW_PAYMENT_OPTIONS]: (state: IState, action: Action<ShopContent>): IState => {
      const newState = {
        ...state
      }
      newState.isBasketVisible = true

      return newState;
    }
  },
  initialState
)
