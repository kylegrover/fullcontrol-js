import { BaseModelPlus } from '../core/base-model.js'

export class Fan extends BaseModelPlus { speed_percent?: number; static readonly typeName='Fan'; constructor(init?: Partial<Fan>){ super(init) } }
export class Hotend extends BaseModelPlus { temp?: number; wait?: boolean; tool?: number; static readonly typeName='Hotend'; constructor(init?: Partial<Hotend>){ super(init) } }
export class Buildplate extends BaseModelPlus { temp?: number; wait?: boolean; static readonly typeName='Buildplate'; constructor(init?: Partial<Buildplate>){ super(init) } }
