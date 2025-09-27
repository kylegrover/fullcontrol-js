import { ManualGcode } from '../../../models/commands.js'
import { set_up as t0_setup } from './toolchanger_T0.js'

export function set_up(user_overrides: Record<string, any>) {
  const data: any = t0_setup(user_overrides)
  if (data.starting_procedure_steps && data.starting_procedure_steps[2]) {
    data.starting_procedure_steps[2] = new ManualGcode({ text: 'T3' })
  }
  return data
}
