import { Story, Meta } from '@storybook/html'
import { createBtn, BtnProps } from './Btn'

export default {
  title: 'module/element/btn',
  argTypes: {
    text: { control: 'text' },
    isDisabled: { control: 'boolean' },
    isRound: { control: 'boolean' },
    isLarge: { control: 'boolean' },
    isWaring: { control: 'boolean' }
  }
} as Meta

const Template: Story<BtnProps> = (args) => {
  return createBtn(args)
}

export const defaultBtn = Template.bind({})
defaultBtn.args = {
  text: 'default button'
}

export const roundBtn = Template.bind({})
roundBtn.args = {
  text: 'round button',
  isRound: true
}

export const largeBtn = Template.bind({})
largeBtn.args = {
  text: 'large button',
  isLarge: true
}

export const waringBtn = Template.bind({})
waringBtn.args = {
  text: 'waring button',
  isWaring: true
}

export const disabledBtn = Template.bind({})
disabledBtn.args = {
  text: 'default button',
  isDisabled: true
}
