import * as _ from 'lodash'
import * as t from "io-ts"
import { reporter } from 'io-ts-reporters'

import { ScenarioApi } from "../api"
import logger from "../logger";
import { Conductor } from "../conductor"
import { Player } from "../player"
import { AgentConfigV, DnaConfigV, StorageConfigV, RawConductorConfig } from './types-conductor-config'

export const decodeOrThrow = (validator, value, extraMsg = '') => {
  const result = validator.decode(value)
  const errors = reporter(result)
  if (errors.length > 0) {
    const msg = `${extraMsg ? extraMsg + '\n' : ''}Tried to use an invalid value for a complex type and found the following problems:\n    - ${errors.join("\n    - ")}`
    logger.error(msg)
    throw new Error(msg)
  }
  return result
}

export type ObjectN<V> = { [name: number]: V }
export type ObjectS<V> = { [name: string]: V }

/** "F or T" */
// export const FortV = <T extends t.Mixed>(inner: T) => t.union([
//   t.Function, inner
// ])
// export type Fort = t.TypeOf<typeof FortV>
export type Fort<T> = T | ((ConfigSeedArgs) => T) | ((ConfigSeedArgs) => Promise<T>)

export const collapseFort = async <T>(fort: Fort<T>, args: ConfigSeedArgs): Promise<T> =>
  await (_.isFunction(fort) ? fort(args) : _.cloneDeep(fort))

export type SpawnConductorFn = (player: Player, args: any) => Promise<Conductor>

export type ScenarioFn = (s: ScenarioApi) => Promise<void>

export type IntermediateConfig = RawConductorConfig  // TODO: constrain

export type ConfigSeed = (args: ConfigSeedArgs) => Promise<IntermediateConfig>

export type ConfigSeedArgs = {
  scenarioName: string,
  playerName: string,
  uuid: string,
  interfacePort: number,
  configDir: string,
}

export const DryInstanceConfigV = t.intersection([
  t.type({
    id: t.string,
    agent: AgentConfigV,
    dna: DnaConfigV,
  }),
  t.partial({
    storage: StorageConfigV,
  })
])
export type DryInstanceConfig = t.TypeOf<typeof DryInstanceConfigV>

/** This one's tricky. Since tryorama 0.0.1, we have accepted just a DNA config in this position.
 *  Now, we want to accept other fields too, in which case the DNA config will be behind a "dna" key,
 *  along side other instance config like e.g. "storage"
 */
export const SugaredInstanceConfigV = t.union([DnaConfigV, DryInstanceConfigV])
export type SugaredInstanceConfig = t.TypeOf<typeof SugaredInstanceConfigV>

/** Base representation of a Conductor */
export const DryInstancesConfigV = t.array(DryInstanceConfigV)
export type DryInstancesConfig = t.TypeOf<typeof DryInstancesConfigV>

/** Shorthand representation of a Conductor,
 *  where keys of `instance` are used as instance IDs as well as agent IDs
 */
export const SugaredInstancesConfigV = t.record(t.string, SugaredInstanceConfigV)
export type SugaredInstancesConfig = t.TypeOf<typeof SugaredInstancesConfigV>

/** For situations where we can accept either flavor of config */

export const EitherInstancesConfigV = t.union([DryInstancesConfigV, SugaredInstancesConfigV])
export type EitherInstancesConfig = t.TypeOf<typeof EitherInstancesConfigV>

export type PartialConfigSeedArgs = Pick<ConfigSeedArgs, 'interfacePort' | 'configDir'>

export type AnyConfigBuilder = ConfigSeed | EitherInstancesConfig
export type PlayerConfigs = ObjectS<ConfigSeed> | Array<ConfigSeed>
export type MachineConfigs = ObjectS<PlayerConfigs>

export type KillFn = (signal?: string) => Promise<void>
