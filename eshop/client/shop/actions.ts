import { createAction, Action } from 'redux-actions'
import { assign } from 'lodash'

import { ShopContent } from './model'

import {
  SHOW_PAYMENT_OPTIONS
} from './constants/ActionTypes';

const showPaymentOptions = createAction<void>(
  SHOW_PAYMENT_OPTIONS,
  () => {}
)

export {
  showPaymentOptions
}
