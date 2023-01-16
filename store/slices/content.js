const initialState = {
  selectedFile: {},
  selectedFolder: {},
}

const content = RTK.createSlice({
  name: 'content',
  initialState,
  reducers: {
    setSelectedFile: (state, {payload}) => {
      state.selectedFile = {...payload}
    },
    setSelectedFolder: (state, {payload}) => {
      state.selectedFolder = {...payload}
    },
  },
})

export const {setSelectedFile, setSelectedFolder} = content.actions
export default content.reducer
