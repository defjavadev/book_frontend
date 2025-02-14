import { createAction, props } from "@ngrx/store";
import { BookData } from "../../alldata";

export interface UserState {
    _id: string;
    token: string;
    name: string;
    username: string;
    role: string;
    image?: string | null;
}

export const storeBookAction = createAction(
    '[Books] Store books data',
    props<{ product: BookData[] }>()
);

export const addCartAction = createAction(
    '[Cart] Add proudct to cart',
    props<{ product: BookData[] }>()
);

export const loginAction = createAction(
    '[Auth] Login',
    props<{ item: UserState }>()
);

export const logoutAction = createAction('[Auth] Logout');