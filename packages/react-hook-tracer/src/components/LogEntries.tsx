import { LogEntry } from '../tracer'

interface LogEntriesProps {
  entries: LogEntry[]
  highlightedIndex: number | null
  setHighlightedIndex: (i: number) => void
}
export const LogEntries = ({
  entries,
  highlightedIndex,
  setHighlightedIndex,
}: LogEntriesProps): JSX.Element => {
  const indexWidth = Math.max(2, 1 + Math.log10(entries.length))
  const labelWidth = 2 + Math.max(...entries.map(({ label }) => label.length + 1))

  return (
    <div className="entries">
      {entries.map(({ label, stage, message }, i) => (
        <div className="entry-wrapper" key={i}>
          <div
            className="entry"
            data-is-highlighted={i === highlightedIndex}
            onMouseEnter={() => setHighlightedIndex(i)}
          >
            {`${('' + i).padStart(indexWidth)} ${(label + ':').padEnd(
              labelWidth,
            )} ${stage} ${message}`}
          </div>
        </div>
      ))}
    </div>
  )
}
// extends Component {
//   highlight = (index) => {
//     this.props.highlight(index)
//   }

//   componentDidUpdate(prevProps) {
//     if (prevProps.entries.length !== this.props.entries.length) {
//       this.messagesElt.scrollTop = this.messagesElt.scrollHeight - this.messagesElt.clientHeight
//     }
//   }

//   render() {
//     const indexWidth = Math.max(2, 1 + Math.log10(this.props.entries.length))
//     const componentNameWidth =
//       2 +
//       Math.max(
//         ...this.props.entries.map(
//           ({ componentName, instanceId }) => componentName.length + ('' + instanceId).length + 1,
//         ),
//       )
//     return (
//       <div
//         className="entries"
//         data-testid="log-entries"
//         ref={(elt) => {
//           this.messagesElt = elt
//         }}
//       >
//         {this.props.entries.map(({ componentName, instanceId, methodName }, i) => (
//           <div className="entry-wrapper" key={i}>
//             <div
//               className="entry"
//               data-is-highlighted={i === this.props.highlightedIndex}
//               onMouseEnter={() => this.highlight(i)}
//             >
//               {('' + i).padStart(indexWidth) +
//                 ' ' +
//                 (componentName + '-' + instanceId + ':').padEnd(componentNameWidth) +
//                 methodName}
//             </div>
//           </div>
//         ))}
//       </div>
//     )
//   }
// }
