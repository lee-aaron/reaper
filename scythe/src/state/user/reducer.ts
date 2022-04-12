import { createReducer } from '@reduxjs/toolkit'
import { updateUserDarkMode, updateMatchesDarkMode, updateLogIn } from './actions'

const currentTimestamp = () => new Date().getTime()

export interface UserState {
  matchesDarkMode: boolean // whether the dark mode media query matches

  userDarkMode: boolean | null // the user's choice for dark mode or light mode

  loggedIn: boolean // whether the user is logged in

  timestamp: number
}

export const initialState: UserState = {
  matchesDarkMode: false,
  userDarkMode: null,
  loggedIn: false,
  timestamp: currentTimestamp(),
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateUserDarkMode, (state, action) => {
      state.userDarkMode = action.payload.userDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateMatchesDarkMode, (state, action) => {
      state.matchesDarkMode = action.payload.matchesDarkMode
      state.timestamp = currentTimestamp()
    })
    .addCase(updateLogIn, (state, action) => {
      state.loggedIn = action.payload.logIn
      state.timestamp = currentTimestamp()
    })
)