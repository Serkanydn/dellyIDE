class DevExtreme {
  removeRegisteredValidator(validator) {
    DevExpress.validationEngine.getGroupConfig().removeRegisteredValidator(validator)
  }

  registerValidator(validator) {
    DevExpress.validationEngine.getGroupConfig().registerValidator(validator)
  }

  registerValidators(validators) {
    validators.forEach((validator) => {
      this.registerValidator(validator)
    })
  }

  resetValidatorGroup() {
    DevExpress.validationEngine.resetGroup()
  }

  removeValidationGroup() {
    DevExpress.validationEngine.removeGroup()
  }
}

export default new DevExtreme()
