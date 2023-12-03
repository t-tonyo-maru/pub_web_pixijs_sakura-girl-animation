import '../../scss/module/element/_btn.scss'

export interface BtnProps {
  text: string
  isDisabled: boolean
  isRound?: boolean
  isLarge?: boolean
  isWaring?: boolean
}

/**
 * Primary UI component for user interaction
 */
export const createBtn = ({
  text,
  isDisabled = false,
  isRound = false,
  isLarge = false,
  isWaring = false
}: BtnProps) => {
  const btn = document.createElement('button')
  btn.type = 'button'
  if (isDisabled) {
    btn.setAttribute('disabled', 'disabled')
  }
  btn.innerText = text

  const baseClassName = 'el_btn'
  const classNames = []
  if (isRound) classNames.push(`${baseClassName}__round`)
  if (isLarge) classNames.push(`${baseClassName}__large`)
  if (isWaring) classNames.push(`${baseClassName}__waring`)

  btn.className = [baseClassName, ...classNames].join(' ')

  return btn
}
