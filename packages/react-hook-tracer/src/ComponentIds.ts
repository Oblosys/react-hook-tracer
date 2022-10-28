class ComponentIds {
  protected nextComponentIdByComponentName: Record<string, number>
  constructor() {
    this.nextComponentIdByComponentName = {}
  }
  initialize() {
    this.nextComponentIdByComponentName = {}
  }
  getFreshIdForComponentName(name: string) {
    if (this.nextComponentIdByComponentName[name] === undefined) {
      this.nextComponentIdByComponentName[name] = 1
    }

    const id = this.nextComponentIdByComponentName[name]
    this.nextComponentIdByComponentName[name] += 1
    return id
  }
}

export const componentIds = new ComponentIds()
