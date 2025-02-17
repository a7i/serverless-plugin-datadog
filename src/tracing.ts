/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache License Version 2.0.
 *
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2021 Datadog, Inc.
 */

import { FunctionInfo } from "layer";
import Service from "serverless/classes/Service";

const ddTraceEnabledEnvVar = "DD_TRACE_ENABLED";
const ddMergeXrayTracesEnvVar = "DD_MERGE_XRAY_TRACES";

export enum TracingMode {
  XRAY,
  DD_TRACE,
  HYBRID,
  NONE,
}

export function enableTracing(service: Service, tracingMode: TracingMode, handlers: FunctionInfo[]) {
  const provider = service.provider as any;
  if (tracingMode === TracingMode.XRAY || tracingMode === TracingMode.HYBRID) {
    provider.tracing = {
      apiGateway: true,
      lambda: true,
    };
  }
  if (tracingMode === TracingMode.HYBRID || tracingMode === TracingMode.DD_TRACE) {
    handlers.forEach(({ handler }) => {
      handler.environment ??= {};
      const environment = handler.environment as any;
      environment[ddTraceEnabledEnvVar] = true;
      environment[ddMergeXrayTracesEnvVar] = tracingMode === TracingMode.HYBRID;
    });
  }
}
