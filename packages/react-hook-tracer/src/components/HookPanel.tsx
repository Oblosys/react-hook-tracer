import './HookPanel.css'
import { HookInfo } from '../types'

interface HookPanelProps {
  label: string
  getHookStages: () => HookInfo[] // TODO: HookStages is not a great name.
}
export const HookPanel = ({ label, getHookStages }: HookPanelProps) => (
  <div className="hook-panel" data-testid="hook-panel">
    <div className="hook-panel-inner">
      <div className="component-label">{label}</div>
      {getHookStages().map((stage, index) => (
        <HookStage key={index} stage={stage} />
      ))}
    </div>
  </div>
)

// const isHighlighted = (hlMethod, method) =>
//   hlMethod !== null &&
//   hlMethod.componentName === method.componentName &&
//   hlMethod.instanceId === method.instanceId &&
//   hlMethod.methodName.startsWith(method.methodName) // for handling 'setState:update fn' & 'setState:callback'

interface HookStageProps {
  // componentLabel: string
  stage: HookInfo
}
const HookStage = ({ stage }: HookStageProps) => {
  // const methodIsHighlighted = isHighlighted(highlightedMethod, {
  //   componentName,
  //   instanceId,
  //   methodName,
  // })
  const stageIsHighlighted = false
  return (
    <div className="hook-stage" data-is-highlighted={stageIsHighlighted}>
      {stage.hookType + (stage.info ? ' ' + stage.info : '')}
    </div>
  )
}
