import '@fortawesome/fontawesome-svg-core/styles.css'

import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const icons = {
  play: faPlay,
  gear: faGear,
  spinner: faSpinner,
  bars: faBars,
  twitter: faTwitter,
}

export interface Icon {
  name: keyof typeof icons
  spin?: boolean
}

export const Icon = (props: Icon) => {
  return <FontAwesomeIcon icon={icons[props.name]} spin={props.spin} />
}
