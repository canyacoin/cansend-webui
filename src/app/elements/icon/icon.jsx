import React from 'react'
import './icon.scss'

export const IconType = {
  LOADING: 'loading',
  QUESTION: 'question',
  CARET: 'caret',
  PLUSCIRCLE: 'plus-circle',
  SPINNER: 'spinner',
  CLOSE: 'close',
  TICK: 'tick',
  CROSS: 'cross',
  SYNC: 'sync',
  EXCLAMATION: 'exclamation',
  SOCIAL: {
    FACEBOOK: 'facebook',
    TWITTER: 'twitter',
    INSTAGRAM: 'instagram',
    YOUTUBE: 'youtube',
    GITHUB: 'github',
    TELEGRAM: 'telegram'
  }
}

const Icon = ({ type, shade, onClick, className }) => (
  <i
    className={'element icon' + (className ? ' ' + className : '')}
    data-type={type}
    data-shade={shade}
    data-clickable={onClick ? true : false}
    onClick={e => onClick && onClick(e)}
  />
)

export default Icon
