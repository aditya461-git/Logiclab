import type { Edge } from "@xyflow/react";
import type { GateNodeType, GateType } from "./GateNode";

export type VerilogStyle = "behavioral" | "gate";

const STANDARD_GATES = new Set<GateType>([
  "AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR",
]);

function sanitizeIdentifier(value: string, fallback: string) {
  const cleaned = value.replace(/[^A-Za-z0-9_$]/g, "_");
  const safe = cleaned.match(/^[A-Za-z_]/) ? cleaned : `_${cleaned}`;
  return safe || fallback;
}

function uniqueName(base: string, used: Set<string>) {
  let name = base || "signal";
  let n = 2;
  while (used.has(name)) name = `${base}_${n++}`;
  used.add(name);
  return name;
}

function inputHandles(node: GateNodeType) {
  const inputCount = (node.data as { inputCount?: number }).inputCount;
  const count = Math.max(1, Math.min(8, inputCount ?? 2));
  return Array.from({ length: count }, (_, i) => `input-${i + 1}`);
}

function sourceSignal(
  edge: Edge | undefined,
  signalMap: Map<string, Map<string, string>>,
  fallback = "1'b0"
) {
  if (!edge) return fallback;
  return signalMap.get(edge.source)?.get(edge.sourceHandle ?? "default") ?? fallback;
}

function incomingFor(node: GateNodeType, edges: Edge[]) {
  return edges
    .filter((e) => e.target === node.id)
    .sort((a, b) => String(a.targetHandle ?? "").localeCompare(String(b.targetHandle ?? "")));
}

function gatePrimitive(type: GateType) {
  return type.toLowerCase();
}

