const initialState = {
  activeUser: null,
  activeDomain: null,
}

const user = RTK.createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveUser: (state, {payload}) => {
      state.activeUser = {...payload}
    },
    clearActiveUser: (state, {payload}) => {
      state.activeUser = payload
    },
    setActiveDomain: (state, {payload}) => {
      state.activeDomain = {...payload}
    },
    setUserInitialState: (state, {payload}) => {
      state.activeDomain = {...payload.activeDomain}
      state.activeUser = {...payload.user}
    },
  },
})

export const {setActiveUser, clearActiveUser, setActiveDomain, setUserInitialState} = user.actions
export default user.reducer
