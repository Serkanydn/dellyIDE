const baseDependencyConfigs = [
  {
    label: 'include',
    documentation: '',
    insertText: '"@@include myspace/${1:}@@"',
  },
  {
    label: 'binding',
    documentation: '',
    insertText: '"{%${1:}%}"',
  },
  {
    label: 'state',
    documentation: '',
    insertText: '"{%${1:}%}"',
  },
  {
    label: 'binding_function',
    documentation: '',
    insertText: 'function state_func (){\n\t${1:}\n}',
  },
  {
    label: 'state_function',
    documentation: '',
    insertText: 'function state_func (){\n\t${1:}\n}',
  },
  {
    label: 'binding_scope',
    documentation: '',
    insertText: 'function state_scope (){\n\t${1:}\n}',
  },
  {
    label: 'state_scope',
    documentation: '',
    insertText: 'function state_scope (){\n\t${1:}\n}',
  },
  {
    label: 'define',
    documentation: '',
    insertText: 'define(function (require, exports, module) {\n\t${1:}\n});',
  },
  {
    label: 'require',
    documentation: '',
    insertText: "require('myspace/${1:}')",
  },
  {
    label: 'Validation Prop',
    documentation: '',
    insertText: 'dxValidation: {\n\tvalidationRules: [\n\t\t{ type: "${1:required }"}\n\t]\n}',
  },
  {
    label: 'Label Prop',
    documentation: '',
    insertText: 'dxLabel: "${1:}"',
  },
  {
    label: 'Value Prop',
    documentation: '',
    insertText: 'value: "{%${1:}%}"',
  },
  {
    label: 'Children Prop',
    documentation: '',
    insertText: 'uxChildren: {\n\t${1:}\n}',
  },
  //   {
  //     label: 'Textbox Field',
  //     documentation: '',
  //     insertText: '{\n\tdxLabel: "${1:}",\n\tuxPosition: "${2:}",\n\tuxType: "${3:}"\n}',
  //   },
]

const dependencyConfigs = [
  {
    language: 'javascript',
    configs: [...baseDependencyConfigs, ...setDevexpressKeys('javascript'), ...setDevexpressKeysStartWithDx('javascript')],
  },
  {
    language: 'json',
    configs: [...convertDependencyToJson(baseDependencyConfigs), ...setDevexpressKeys('json'), ...setDevexpressKeysStartWithDx('json')],
  },
]

function setDevexpressKeys(type) {
  const devExpressKeys = Object.keys(DevExpress.ui)
  return devExpressKeys.map((key) => ({
    label: type === 'json' ? `"${key.replace('dx', '')} Field"` : `${key.replace('dx', '')} Field`,
    documentation: '',
    insertText:
      type === 'json'
        ? '{\n\t"dxLabel": "${1:}",\n\t"uxPosition": "${2:}",\n\t"uxType": "${3:}"\n}'
        : '{\n\tuxType: ' + key + ',\n\tdxLabel: "${1:}",\n\tuxPosition: "${2:}"\n}',
  }))
}

function setDevexpressKeysStartWithDx(type) {
  const devExpressKeys = Object.keys(DevExpress.ui)
  return devExpressKeys.map((key) => ({
    label: type === 'json' ? `"${key}"` : key,
    documentation: '',
    insertText:
      type === 'json'
        ? '{\n\t"dxLabel": "${1:}",\n\t"uxPosition": "${2:}",\n\t"uxType": "${3:}"\n}'
        : '{\n\tuxType: "' + key + '",\n\tdxLabel: "${1:}",\n\tuxPosition: "${2:}"\n}',
  }))
}
function convertDependencyToJson(dependencies) {
  return dependencies.map((dependency) => {
    const jsonFormatLabel = `"${dependency.label}"`
    return {
      ...dependency,
      label: jsonFormatLabel,
    }
  })
}

function registerDependency() {
  dependencyConfigs.forEach((dependency) => {
    const {language, configs} = dependency

    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems(model, position) {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }
        return {
          suggestions: createDependencyProposals(configs, range),
        }
      },
    })
  })
}

function createDependencyProposals(configs, range) {
  return configs.map((config) => ({
    ...config,
    kind: monaco.languages.CompletionItemKind.Function,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
  }))
}

export {registerDependency}
