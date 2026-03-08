import TipContainer from '@bemuse/components/common/tip-container.js'
import type { ComponentProps } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectOptions } from '../../redux/redux-state.js'
import { hasAcknowledged, optionsSlice } from '../entities/options.js'

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
