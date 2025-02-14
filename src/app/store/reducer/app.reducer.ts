import { createReducer, on} from "@ngrx/store"
import { BookData } from "../../alldata"
import { UserState, addCartAction, loginAction, logoutAction, storeBookAction } from "../actions/app.action"

export interface State {
    books: BookData[],
    cart: BookData[],
    users: UserState | null
}

// Get initial state from localStorage
const getUserData = (): UserState | null => {
    try {
        const userData = localStorage.getItem('users');
        if (userData) {
            const parsedData = JSON.parse(userData);
            console.log('Initial state from localStorage:', parsedData);
            return parsedData;
        }
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('users');
    }
    return null;
};

const initialState: State = {
    books: [],
    cart: [], 
    users: getUserData()
}

export const Reducer = createReducer(
    initialState,
    on(storeBookAction, (state, action) => {
        console.log('Storing books:', action.product);
        return {...state, books: action.product}
    }),
    on(addCartAction, (state, action) => {
        console.log('Adding to cart:', action.product);
        return {...state, cart: action.product};
    }),
    on(loginAction, (state, action) => {
        console.log('Login action:', action.item);
        localStorage.setItem('users', JSON.stringify(action.item));
        return {...state, users: action.item}
    }),
    on(logoutAction, (state) => {
        console.log('Logout action');
        localStorage.removeItem('users');
        return {...state, users: null}
    })
)
