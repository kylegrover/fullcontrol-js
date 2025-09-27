import { ManualGcode } from '../../../models/commands.js'
import { set_up as ender3_setup } from './ender_3.js'

export function set_up(user_overrides: Record<string, any>) {
  const data: any = ender3_setup(user_overrides)
  // Replace dimension line (index 1) with CR-10 volume
  if (data.starting_procedure_steps && data.starting_procedure_steps[1]) {
    data.starting_procedure_steps[1] = new ManualGcode({ text: ';MAXX:300\n;MAXY:300\n;MAXZ:400\n' })
  }
  return data
}
