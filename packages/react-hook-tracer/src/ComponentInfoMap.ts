import { FiberNode } from './reactInternals'
import { ComponentInfo } from './types'

class ComponentInfoMap {
  protected componentInfoMap: WeakMap<FiberNode, ComponentInfo>

  constructor() {
    this.componentInfoMap = this.getInitialComponentInfoMap()
  }

  protected getInitialComponentInfoMap(): WeakMap<FiberNode, ComponentInfo> {
    return new WeakMap<FiberNode, ComponentInfo>()
  }

  initialize(): void {
    this.componentInfoMap = this.getInitialComponentInfoMap()
  }

  has(fiber: FiberNode): boolean {
    return this.componentInfoMap.has(fiber)
  }

  get(fiber: FiberNode): ComponentInfo | undefined {
    return this.componentInfoMap.get(fiber)
  }

  set(fiber: FiberNode, componentInfo: ComponentInfo): void {
    this.componentInfoMap.set(fiber, componentInfo)
  }
}

export const componentInfoMap = new ComponentInfoMap()
