const initialState = {
  selectedFile: {},
  selectedFolder: {},
  previewWindows: [],
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
    addPreviewWindow: (state, {payload: {fileId, previewWindow}}) => {
      const isFileThere = state.previewWindows.find((previewWindow) => previewWindow.fileId === fileId)

      if (!isFileThere) {
        state.previewWindows = [...state.previewWindows, {fileId, previewWindow}]
        return
      }

      const index = state.previewWindows.findIndex((previewWindow) => previewWindow.fileId === fileId)
      state.previewWindows = state.previewWindows.splice(index, 1, isFileThere)
    },
    removePreviewWindow: (state, {payload: {fileId}}) => {
      state.previewWindows = state.previewWindows.filter((previewWindow) => previewWindow.fileId !== fileId)
    },
  },
})

export const {setSelectedFile, setSelectedFolder, addPreviewWindow, removePreviewWindow} = content.actions
export default content.reducer
