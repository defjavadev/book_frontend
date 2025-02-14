import { createReducer, on } from '@ngrx/store';
import { UserState, addCartAction, loginAction, logoutAction, storeBookAction } from '../actions/app.action';
import { BookData } from '../../alldata';

export interface AppState {
  users: UserState | null;
  books: BookData[];
  cart: BookData[];
}

export const initialState: AppState = {
  users: null,
  books: [],
  cart: []
};

export const appReducer = createReducer(
  initialState,
  on(loginAction, (state, { item }) => ({
    ...state,
    users: item
  })),
  on(logoutAction, (state) => ({
    ...state,
    users: null
  })),
  on(storeBookAction, (state, { product }) => ({
    ...state,
    books: product
  })),
  on(addCartAction, (state, { product }) => ({
    ...state,
    cart: product
  }))
);