export function generateVerilog(
  nodes: GateNodeType[],
  edges: Edge[],
  style: VerilogStyle = "behavioral"
) {
  const inputs = nodes.filter((n) => n.data.gateType === "INPUT");
  const outputs = nodes.filter((n) => n.data.gateType === "OUTPUT");
  const internals = nodes.filter(
    (n) => n.data.gateType !== "INPUT" && n.data.gateType !== "OUTPUT"
  );

  const used = new Set<string>(["input", "output", "wire", "reg", "module"]);
  const signalMap = new Map<string, Map<string, string>>();

  const inputNames = new Map<string, string>();
  for (const node of inputs) {
    const name = uniqueName(sanitizeIdentifier(node.data.label, `in_${node.id}`), used);
    inputNames.set(node.id, name);
    signalMap.set(node.id, new Map([["default", name]]));
  }

  for (const node of internals) {
    const map = new Map<string, string>();
    const outputHandles = outputHandleNames(node.data.gateType);
    for (const handle of outputHandles) {
      map.set(handle, uniqueName(`w_${sanitizeIdentifier(node.id, "node")}_${handle.replace(/[^A-Za-z0-9_]/g, "_")}`, used));
    }
    if (outputHandleNames(node.data.gateType).length === 0 && !map.has("default")) {
      map.set("default", uniqueName(`w_${sanitizeIdentifier(node.id, "node")}`, used));
    }
    signalMap.set(node.id, map);
  }

  const outputNames = new Map<string, string>();
  for (const node of outputs) {
    const name = uniqueName(sanitizeIdentifier(node.data.label, `out_${node.id}`), used);
    outputNames.set(node.id, name);
    signalMap.set(node.id, new Map([["default", name]]));
  }

  const inputPorts = inputs.map((n) => inputNames.get(n.id)!);
  const outputPorts = outputs.map((n) => outputNames.get(n.id)!);
  const declarations = [
    ...inputPorts.map((n) => `    input ${n};`),
    ...outputPorts.map((n) => `    output ${n};`),
  ];

  const wireNames: string[] = [];
  const sequentialTypes = new Set<GateType>([
    "D_FLIP_FLOP", "JK_FLIP_FLOP", "T_FLIP_FLOP", "SR_FLIP_FLOP",
    "D_LATCH", "JK_LATCH", "T_LATCH", "SR_LATCH", "REGISTER", "COUNTER"
  ]);
  for (const node of internals) {
    if (sequentialTypes.has(node.data.gateType)) continue;
    for (const signal of signalMap.get(node.id)?.values() ?? []) {
      if (!wireNames.includes(signal)) wireNames.push(signal);
    }
  }

  const lines: string[] = [
    "// LogicLab generated Verilog",
    "// Generated from the current circuit graph.",
    "",
    "module logiclab_circuit (",
    ...declarations.map((x, i) => `${x}${i < declarations.length - 1 ? "" : ""}`),
    ");",
    "",
  ];

  if (wireNames.length) {
    lines.push(`    wire ${wireNames.join(", ")};`, "");
  }

  const gateLines: string[] = [];
  for (const node of internals) {
    const type = node.data.gateType;
    const incoming = incomingFor(node, edges);
    const out = signalMap.get(node.id)!;
    const get = (handle: string) => sourceSignal(incoming.find((e) => e.targetHandle === handle), signalMap);
    const output = out.get("default")!;

    if (STANDARD_GATES.has(type)) {
      const args = inputHandles(node).map(get);
      if (style === "gate") {
        gateLines.push(`    ${gatePrimitive(type)} g_${sanitizeIdentifier(node.id, "gate")} (${output}, ${args.join(", ")});`);
      } else {
        const expr = type === "NOT" ? `~${args[0] ?? "1'b0"}`
          : type === "AND" ? args.join(" & ") || "1'b0"
          : type === "OR" ? args.join(" | ") || "1'b0"
          : type === "NAND" ? `~(${args.join(" & ") || "1'b0"})`
          : type === "NOR" ? `~(${args.join(" | ") || "1'b0"})`
          : type === "XOR" ? args.join(" ^ ") || "1'b0"
          : `~(${args.join(" ^ ") || "1'b0"})`;
        gateLines.push(`    assign ${output} = ${expr};`);
      }
      continue;
    }

    if (type === "MUX" || type === "MUX_4_1" || type === "MUX_8_1") {
      const count = type === "MUX" ? 2 : type === "MUX_4_1" ? 4 : 8;
      const data = Array.from({ length: count }, (_, i) => get(`input-${i}`));
      const selects = type === "MUX" ? [get("select")] : Array.from({ length: Math.log2(count) }, (_, i) => get(`select-${i}`));
      const sel = selects.length === 1 ? selects[0] : `{${selects.reverse().join(", ")}}`;
      gateLines.push(`    assign ${output} = ${data.length ? data.map((d, i) => `${sel} == ${Math.log2(count)}'d${i} ? ${d} : `).join("") + "1'b0" : "1'b0"};`);
      continue;
    }

    if (type === "DEMUX" || type === "DEMUX_1_4" || type === "DEMUX_1_8") {
      const count = type === "DEMUX" ? 2 : type === "DEMUX_1_4" ? 4 : 8;
      const data = get("input");
      const selects = type === "DEMUX" ? [get("select")] : Array.from({ length: Math.log2(count) }, (_, i) => get(`select-${i}`));
      const sel = selects.length === 1 ? selects[0] : `{${selects.reverse().join(", ")}}`;
      for (let i = 0; i < count; i++) {
        gateLines.push(`    assign ${out.get(`output-${i}`)} = (${sel} == ${Math.log2(count)}'d${i}) ? ${data} : 1'b0;`);
      }
      continue;
    }

    if (type === "HALF_ADDER" || type === "FULL_ADDER" || type === "HALF_SUBTRACTOR" || type === "FULL_SUBTRACTOR") {
      const a = get("a"), b = get("b"), cin = get("carry-in"), bin = get("carry-in");
      const sum = out.get("sum") ?? out.get("difference") ?? output;
      const carry = out.get("carry") ?? out.get("borrow") ?? output;
      if (type === "HALF_ADDER") {
        gateLines.push(`    assign ${sum} = ${a} ^ ${b};`, `    assign ${carry} = ${a} & ${b};`);
      } else if (type === "FULL_ADDER") {
        gateLines.push(`    assign ${sum} = ${a} ^ ${b} ^ ${cin};`, `    assign ${carry} = (${a} & ${b}) | (${a} & ${cin}) | (${b} & ${cin});`);
      } else if (type === "HALF_SUBTRACTOR") {
        gateLines.push(`    assign ${sum} = ${a} ^ ${b};`, `    assign ${carry} = ~${a} & ${b};`);
      } else {
        gateLines.push(`    assign ${sum} = ${a} ^ ${b} ^ ${bin};`, `    assign ${carry} = (~${a} & (${b} | ${bin})) | (${b} & ${bin});`);
      }
      continue;
    }

    if (type === "DECODER") {
      const a = get("input-a"), b = get("input-b");
      for (let i = 0; i < 4; i++) gateLines.push(`    assign ${out.get(`output-${i}`)} = ({${a}, ${b}} == 2'b${i.toString(2).padStart(2, "0")});`);
      continue;
    }

    if (type === "ENCODER") {
      const ins = [0,1,2,3].map(i => get(`input-${i}`));
      gateLines.push(`    assign ${out.get("output-a")} = ${ins[2]} | ${ins[3]};`, `    assign ${out.get("output-b")} = ${ins[1]} | ${ins[3]};`);
      continue;
    }

    if (["D_FLIP_FLOP", "JK_FLIP_FLOP", "T_FLIP_FLOP", "SR_FLIP_FLOP", "D_LATCH", "JK_LATCH", "T_LATCH", "SR_LATCH"].includes(type)) {
      const q = out.get("q") ?? output;
      const qb = out.get("q-bar");
      const clock = get("clock");
      if (type === "D_FLIP_FLOP") gateLines.push(`    reg ${q};`, `    always @(posedge ${clock}) ${q} <= ${get("d")};`);
      else if (type === "T_FLIP_FLOP") gateLines.push(`    reg ${q};`, `    always @(posedge ${clock}) if (${get("t")}) ${q} <= ~${q};`);
      else if (type === "JK_FLIP_FLOP") gateLines.push(`    reg ${q};`, `    always @(posedge ${clock}) begin if (${get("j")} && ${get("k")}) ${q} <= ~${q}; else if (${get("j")}) ${q} <= 1'b1; else if (${get("k")}) ${q} <= 1'b0; end`);
      else if (type === "SR_FLIP_FLOP") gateLines.push(`    reg ${q};`, `    always @(posedge ${clock}) begin if (${get("set")} && !${get("reset")}) ${q} <= 1'b1; else if (!${get("set")} && ${get("reset")}) ${q} <= 1'b0; end`);
      else gateLines.push(`    reg ${q};`, `    always @(*) begin if (${get("d")}) ${q} = 1'b1; end`);
      if (qb) gateLines.push(`    assign ${qb} = ~${q};`);
      continue;
    }

    if (type === "REGISTER") {
      for (let i = 0; i < 4; i++) {
        const q = out.get(`q${i}`)!;
        gateLines.push(`    reg ${q};`);
        gateLines.push(`    always @(posedge ${get("clock")}) ${q} <= ${get(`d${i}`)};`);
      }
      continue;
    }

    if (type === "COUNTER") {
      const q = [0,1,2,3].map(i => out.get(`q${i}`)!);
      gateLines.push(`    reg [3:0] ${output};`, `    always @(posedge ${get("clock")}) ${output} <= ${output} + 4'b0001;`);
      q.forEach((bit, i) => gateLines.push(`    assign ${bit} = ${output}[${i}];`));
      continue;
    }

    gateLines.push(`    // Unsupported/custom component ${type}: emitted as a zero-valued placeholder.`);
    gateLines.push(`    assign ${output} = 1'b0;`);
  }

  for (const node of outputs) {
    const incoming = incomingFor(node, edges)[0];
    gateLines.push(`    assign ${outputNames.get(node.id)} = ${sourceSignal(incoming, signalMap)};`);
  }

  lines.push(...gateLines, "", "endmodule", "");
  return lines.join("\n");
}

function outputHandleNames(type: GateType): string[] {
  switch (type) {
    case "DEMUX": return ["output-0", "output-1"];
    case "DEMUX_1_4": return ["output-0", "output-1", "output-2", "output-3"];
    case "DEMUX_1_8": return Array.from({ length: 8 }, (_, i) => `output-${i}`);
    case "DECODER": return Array.from({ length: 4 }, (_, i) => `output-${i}`);
    case "ENCODER": return ["output-a", "output-b"];
    case "SR_FLIP_FLOP": case "JK_FLIP_FLOP": case "D_FLIP_FLOP": case "T_FLIP_FLOP": return ["q", "q-bar"];
    case "REGISTER": return ["q0", "q1", "q2", "q3"];
    case "COUNTER": return ["q0", "q1", "q2", "q3"];
    case "HALF_ADDER": case "FULL_ADDER": return ["sum", "carry"];
    case "HALF_SUBTRACTOR": case "FULL_SUBTRACTOR": return ["difference", "borrow"];
    default: return [];
  }
}
