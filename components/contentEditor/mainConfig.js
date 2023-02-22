const mainConfig = {
  // ? Editorun boyutu otomaik olarak bulunduğu contente sığması için.
  automaticLayout: true,

  wordWrap: true,
  formatOnPaste: true,

  readOnly: false,

  // ? Editor içeriği dolmadıkça scroll bar gözükmemesi için.
  wordWrapMinified: true,

  // ? Okların sürekli gözükmesi için.
  showFoldingControls: 'always',

  // ??
  wrappingIndent: 'indent',

  minimap: {enabled: true, showSlider: 'always', autohide: false, renderCharacters: true},

  // ? Parantezlerin otomatik kapatılması
  autoClosingBrackets: true,

  // ? Eşleşen parantezlere highlight
  matchBrackets: true,

  unicodeHighlight: {
    ambiguousCharacters: false,
    nonBasicASCII: false,
    allowedLocals: false,
  },

  scrollbar: {
    horizontal: 'auto',
    handleMouseWheel: true,
    alwaysConsumeMouseWheel: false,
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    verticalHasArrows: false,
    horizontalHasArrows: false,
  },
  scrollBeyondLastLine: false,

  fixedOverflowWidgets: true,
}

export default mainConfig
