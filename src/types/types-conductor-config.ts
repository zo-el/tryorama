import * as _ from 'lodash'
import * as t from "io-ts"

export const AgentConfigV = t.intersection([
  t.type({
    id: t.string,
    name: t.string,
    keystore_file: t.string,
    public_address: t.string,
  }),
  t.partial({
    test_agent: t.boolean,
  })
])
export type AgentConfig = t.TypeOf<typeof AgentConfigV>

export const DnaConfigV = t.intersection([
  t.type({
    id: t.string,
    file: t.string,
  }),
  t.partial({
    hash: t.string,
    uuid: t.string,
  })
])
export type DnaConfig = t.TypeOf<typeof DnaConfigV>

export const StorageConfigV = t.any  // TODO
export type StorageConfig = t.TypeOf<typeof StorageConfigV>

export const RawInstanceConfigV = t.type({
  id: t.string,
  agent: t.string,
  dna: t.string,
  storage: StorageConfigV,
})
export type RawInstanceConfig = t.TypeOf<typeof RawInstanceConfigV>

export const BridgeConfigV = t.type({
  handle: t.string,
  caller_id: t.string,
  callee_id: t.string,
})
export type BridgeConfig = t.TypeOf<typeof BridgeConfigV>

export const DpkiConfigV = t.type({
  instance_id: t.string,
  init_params: t.string,
})
export type DpkiConfig = t.TypeOf<typeof DpkiConfigV>

export const NetworkModeV = t.union([
  t.literal('n3h'),
  t.literal('memory'),
  t.literal('websocket'),
])
export type NetworkMode = t.TypeOf<typeof NetworkModeV>

export const RawNetworkConfigV = t.record(t.string, t.any)
export type RawNetworkConfig = t.TypeOf<typeof RawNetworkConfigV>

export const NetworkConfigV = t.union([
  NetworkModeV,
  RawNetworkConfigV,  // TODO: could make this actually match the shape of networking
])
export type NetworkConfig = t.TypeOf<typeof NetworkConfigV>

export const RawLoggerConfigV = t.record(t.string, t.any)
export type RawLoggerConfig = t.TypeOf<typeof RawLoggerConfigV>

export const LoggerConfigV = t.union([
  t.boolean,
  t.record(t.string, t.any),
])
export type LoggerConfig = t.TypeOf<typeof LoggerConfigV>

export const CloudWatchLogsConfigV = t.partial({
    region: t.string,
    log_group_name: t.string,
    log_stream_name: t.string
})
export type CloudWatchLogsConfig = t.TypeOf<typeof CloudWatchLogsConfigV>

export const RawCloudWatchLogsConfigV = t.intersection([CloudWatchLogsConfigV, t.type({
  type: t.literal('cloudwatchlogs')
})])
export type RawCloudWatchLogsConfig = t.TypeOf<typeof RawCloudWatchLogsConfigV>

export const LoggerMetricPublisherV = t.literal('logger')
export type LoggerMetricPublisher = t.TypeOf<typeof LoggerMetricPublisherV>

export const RawLoggerMetricPublisherV = t.type({
  type: LoggerMetricPublisherV
})
export type RawLoggerMetricPublisher = t.TypeOf<typeof RawLoggerMetricPublisherV>

export const MetricPublisherConfigV = t.union([
    LoggerMetricPublisherV,
    CloudWatchLogsConfigV,
])
export type MetricPublisherConfig = t.TypeOf<typeof MetricPublisherConfigV>

export const RawMetricPublisherConfigV = t.union([RawCloudWatchLogsConfigV, RawLoggerMetricPublisherV])
export type RawMetricPublisherConfig = t.TypeOf<typeof RawMetricPublisherConfigV>

export type RawSignalsConfig = {
  trace: boolean,
  consistency: boolean,
}

export const ConductorConfigCommonV = t.partial({
  bridges: t.array(BridgeConfigV),
  dpki: DpkiConfigV,  // raw
  network: RawNetworkConfigV,
  logger: RawLoggerConfigV,
  metric_publisher: RawMetricPublisherConfigV,
})
export type ConductorConfigCommon = t.TypeOf<typeof ConductorConfigCommonV>

type RawInterfaceConfig = {
  admin: boolean,
  choose_free_port: boolean,
  id: string,
  driver: {
    type: string,
    port: number,
  },
  instances: Array<{ id: string }>
}

export interface RawConductorConfig {
  agents: Array<AgentConfig>
  dnas: Array<DnaConfig>
  instances: Array<RawInstanceConfig>
  interfaces: Array<RawInterfaceConfig>
  signals: RawSignalsConfig,
  bridges?: Array<BridgeConfig>
  dpki?: DpkiConfig
  network?: RawNetworkConfig,
  logger?: RawLoggerConfig,
  metric_publisher?: RawMetricPublisherConfig,
}
