import TipContainer from '@bemuse/ui/TipContainer.js'
import { ComponentProps } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { hasAcknowledged, optionsSlice } from '../entities/Options.js'
import { selectOptions } from '../redux/ReduxState.js'

export const FirstTimeTip = ({
  featureKey,
  ...props
}: { featureKey: string } & Omit<
  ComponentProps<typeof TipContainer>,
  'tipVisible'
>) => {
  const dispatch = useDispatch()
  const options = useSelector(selectOptions)

  const onClick = () => {
    dispatch(optionsSlice.actions.ACKNOWLEDGE({ featureKey }))
  }

  return (
    <span onClick={onClick}>
      <TipContainer
        tipVisible={!hasAcknowledged(featureKey)(options)}
        {...props}
      />
    </span>
  )
}

export default FirstTimeTip
