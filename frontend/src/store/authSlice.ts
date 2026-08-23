import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: any
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<any>) => {
      state.user = action.payload
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload
    },
  },
})

export const { login, logout, setUser } = authSlice.actions
export default authSlice.reducer
