import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import GateNode, {
  type GateNodeType,
  type GateType,
} from "./GateNode";

import "./circuit.css";

type HistoryState = {
  nodes: GateNodeType[];
  edges: Edge[];
};

type TruthTableData = {
  inputs: string[];
  outputs: string[];
  rows: Record<string, number | boolean>[];
};

/* =========================================================
   K-MAP TYPES
   ========================================================= */

type KMapGroup = {
  id: number;
  pattern: string;
  minterms: number[];
  term: string;
};

/* =========================================================
   CONSTANTS
   ========================================================= */

const STORAGE_KEY = "logiclab-autosave";

const initialNodes: GateNodeType[] = [
  {
    id: "input-a",
    type: "gate",
    position: { x: 80, y: 150 },
    data: {
      label: "INPUT A",
      gateType: "INPUT",
      value: false,
    },
  },
  {
    id: "input-b",
    type: "gate",
    position: { x: 80, y: 300 },
    data: {
      label: "INPUT B",
      gateType: "INPUT",
      value: false,
    },
  },
  {
    id: "and-1",
    type: "gate",
    position: { x: 330, y: 220 },
    data: {
      label: "AND",
      gateType: "AND",
      value: false,
    },
  },
  {
    id: "output-1",
    type: "gate",
    position: { x: 580, y: 220 },
    data: {
      label: "OUTPUT Y",
      gateType: "OUTPUT",
      value: false,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "a-and",
    source: "input-a",
    target: "and-1",
    animated: true,
  },
  {
    id: "b-and",
    source: "input-b",
    target: "and-1",
    animated: true,
  },
  {
    id: "and-output",
    source: "and-1",
    target: "output-1",
    animated: true,
  },
];

const gateTypes: GateType[] = [
  "INPUT",
  "AND",
  "OR",
  "NOT",
  "NAND",
  "NOR",
  "XOR",
  "XNOR",
  "MUX",
  "DEMUX",
  "MUX_4_1",
  "MUX_8_1",
  "DEMUX_1_4",
  "DEMUX_1_8",
  "HALF_ADDER",
  "FULL_ADDER",
  "HALF_SUBTRACTOR",
  "FULL_SUBTRACTOR",
  "SERIAL_ADDER",
  "PARALLEL_ADDER",
  "BCD_ADDER",
  "SR_LATCH",
  "D_LATCH",
  "JK_LATCH",
  "T_LATCH",
  "DECODER",
  "ENCODER",
  "SR_FLIP_FLOP",
  "JK_FLIP_FLOP",
  "D_FLIP_FLOP",
  "T_FLIP_FLOP",
  "REGISTER",
  "COUNTER",
  "OUTPUT",
];

const gateNames: Record<GateType, string> = {
  INPUT: "Input",
  AND: "AND",
  OR: "OR",
  NOT: "NOT",
  NAND: "NAND",
  NOR: "NOR",
  XOR: "XOR",
  XNOR: "XNOR",
  MUX: "MUX 2:1",
  DEMUX: "DEMUX 1:2",
  MUX_4_1: "MUX 4:1",
  MUX_8_1: "MUX 8:1",
  DEMUX_1_4: "DEMUX 1:4",
  DEMUX_1_8: "DEMUX 1:8",
  HALF_ADDER: "Half Adder",
  FULL_ADDER: "Full Adder",
  HALF_SUBTRACTOR: "Half Subtractor",
  FULL_SUBTRACTOR: "Full Subtractor",
  SERIAL_ADDER: "Serial Adder",
  PARALLEL_ADDER: "4-bit Parallel Adder",
  BCD_ADDER: "BCD Adder",
  SR_LATCH: "SR Latch",
  D_LATCH: "D Latch",
  JK_LATCH: "JK Latch",
  T_LATCH: "T Latch",
  DECODER: "Decoder 2:4",
  ENCODER: "Encoder 4:2",
  SR_FLIP_FLOP: "SR Flip-Flop",
  JK_FLIP_FLOP: "JK Flip-Flop",
  D_FLIP_FLOP: "D Flip-Flop",
  T_FLIP_FLOP: "T Flip-Flop",
  REGISTER: "4-bit Register",
  COUNTER: "4-bit Counter",
  OUTPUT: "Output",
};

/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function cloneNodes(nodes: GateNodeType[]) {
  return structuredClone(nodes) as GateNodeType[];
}

function cloneEdges(edges: Edge[]) {
  return structuredClone(edges) as Edge[];
}

function downloadText(
  filename: string,
  content: string,
  type = "text/plain"
) {
  const blob = new Blob([content], { type });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

/* =========================================================
   LOGIC SIMULATION
   ========================================================= */

function evaluateGate(
  gateType: GateType,
  inputs: boolean[]
): boolean {
  switch (gateType) {
    case "AND":
      return (
        inputs.length > 0 &&
        inputs.every(Boolean)
      );

    case "OR":
      return inputs.some(Boolean);

    case "NOT":
      return !(inputs[0] ?? false);

    case "NAND":
      return !(
        inputs.length > 0 &&
        inputs.every(Boolean)
      );

    case "NOR":
      return !inputs.some(Boolean);

    case "XOR":
      return (
        inputs.filter(Boolean).length % 2 === 1
      );

    case "XNOR":
      return (
        inputs.filter(Boolean).length % 2 === 0
      );

    case "MUX":
      return inputs[2]
        ? inputs[1] ?? false
        : inputs[0] ?? false;

    case "DEMUX":
      return inputs[0] ?? false;

    case "DECODER":
      return (
        (inputs[0] ?? false) ||
        (inputs[1] ?? false)
      );

    case "ENCODER":
      return inputs.some(Boolean);

    case "OUTPUT":
      return inputs[0] ?? false;

    default:
      return inputs[0] ?? false;
  }
}

function getInputHandleIds(
  gateType: GateType
): string[] {
  switch (gateType) {
    case "MUX":
      return [
        "input-1",
        "input-2",
        "select",
      ];

    case "DEMUX":
      return ["input", "select"];

    case "MUX_4_1":
      return ["input-0", "input-1", "input-2", "input-3", "select-0", "select-1"];

    case "MUX_8_1":
      return ["input-0", "input-1", "input-2", "input-3", "input-4", "input-5", "input-6", "input-7", "select-0", "select-1", "select-2"];

    case "DEMUX_1_4":
      return ["input", "select-0", "select-1"];

    case "DEMUX_1_8":
      return ["input", "select-0", "select-1", "select-2"];

    case "HALF_ADDER":
    case "HALF_SUBTRACTOR":
      return ["a", "b"];

    case "FULL_ADDER":
    case "FULL_SUBTRACTOR":
      return ["a", "b", "carry-in"];

    case "SERIAL_ADDER":
      return ["a", "b", "clock"];

    case "PARALLEL_ADDER":
    case "BCD_ADDER":
      return ["a0", "a1", "a2", "a3", "b0", "b1", "b2", "b3", "carry-in"];

    case "SR_LATCH":
      return ["set", "reset"];

    case "D_LATCH":
      return ["d", "enable"];

    case "JK_LATCH":
      return ["j", "k", "enable"];

    case "T_LATCH":
      return ["t", "enable"];

    case "DECODER":
      return [
        "input-a",
        "input-b",
      ];

    case "ENCODER":
      return [
        "input-0",
        "input-1",
        "input-2",
        "input-3",
      ];

    case "SR_FLIP_FLOP":
      return ["set", "reset"];

    case "JK_FLIP_FLOP":
      return ["j", "k", "clock"];

    case "D_FLIP_FLOP":
      return ["d", "clock"];

    case "T_FLIP_FLOP":
      return ["t", "clock"];

    case "REGISTER":
      return [
        "d0",
        "d1",
        "d2",
        "d3",
        "clock",
      ];

    case "COUNTER":
      return ["clock"];

    case "NOT":
      return ["input-1"];

    case "AND":
    case "OR":
    case "NAND":
    case "NOR":
    case "XOR":
    case "XNOR":
      return [
        "input-1",
        "input-2",
      ];

    default:
      return ["input-1"];
  }
}

function getSourceValue(
  source: GateNodeType | undefined,
  edge: Edge | undefined
): boolean {
  if (!source || !edge) {
    return false;
  }

  if (
    source.data.outputValues &&
    edge.sourceHandle
  ) {
    return (
      source.data.outputValues[
        edge.sourceHandle
      ] ?? false
    );
  }

  return source.data.value ?? false;
}

function calculateNextState(
  sourceNodes: GateNodeType[],
  edges: Edge[],
  clockValue = false,
  previousClockValues: Record<
    string,
    boolean
  > = {}
): GateNodeType[] {
  const nextNodes = cloneNodes(sourceNodes);

  const getNode = (id: string) =>
    nextNodes.find(
      (node) => node.id === id
    );

  /*
   * Multiple passes allow values to propagate
   * through chains of components.
   */
  for (let pass = 0; pass < 8; pass++) {
    for (const node of nextNodes) {
      const incoming = edges.filter(
        (edge) =>
          edge.target === node.id
      );

      const getHandleValue = (
        handleId: string
      ) => {
        const edge = incoming.find(
          (item) =>
            item.targetHandle ===
            handleId
        );

        const source = edge
          ? getNode(edge.source)
          : undefined;

        return getSourceValue(
          source,
          edge
        );
      };

      switch (
        node.data.gateType
      ) {
        case "INPUT":
          break;

        case "MUX": {
          const d0 =
            getHandleValue("input-1");

          const d1 =
            getHandleValue("input-2");

          const select =
            getHandleValue("select");

          node.data.value =
            select ? d1 : d0;

          break;
        }

        case "DEMUX": {
          const data =
            getHandleValue("input");

          const select =
            getHandleValue("select");

          node.data.value = data;

          node.data.outputValues = {
            "output-0":
              data && !select,
            "output-1":
              data && select,
          };

          break;
        }

        case "DECODER": {
          const a =
            getHandleValue("input-a");

          const b =
            getHandleValue("input-b");

          const index =
            (a ? 2 : 0) +
            (b ? 1 : 0);

          node.data.value = true;

          node.data.outputValues = {
            "output-0":
              index === 0,
            "output-1":
              index === 1,
            "output-2":
              index === 2,
            "output-3":
              index === 3,
          };

          break;
        }

        case "ENCODER": {
          const y0 =
            getHandleValue("input-0");

          const y1 =
            getHandleValue("input-1");

          const y2 =
            getHandleValue("input-2");

          const y3 =
            getHandleValue("input-3");

          let a = false;
          let b = false;

          if (y1) {
            a = false;
            b = true;
          } else if (y2) {
            a = true;
            b = false;
          } else if (y3) {
            a = true;
            b = true;
          } else if (y0) {
            a = false;
            b = false;
          }

          node.data.value =
            y0 ||
            y1 ||
            y2 ||
            y3;

          node.data.outputValues = {
            "output-a": a,
            "output-b": b,
          };

          break;
        }

        case "SR_FLIP_FLOP": {
          const set =
            getHandleValue("set");

          const reset =
            getHandleValue("reset");

          let q =
            node.data.state ??
            false;

          if (set && reset) {
            q = false;
          } else if (set) {
            q = true;
          } else if (reset) {
            q = false;
          }

          node.data.state = q;
          node.data.value = q;

          node.data.outputValues = {
            q,
            "q-bar": !q,
          };

          break;
        }

        case "JK_FLIP_FLOP": {
          const j =
            getHandleValue("j");

          const k =
            getHandleValue("k");

          const previousClock =
            previousClockValues[
              node.id
            ] ?? false;

          const risingEdge =
            !previousClock &&
            clockValue;

          let q =
            node.data.state ??
            false;

          if (risingEdge) {
            if (j && k) {
              q = !q;
            } else if (j) {
              q = true;
            } else if (k) {
              q = false;
            }
          }

          node.data.state = q;
          node.data.value = q;

          node.data.outputValues = {
            q,
            "q-bar": !q,
          };

          break;
        }

        case "D_FLIP_FLOP": {
          const d =
            getHandleValue("d");

          const previousClock =
            previousClockValues[
              node.id
            ] ?? false;

          const risingEdge =
            !previousClock &&
            clockValue;

          let q =
            node.data.state ??
            false;

          if (risingEdge) {
            q = d;
          }

          node.data.state = q;
          node.data.value = q;

          node.data.outputValues = {
            q,
            "q-bar": !q,
          };

          break;
        }

        case "T_FLIP_FLOP": {
          const t =
            getHandleValue("t");

          const previousClock =
            previousClockValues[
              node.id
            ] ?? false;

          const risingEdge =
            !previousClock &&
            clockValue;

          let q =
            node.data.state ??
            false;

          if (
            risingEdge &&
            t
          ) {
            q = !q;
          }

          node.data.state = q;
          node.data.value = q;

          node.data.outputValues = {
            q,
            "q-bar": !q,
          };

          break;
        }

        case "REGISTER": {
          const previousClock =
            previousClockValues[
              node.id
            ] ?? false;

          const risingEdge =
            !previousClock &&
            clockValue;

          let state =
            node.data.registerState ??
            {
              q0: false,
              q1: false,
              q2: false,
              q3: false,
            };

          if (risingEdge) {
            state = {
              q0:
                getHandleValue("d0"),
              q1:
                getHandleValue("d1"),
              q2:
                getHandleValue("d2"),
              q3:
                getHandleValue("d3"),
            };

            node.data.registerState =
              state;
          }

          node.data.value =
            state.q0 ||
            state.q1 ||
            state.q2 ||
            state.q3;

          node.data.outputValues = {
            q0: state.q0,
            q1: state.q1,
            q2: state.q2,
            q3: state.q3,
          };

          break;
        }

        case "COUNTER": {
          const previousClock =
            previousClockValues[
              node.id
            ] ?? false;

          const risingEdge =
            !previousClock &&
            clockValue;

          let value =
            node.data.counterValue ??
            0;

          if (risingEdge) {
            value =
              (value + 1) % 16;

            node.data.counterValue =
              value;
          }

          node.data.value =
            value !== 0;

          node.data.outputValues = {
            q0: Boolean(value & 1),
            q1: Boolean(value & 2),
            q2: Boolean(value & 4),
            q3: Boolean(value & 8),
          };

          break;
        }

        case "MUX_4_1": {
          const index = (getHandleValue("select-1") ? 2 : 0) + (getHandleValue("select-0") ? 1 : 0);
          node.data.value = getHandleValue(`input-${index}`);
          break;
        }

        case "MUX_8_1": {
          const index = (getHandleValue("select-2") ? 4 : 0) + (getHandleValue("select-1") ? 2 : 0) + (getHandleValue("select-0") ? 1 : 0);
          node.data.value = getHandleValue(`input-${index}`);
          break;
        }

        case "DEMUX_1_4": {
          const data = getHandleValue("input");
          const index = (getHandleValue("select-1") ? 2 : 0) + (getHandleValue("select-0") ? 1 : 0);
          node.data.value = data;
          node.data.outputValues = Object.fromEntries(Array.from({ length: 4 }, (_, i) => [`output-${i}`, data && i === index]));
          break;
        }

        case "DEMUX_1_8": {
          const data = getHandleValue("input");
          const index = (getHandleValue("select-2") ? 4 : 0) + (getHandleValue("select-1") ? 2 : 0) + (getHandleValue("select-0") ? 1 : 0);
          node.data.value = data;
          node.data.outputValues = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`output-${i}`, data && i === index]));
          break;
        }

        case "HALF_ADDER": {
          const a = getHandleValue("a"), b = getHandleValue("b");
          node.data.value = a !== b;
          node.data.outputValues = { sum: a !== b, carry: a && b };
          break;
        }

        case "FULL_ADDER": {
          const a = getHandleValue("a"), b = getHandleValue("b"), cin = getHandleValue("carry-in");
          const sum = Boolean(a !== b) !== cin;
          node.data.value = sum;
          node.data.outputValues = { sum, carry: (a && b) || (a && cin) || (b && cin) };
          break;
        }

        case "HALF_SUBTRACTOR": {
          const a = getHandleValue("a"), b = getHandleValue("b");
          node.data.value = a !== b;
          node.data.outputValues = { sum: a !== b, carry: !a && b };
          break;
        }

        case "FULL_SUBTRACTOR": {
          const a = getHandleValue("a"), b = getHandleValue("b"), bin = getHandleValue("carry-in");
          const diff = Boolean(a !== b) !== bin;
          const borrow = (!a && b) || (!a && bin) || (b && bin);
          node.data.value = diff;
          node.data.outputValues = { sum: diff, carry: borrow };
          break;
        }

        case "SERIAL_ADDER": {
          const a = getHandleValue("a"), b = getHandleValue("b");
          const carryIn = node.data.state ?? false;
          const sum = Boolean(a !== b) !== carryIn;
          const carry = (a && b) || (a && carryIn) || (b && carryIn);
          node.data.state = carry;
          node.data.value = sum;
          node.data.outputValues = { sum, carry };
          break;
        }

        case "PARALLEL_ADDER":
        case "BCD_ADDER": {
          let carry = getHandleValue("carry-in");
          const outputs: Record<string, boolean> = {};
          let aValue = 0, bValue = 0;
          for (let i = 0; i < 4; i++) {
            if (getHandleValue(`a${i}`)) aValue |= 1 << i;
            if (getHandleValue(`b${i}`)) bValue |= 1 << i;
          }
          let total = aValue + bValue + (carry ? 1 : 0);
          if (node.data.gateType === "BCD_ADDER" && total > 9) total += 6;
          for (let i = 0; i < 4; i++) outputs[`sum-${i}`] = Boolean(total & (1 << i));
          outputs["carry-out"] = total > 15 || (node.data.gateType === "BCD_ADDER" && aValue + bValue + (carry ? 1 : 0) > 9);
          node.data.value = total !== 0;
          node.data.outputValues = outputs;
          break;
        }

        case "SR_LATCH": {
          const set = getHandleValue("set"), reset = getHandleValue("reset");
          let q = node.data.state ?? false;
          if (set && !reset) q = true; else if (reset && !set) q = false;
          node.data.state = q; node.data.value = q; node.data.outputValues = { q, "q-bar": !q }; break;
        }

        case "D_LATCH": {
          const d = getHandleValue("d"), en = getHandleValue("enable");
          let q = node.data.state ?? false; if (en) q = d;
          node.data.state = q; node.data.value = q; node.data.outputValues = { q, "q-bar": !q }; break;
        }

        case "JK_LATCH": {
          const j = getHandleValue("j"), k = getHandleValue("k"), en = getHandleValue("enable");
          let q = node.data.state ?? false;
          if (en) { if (j && k) q = !q; else if (j) q = true; else if (k) q = false; }
          node.data.state = q; node.data.value = q; node.data.outputValues = { q, "q-bar": !q }; break;
        }

        case "T_LATCH": {
          const t = getHandleValue("t"), en = getHandleValue("enable");
          let q = node.data.state ?? false; if (en && t) q = !q;
          node.data.state = q; node.data.value = q; node.data.outputValues = { q, "q-bar": !q }; break;
        }

        case "OUTPUT": {
          const input =
            incoming.length > 0
              ? getSourceValue(
                  getNode(
                    incoming[0].source
                  ),
                  incoming[0]
                )
              : false;

          node.data.value =
            input;

          break;
        }

        default: {
          const inputValues =
            incoming.map(
              (edge) =>
                getSourceValue(
                  getNode(
                    edge.source
                  ),
                  edge
                )
            );

          node.data.value =
            evaluateGate(
              node.data.gateType,
              inputValues
            );

          break;
        }
      }
    }
  }

  return nextNodes;
}

/* =========================================================
   CIRCUIT HELPERS
   ========================================================= */

function getInputNodes(
  nodes: GateNodeType[]
) {
  return nodes.filter(
    (node) =>
      node.data.gateType ===
      "INPUT"
  );
}

function getOutputNodes(
  nodes: GateNodeType[]
) {
  return nodes.filter(
    (node) =>
      node.data.gateType ===
      "OUTPUT"
  );
}

function buildBooleanExpression(
  output: GateNodeType,
  nodes: GateNodeType[],
  edges: Edge[],
  visited = new Set<string>()
): string {
  if (visited.has(output.id)) {
    return output.data.label;
  }

  const nextVisited =
    new Set(visited);

  nextVisited.add(output.id);

  if (
    output.data.gateType ===
    "INPUT"
  ) {
    return output.data.label;
  }

  const incoming =
    edges
      .filter(
        (edge) =>
          edge.target ===
          output.id
      )
      .sort((a, b) =>
        String(
          a.targetHandle
        ).localeCompare(
          String(
            b.targetHandle
          )
        )
      );

  const expressions =
    incoming.map((edge) => {
      const source =
        nodes.find(
          (node) =>
            node.id ===
            edge.source
        );

      if (!source) {
        return "0";
      }

      return buildBooleanExpression(
        source,
        nodes,
        edges,
        nextVisited
      );
    });

  switch (
    output.data.gateType
  ) {
    case "AND":
      return expressions.length
        ? `(${expressions.join(
            " · "
          )})`
        : "0";

    case "OR":
      return expressions.length
        ? `(${expressions.join(
            " + "
          )})`
        : "0";

    case "NAND":
      return expressions.length
        ? `¬(${expressions.join(
            " · "
          )})`
        : "1";

    case "NOR":
      return expressions.length
        ? `¬(${expressions.join(
            " + "
          )})`
        : "1";

    case "XOR":
      return expressions.length
        ? `(${expressions.join(
            " ⊕ "
          )})`
        : "0";

    case "XNOR":
      return expressions.length
        ? `¬(${expressions.join(
            " ⊕ "
          )})`
        : "1";

    case "NOT":
      return expressions.length
        ? `¬(${expressions[0]})`
        : "¬0";

    default:
      return expressions.length
        ? expressions.join(" ")
        : output.data.label;
  }
}

/* =========================================================
   K-MAP HELPERS
   ========================================================= */

const KMAP_VARIABLE_NAMES = [
  "A",
  "B",
  "C",
  "D",
];

const KMAP_GRAY_CODES: Record<
  number,
  string[]
> = {
  1: ["0", "1"],
  2: ["00", "01", "11", "10"],
};

/*
 * Parse user-entered minterms safely.
 */
function parseKMapMinterms(
  value: string,
  variableCount: number
): number[] {
  const max =
    2 ** variableCount;

  return [
    ...new Set(
      value
        .split(",")
        .map((item) =>
          Number(item.trim())
        )
        .filter(
          (item) =>
            Number.isInteger(item) &&
            item >= 0 &&
            item < max
        )
    ),
  ].sort((a, b) => a - b);
}

/*
 * Convert a pattern such as:
 *
 * 0-1-
 *
 * into all minterms covered by that implicant.
 */
function getPatternMinterms(
  pattern: string
): number[] {
  const results: number[] = [];

  const build = (
    index: number,
    current: string
  ) => {
    if (
      index ===
      pattern.length
    ) {
      results.push(
        parseInt(current, 2)
      );
      return;
    }

    const bit =
      pattern[index];

    if (bit === "-") {
      build(
        index + 1,
        current + "0"
      );

      build(
        index + 1,
        current + "1"
      );
    } else {
      build(
        index + 1,
        current + bit
      );
    }
  };

  build(0, "");

  return results.sort(
    (a, b) => a - b
  );
}

/*
 * Check whether an implicant pattern covers
 * a specific minterm.
 */
function patternCoversMinterm(
  pattern: string,
  minterm: number
): boolean {
  const bits =
    minterm
      .toString(2)
      .padStart(
        pattern.length,
        "0"
      );

  return pattern
    .split("")
    .every(
      (char, index) =>
        char === "-" ||
        char === bits[index]
    );
}

/*
 * Number of actual literals in an implicant.
 *
 * Example:
 * A-B-
 *
 * has 2 literals.
 */
function countLiterals(
  pattern: string
): number {
  return pattern
    .split("")
    .filter(
      (bit) => bit !== "-"
    ).length;
}

/*
 * Convert:
 *
 * 0-1-
 *
 * into:
 *
 * A'C
 */
function patternToTerm(
  pattern: string
): string {
  if (
    pattern
      .split("")
      .every(
        (bit) => bit === "-"
      )
  ) {
    return "1";
  }

  const terms: string[] = [];

  pattern
    .split("")
    .forEach(
      (bit, index) => {
        if (bit === "-") {
          return;
        }

        const variable =
          KMAP_VARIABLE_NAMES[
            index
          ];

        terms.push(
          bit === "1"
            ? variable
            : `${variable}'`
        );
      }
    );

  return terms.join("");
}

/*
 * Generate every possible implicant:
 *
 * 0000
 * 000-
 * 00--
 * 0---
 * ----
 * ...
 *
 * Keep only implicants whose covered cells
 * are completely inside the ON-set.
 */
function generatePrimeImplicants(
  minterms: number[],
  variableCount: number
): string[] {
  const onSet =
    new Set(minterms);

  const patterns: string[] = [];

  const generate = (
    index: number,
    current: string
  ) => {
    if (
      index ===
      variableCount
    ) {
      const covered =
        getPatternMinterms(
          current
        );

      if (
        covered.length > 0 &&
        covered.every(
          (m) => onSet.has(m)
        )
      ) {
        patterns.push(current);
      }

      return;
    }

    generate(
      index + 1,
      current + "0"
    );

    generate(
      index + 1,
      current + "1"
    );

    generate(
      index + 1,
      current + "-"
    );
  };

  generate(0, "");

  /*
   * Remove implicants that are completely
   * contained by a larger implicant.
   *
   * Example:
   *
   * 00--
   *
   * makes:
   *
   * 000-
   * 001-
   * unnecessary.
   */
  const primes =
    patterns.filter(
      (pattern) => {
        return !patterns.some(
          (other) => {
            if (
              other === pattern
            ) {
              return false;
            }

            const otherLiterals =
              countLiterals(
                other
              );

            const currentLiterals =
              countLiterals(
                pattern
              );

            if (
              otherLiterals >=
              currentLiterals
            ) {
              return false;
            }

            const covered =
              getPatternMinterms(
                pattern
              );

            return covered.every(
              (m) =>
                patternCoversMinterm(
                  other,
                  m
                )
            );
          }
        );
      }
    );

  return [
    ...new Set(primes),
  ];
}

/*
 * Find a minimal SOP cover.
 *
 * The solver:
 * 1. Finds essential implicants.
 * 2. Covers remaining minterms.
 * 3. Searches combinations.
 * 4. Prefers fewer groups.
 * 5. Then prefers fewer literals.
 */
function solveKMap(
  minterms: number[],
  variableCount: number
): string[] {
  const normalized = [
    ...new Set(minterms),
  ].sort(
    (a, b) => a - b
  );

  const total =
    2 ** variableCount;

  /*
   * All cells active.
   * Function = 1.
   */
  if (
    normalized.length ===
    total
  ) {
    return [
      "-".repeat(
        variableCount
      ),
    ];
  }

  /*
   * No cells active.
   * Function = 0.
   */
  if (
    normalized.length ===
    0
  ) {
    return [];
  }

  const primes =
    generatePrimeImplicants(
      normalized,
      variableCount
    );

  const coverage =
    new Map<
      number,
      string[]
    >();

  normalized.forEach(
    (minterm) => {
      coverage.set(
        minterm,
        primes.filter(
          (pattern) =>
            patternCoversMinterm(
              pattern,
              minterm
            )
        )
      );
    }
  );

  const selected =
    new Set<string>();

  /*
   * Essential prime implicants.
   */
  normalized.forEach(
    (minterm) => {
      const covers =
        coverage.get(
          minterm
        ) ?? [];

      if (
        covers.length ===
        1
      ) {
        selected.add(
          covers[0]
        );
      }
    }
  );

  const isCovered = (
    minterm: number,
    selectedPatterns: Set<string>
  ) =>
    [...selectedPatterns].some(
      (pattern) =>
        patternCoversMinterm(
          pattern,
          minterm
        )
    );

  let remaining =
    normalized.filter(
      (minterm) =>
        !isCovered(
          minterm,
          selected
        )
    );

  if (
    remaining.length ===
    0
  ) {
    return [...selected];
  }

  /*
   * Recursive minimum cover search.
   */
  let best:
    | string[]
    | null = null;

  const search = (
    uncovered: number[],
    chosen: string[]
  ) => {
    if (
      uncovered.length ===
      0
    ) {
      if (
        best === null ||
        chosen.length <
          best.length ||
        (
          chosen.length ===
            best.length &&
          chosen.reduce(
            (sum, pattern) =>
              sum +
              countLiterals(
                pattern
              ),
            0
          ) <
            best.reduce(
              (
                sum,
                pattern
              ) =>
                sum +
                countLiterals(
                  pattern
                ),
              0
            )
        )
      ) {
        best = [
          ...chosen,
        ];
      }

      return;
    }

    /*
     * Stop branches that can no longer
     * improve the current answer.
     */
    if (
      best &&
      chosen.length >=
        best.length
    ) {
      return;
    }

    /*
     * Pick the uncovered minterm with
     * the fewest available choices.
     */
    const target =
      [...uncovered].sort(
        (a, b) => {
          const aCount =
            (
              coverage.get(
                a
              ) ?? []
            ).length;

          const bCount =
            (
              coverage.get(
                b
              ) ?? []
            ).length;

          return (
            aCount -
            bCount
          );
        }
      )[0];

    const candidates =
      (
        coverage.get(
          target
        ) ?? []
      )
        .filter(
          (pattern) =>
            !chosen.includes(
              pattern
            )
        )
        .sort(
          (a, b) =>
            getPatternMinterms(
              b
            ).length -
              getPatternMinterms(
                a
              ).length ||
            countLiterals(a) -
              countLiterals(b)
        );

    for (const pattern of candidates) {
      const nextUncovered =
        uncovered.filter(
          (minterm) =>
            !patternCoversMinterm(
              pattern,
              minterm
            )
        );

      search(
        nextUncovered,
        [
          ...chosen,
          pattern,
        ]
      );
    }
  };

  search(
    remaining,
    [...selected]
  );

  /*
   * If the recursive search didn't find
   * anything beyond essentials, use them.
   */
  const bestSolution =
    best as string[] | null;

  if (bestSolution) {
    return bestSolution;
  }

  return [...selected];
}

/*
 * K-map layout:
 *
 * 2 variable:
 *        B
 *        0 1
 * A 0
 *   1
 *
 * 3 variable:
 *          BC
 *        00 01 11 10
 * A 0
 *   1
 *
 * 4 variable:
 *           CD
 *        00 01 11 10
 * AB 00
 *    01
 *    11
 *    10
 */
function getKMapLayout(
  variableCount: number
) {
  if (
    variableCount ===
    2
  ) {
    return {
      rowBits: KMAP_GRAY_CODES[1],
      colBits: KMAP_GRAY_CODES[1],
      rowVariables: ["A"],
      colVariables: ["B"],
    };
  }

  if (
    variableCount ===
    3
  ) {
    return {
      rowBits: KMAP_GRAY_CODES[1],
      colBits: KMAP_GRAY_CODES[2],
      rowVariables: ["A"],
      colVariables: ["B", "C"],
    };
  }

  return {
    rowBits: KMAP_GRAY_CODES[2],
    colBits: KMAP_GRAY_CODES[2],
    rowVariables: ["A", "B"],
    colVariables: ["C", "D"],
  };
}

function getMintermFromCell(
  rowBits: string,
  colBits: string
): number {
  return parseInt(
    rowBits + colBits,
    2
  );
}


/* =========================================================
   BOOLEAN EXPRESSION ENGINE
   ========================================================= */

type BoolAst =
  | { kind: "var"; name: string }
  | { kind: "not"; child: BoolAst }
  | { kind: "and"; left: BoolAst; right: BoolAst }
  | { kind: "or"; left: BoolAst; right: BoolAst };

function tokenizeBooleanExpression(expression: string): string[] {
  const normalized = expression
    .replace(/[¬!~]/g, "!")
    .replace(/[·*]/g, "*")
    .replace(/[+∨]/g, "+")
    .replace(/\s+/g, "");
  const tokens = normalized.match(/[A-Za-z][A-Za-z0-9_]*|[01]|[+*.!()']/g) ?? [];
  return tokens;
}

function parseBooleanExpression(expression: string): { ast: BoolAst; variables: string[] } {
  const tokens = tokenizeBooleanExpression(expression);
  let index = 0;
  const variables = new Set<string>();

  const peek = () => tokens[index];
  const take = () => tokens[index++];
  const startsAtom = (token: string | undefined) => !!token && (/^[A-Za-z0-9]/.test(token) || token === "(" || token === "!");

  const parseOr = (): BoolAst => {
    let node = parseAnd();
    while (peek() === "+") {
      take();
      node = { kind: "or", left: node, right: parseAnd() };
    }
    return node;
  };

  const parseAnd = (): BoolAst => {
    let node = parseUnary();
    while (peek() === "*" || peek() === "." || startsAtom(peek())) {
      if (peek() === "*" || peek() === ".") take();
      node = { kind: "and", left: node, right: parseUnary() };
    }
    return node;
  };

  const parseUnary = (): BoolAst => {
    if (peek() === "!") {
      take();
      return { kind: "not", child: parseUnary() };
    }
    let node = parsePrimary();
    while (peek() === "'") {
      take();
      node = { kind: "not", child: node };
    }
    return node;
  };

  const parsePrimary = (): BoolAst => {
    const token = take();
    if (!token) throw new Error("Unexpected end of expression.");
    if (token === "(") {
      const node = parseOr();
      if (take() !== ")") throw new Error("Missing closing parenthesis.");
      return node;
    }
    if (token === "0" || token === "1") {
      return { kind: "var", name: token };
    }
    if (/^[A-Za-z]/.test(token)) {
      variables.add(token);
      return { kind: "var", name: token };
    }
    throw new Error(`Unexpected token: ${token}`);
  };

  const ast = parseOr();
  if (index < tokens.length) throw new Error(`Unexpected token: ${tokens[index]}`);
  return { ast, variables: [...variables].sort() };
}

function evaluateBooleanAst(ast: BoolAst, values: Record<string, boolean>): boolean {
  switch (ast.kind) {
    case "var": return ast.name === "1" ? true : ast.name === "0" ? false : !!values[ast.name];
    case "not": return !evaluateBooleanAst(ast.child, values);
    case "and": return evaluateBooleanAst(ast.left, values) && evaluateBooleanAst(ast.right, values);
    case "or": return evaluateBooleanAst(ast.left, values) || evaluateBooleanAst(ast.right, values);
  }
}

function astToExpression(ast: BoolAst): string {
  switch (ast.kind) {
    case "var": return ast.name;
    case "not": return `¬(${astToExpression(ast.child)})`;
    case "and": return `(${astToExpression(ast.left)} · ${astToExpression(ast.right)})`;
    case "or": return `(${astToExpression(ast.left)} + ${astToExpression(ast.right)})`;
  }
}

function baseToDecimal(value: string, base: number): number {
  const clean = value.trim();
  if (!clean) throw new Error("Enter a value.");
  const result = parseInt(clean, base);
  if (!Number.isFinite(result) || result < 0 || result.toString(base).toUpperCase() !== clean.replace(/^0+/, "").toLowerCase() && clean !== "0") {
    throw new Error("Invalid number for the selected base.");
  }
  return result;
}

function decimalToBase(value: number, base: number): string {
  return Math.trunc(value).toString(base).toUpperCase();
}

function binaryToGray(binary: string): string {
  const bits = binary.replace(/\s/g, "");
  if (!/^[01]+$/.test(bits)) throw new Error("Binary value must contain only 0 and 1.");
  let out = bits[0];
  for (let i = 1; i < bits.length; i++) out += String(Number(bits[i - 1]) ^ Number(bits[i]));
  return out;
}

function grayToBinary(gray: string): string {
  const bits = gray.replace(/\s/g, "");
  if (!/^[01]+$/.test(bits)) throw new Error("Gray code must contain only 0 and 1.");
  let out = bits[0];
  for (let i = 1; i < bits.length; i++) out += String(Number(out[i - 1]) ^ Number(bits[i]));
  return out;
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

function CircuitDesignerContent() {
  const [
    nodes,
    setNodes,
    onNodesChange,
  ] =
    useNodesState<GateNodeType>(
      cloneNodes(initialNodes)
    );

  const [
    edges,
    setEdges,
    onEdgesChange,
  ] =
    useEdgesState(
      cloneEdges(initialEdges)
    );

  const [running, setRunning] =
    useState(false);

  const [
    truthTable,
    setTruthTable,
  ] =
    useState<TruthTableData | null>(
      null
    );

  const [
    selectedNode,
    setSelectedNode,
  ] =
    useState<GateNodeType | null>(
      null
    );

  const [
    componentSearch,
    setComponentSearch,
  ] = useState("");

  const [status, setStatus] =
    useState("Ready");

  const [
    booleanExpression,
    setBooleanExpression,
  ] = useState("");

  const [
    kmapVariables,
    setKmapVariables,
  ] = useState(3);

  const [
    kmapMinterms,
    setKmapMinterms,
  ] = useState("");

  const [
    kmapResult,
    setKmapResult,
  ] = useState<number[]>([]);

  const [
    kmapGroups,
    setKmapGroups,
  ] = useState<KMapGroup[]>([]);

  const [
    kmapExpression,
    setKmapExpression,
  ] = useState("");

  const [expressionInput, setExpressionInput] = useState("");
  const [expressionVariables, setExpressionVariables] = useState<string[]>([]);
  const [converterFrom, setConverterFrom] = useState("binary");
  const [converterTo, setConverterTo] = useState("decimal");
  const [converterValue, setConverterValue] = useState("");
  const [converterResult, setConverterResult] = useState("");
  const [converterError, setConverterError] = useState("");

  const [history, setHistory] =
    useState<HistoryState[]>([]);

  const [future, setFuture] =
    useState<HistoryState[]>([]);

  const [
    clockRunning,
    setClockRunning,
  ] = useState(false);

  const [
    clockValue,
    setClockValue,
  ] = useState(false);

  const [
    clockSpeed,
    setClockSpeed,
  ] = useState(1000);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const clipboardRef =
    useRef<GateNodeType[]>([]);

  const previousClockRef =
    useRef<
      Record<string, boolean>
    >({});

  const clockTimerRef =
    useRef<number | null>(null);

  const {
    screenToFlowPosition,
    fitView,
  } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      gate: GateNode,
    }),
    []
  );

  const filteredGates =
    useMemo(
      () =>
        gateTypes.filter((type) =>
          gateNames[type]
            .toLowerCase()
            .includes(
              componentSearch.toLowerCase()
            )
        ),
      [componentSearch]
    );

  /* =======================================================
     HISTORY
     ======================================================= */

  const remember = useCallback(
    () => {
      setHistory((current) => [
        ...current.slice(-49),
        {
          nodes:
            cloneNodes(nodes),
          edges:
            cloneEdges(edges),
        },
      ]);

      setFuture([]);
    },
    [nodes, edges]
  );

  /* =======================================================
     CONNECTIONS
     ======================================================= */

  const onConnect =
    useCallback(
      (connection: Connection) => {
        if (
          !connection.source ||
          !connection.target
        ) {
          return;
        }

        const sourceNode =
          nodes.find(
            (node) =>
              node.id ===
              connection.source
          );

        const targetNode =
          nodes.find(
            (node) =>
              node.id ===
              connection.target
          );

        if (
          !sourceNode ||
          !targetNode
        ) {
          return;
        }

        if (
          sourceNode.data
            .gateType ===
          "OUTPUT"
        ) {
          setStatus(
            "OUTPUT nodes cannot be sources."
          );
          return;
        }

        if (
          targetNode.data
            .gateType ===
          "INPUT"
        ) {
          setStatus(
            "INPUT nodes cannot be targets."
          );
          return;
        }

        if (
          connection.source ===
          connection.target
        ) {
          setStatus(
            "A component cannot connect to itself."
          );
          return;
        }

        const duplicate =
          edges.some(
            (edge) =>
              edge.source ===
                connection.source &&
              edge.target ===
                connection.target &&
              edge.sourceHandle ===
                connection.sourceHandle &&
              edge.targetHandle ===
                connection.targetHandle
          );

        if (duplicate) {
          return;
        }

        remember();

        setEdges((current) =>
          addEdge(
            {
              ...connection,
              animated: true,
            },
            current
          )
        );

        setStatus(
          "Connection created."
        );
      },
      [
        nodes,
        edges,
        remember,
        setEdges,
      ]
    );

  /* =======================================================
     INPUT TOGGLE
     ======================================================= */

  const toggleInput =
    useCallback(
      (id: string) => {
        remember();

        setNodes((current) =>
          current.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    value:
                      !node.data
                        .value,
                  },
                }
              : node
          )
        );

        setStatus(
          "Input toggled."
        );
      },
      [remember, setNodes]
    );

  const onNodeClick =
    useCallback(
      (
        _: React.MouseEvent,
        node: GateNodeType
      ) => {
        setSelectedNode(node);

        if (
          node.data.gateType ===
          "INPUT"
        ) {
          toggleInput(node.id);
        }
      },
      [toggleInput]
    );

  /* =======================================================
     DRAG AND DROP
     ======================================================= */

  const onDragStart = (
    event: DragEvent,
    gate: GateType
  ) => {
    event.dataTransfer.setData(
      "application/logiclab-gate",
      gate
    );

    event.dataTransfer.effectAllowed =
      "move";
  };

  const onDragOver = (
    event: React.DragEvent
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";
  };

  const onDrop = (
    event: React.DragEvent
  ) => {
    event.preventDefault();

    const gate =
      event.dataTransfer.getData(
        "application/logiclab-gate"
      ) as GateType;

    if (!gate) {
      return;
    }

    const position =
      screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

    const id = `${gate.toLowerCase()}-${Date.now()}`;

    const newNode: GateNodeType = {
      id,
      type: "gate",
      position,
      data: {
        label: gateNames[gate],
        gateType: gate,
        value: false,
      },
    };

    remember();

    setNodes((current) => [
      ...current,
      newNode,
    ]);

    setStatus(
      `${gateNames[gate]} added.`
    );
  };
  /* =======================================================
     DELETE
     ======================================================= */

  const deleteSelected =
    useCallback(() => {
      if (!selectedNode) {
        return;
      }

      remember();

      setNodes((current) =>
        current.filter(
          (node) =>
            node.id !==
            selectedNode.id
        )
      );

      setEdges((current) =>
        current.filter(
          (edge) =>
            edge.source !==
              selectedNode.id &&
            edge.target !==
              selectedNode.id
        )
      );

      setSelectedNode(null);

      setStatus(
        "Component deleted."
      );
    }, [
      selectedNode,
      remember,
      setNodes,
      setEdges,
    ]);

  /* =======================================================
     DUPLICATE
     ======================================================= */

  const duplicateSelected =
    useCallback(() => {
      if (!selectedNode) {
        setStatus(
          "Select a component first."
        );
        return;
      }

      remember();

      const copy: GateNodeType =
        {
          ...structuredClone(
            selectedNode
          ),
          id: `${selectedNode.data.gateType.toLowerCase()}-${Date.now()}`,
          position: {
            x:
              selectedNode.position
                .x + 60,
            y:
              selectedNode.position
                .y + 60,
          },
          selected: false,
        };

      setNodes((current) => [
        ...current,
        copy,
      ]);

      setSelectedNode(copy);

      setStatus(
        "Component duplicated."
      );
    }, [
      selectedNode,
      remember,
      setNodes,
    ]);

  /* =======================================================
     COPY
     ======================================================= */

  const copySelected =
    useCallback(() => {
      if (!selectedNode) {
        return;
      }

      clipboardRef.current = [
        structuredClone(
          selectedNode
        ),
      ];

      setStatus(
        "Component copied."
      );
    }, [selectedNode]);

  /* =======================================================
     PASTE
     ======================================================= */

  const pasteCopied =
    useCallback(() => {
      if (
        !clipboardRef.current.length
      ) {
        setStatus(
          "Clipboard is empty."
        );
        return;
      }

      remember();

      const pasted =
        clipboardRef.current.map(
          (node) => ({
            ...structuredClone(
              node
            ),
            id: `${node.data.gateType.toLowerCase()}-${Date.now()}`,
            position: {
              x:
                node.position.x +
                80,
              y:
                node.position.y +
                80,
            },
            selected: false,
          })
        );

      setNodes((current) => [
        ...current,
        ...pasted,
      ]);

      setSelectedNode(
        pasted[0]
      );

      setStatus(
        "Component pasted."
      );
    }, [
      remember,
      setNodes,
    ]);

  /* =======================================================
     UNDO
     ======================================================= */

  const undo = useCallback(
    () => {
      const last =
        history[
          history.length - 1
        ];

      if (!last) {
        return;
      }

      setFuture((current) => [
        ...current,
        {
          nodes:
            cloneNodes(nodes),
          edges:
            cloneEdges(edges),
        },
      ]);

      setNodes(
        cloneNodes(last.nodes)
      );

      setEdges(
        cloneEdges(last.edges)
      );

      setHistory((current) =>
        current.slice(0, -1)
      );

      setSelectedNode(null);

      setStatus("Undo.");
    },
    [
      history,
      nodes,
      edges,
      setNodes,
      setEdges,
    ]
  );

  /* =======================================================
     REDO
     ======================================================= */

  const redo = useCallback(
    () => {
      const next =
        future[
          future.length - 1
        ];

      if (!next) {
        return;
      }

      setHistory((current) => [
        ...current,
        {
          nodes:
            cloneNodes(nodes),
          edges:
            cloneEdges(edges),
        },
      ]);

      setNodes(
        cloneNodes(next.nodes)
      );

      setEdges(
        cloneEdges(next.edges)
      );

      setFuture((current) =>
        current.slice(0, -1)
      );

      setSelectedNode(null);

      setStatus("Redo.");
    },
    [
      future,
      nodes,
      edges,
      setNodes,
      setEdges,
    ]
  );

  /* =======================================================
     SIMULATION
     ======================================================= */

  const simulate =
    useCallback(() => {
      setRunning(true);

      const result =
        calculateNextState(
          nodes,
          edges,
          clockValue,
          previousClockRef.current
        );

      setNodes(result);

      previousClockRef.current =
        Object.fromEntries(
          nodes.map((node) => [
            node.id,
            clockValue,
          ])
        );

      window.setTimeout(() => {
        setRunning(false);
      }, 350);

      setStatus(
        "Simulation complete."
      );
    }, [
      nodes,
      edges,
      clockValue,
      setNodes,
    ]);

  /* =======================================================
     CLOCK
     ======================================================= */

  const pulseClock =
    useCallback(() => {
      const result =
        calculateNextState(
          nodes,
          edges,
          true,
          previousClockRef.current
        );

      setClockValue(true);
      setNodes(result);

      previousClockRef.current =
        Object.fromEntries(
          nodes.map((node) => [
            node.id,
            true,
          ])
        );

      window.setTimeout(() => {
        setClockValue(false);

        setStatus(
          "Clock pulse complete."
        );
      }, 120);
    }, [
      nodes,
      edges,
      setNodes,
    ]);

  useEffect(() => {
    if (!clockRunning) {
      if (
        clockTimerRef.current !==
        null
      ) {
        window.clearInterval(
          clockTimerRef.current
        );

        clockTimerRef.current =
          null;
      }

      return;
    }

    clockTimerRef.current =
      window.setInterval(() => {
        pulseClock();
      }, clockSpeed);

    return () => {
      if (
        clockTimerRef.current !==
        null
      ) {
        window.clearInterval(
          clockTimerRef.current
        );

        clockTimerRef.current =
          null;
      }
    };
  }, [
    clockRunning,
    clockSpeed,
    pulseClock,
  ]);

  /* =======================================================
     RESET
     ======================================================= */

  const resetCircuit =
    useCallback(() => {
      remember();

      setNodes(
        cloneNodes(initialNodes)
      );

      setEdges(
        cloneEdges(initialEdges)
      );

      setTruthTable(null);
      setBooleanExpression("");
      setSelectedNode(null);

      setKmapResult([]);
      setKmapGroups([]);
      setKmapExpression("");

      previousClockRef.current =
        {};

      setClockValue(false);
      setClockRunning(false);

      setStatus(
        "Circuit reset."
      );
    }, [
      remember,
      setNodes,
      setEdges,
    ]);

  /* =======================================================
     CLEAR
     ======================================================= */

  const clearCircuit =
    useCallback(() => {
      remember();

      setNodes([]);
      setEdges([]);

      setTruthTable(null);
      setBooleanExpression("");
      setSelectedNode(null);

      setKmapResult([]);
      setKmapGroups([]);
      setKmapExpression("");

      previousClockRef.current =
        {};

      setClockValue(false);
      setClockRunning(false);

      setStatus(
        "Circuit cleared."
      );
    }, [
      remember,
      setNodes,
      setEdges,
    ]);

  /* =======================================================
     LABEL
     ======================================================= */

  const updateLabel = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectedNode) {
      return;
    }

    const value =
      event.target.value;

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                label: value,
              },
            }
          : node
      )
    );

    setSelectedNode((current) =>
      current
        ? {
            ...current,
            data: {
              ...current.data,
              label: value,
            },
          }
        : current
    );
  };

  /* =======================================================
     TRUTH TABLE
     ======================================================= */

  const generateTruthTable =
    useCallback(() => {
      const inputs =
        getInputNodes(nodes);

      const outputs =
        getOutputNodes(nodes);

      if (!inputs.length) {
        setStatus(
          "Add at least one INPUT."
        );
        return;
      }

      if (!outputs.length) {
        setStatus(
          "Add at least one OUTPUT."
        );
        return;
      }

      if (inputs.length > 8) {
        setStatus(
          "Truth table is limited to 8 inputs."
        );
        return;
      }

      const rows: Record<
        string,
        number | boolean
      >[] = [];

      const total =
        2 ** inputs.length;

      for (
        let mask = 0;
        mask < total;
        mask++
      ) {
        const testNodes =
          cloneNodes(nodes);

        inputs.forEach(
          (input, index) => {
            const value =
              Boolean(
                mask &
                  (1 <<
                    (inputs.length -
                      1 -
                      index))
              );

            const target =
              testNodes.find(
                (node) =>
                  node.id ===
                  input.id
              );

            if (target) {
              target.data.value =
                value;
            }
          }
        );

        const result =
          calculateNextState(
            testNodes,
            edges
          );

        const row: Record<
          string,
          number | boolean
        > = {};

        inputs.forEach(
          (input) => {
            const node =
              result.find(
                (item) =>
                  item.id ===
                  input.id
              );

            row[
              input.data.label
            ] =
              node?.data.value ??
              false;
          }
        );

        outputs.forEach(
          (output) => {
            const node =
              result.find(
                (item) =>
                  item.id ===
                  output.id
              );

            row[
              output.data.label
            ] =
              node?.data.value ??
              false;
          }
        );

        rows.push(row);
      }

      setTruthTable({
        inputs: inputs.map(
          (input) =>
            input.data.label
        ),
        outputs: outputs.map(
          (output) =>
            output.data.label
        ),
        rows,
      });

      setStatus(
        "Truth table generated."
      );
    }, [nodes, edges]);

  /* =======================================================
     BOOLEAN EXPRESSION
     ======================================================= */

  const generateBooleanExpression =
    useCallback(() => {
      const outputs =
        getOutputNodes(nodes);

      if (!outputs.length) {
        setStatus(
          "Add an OUTPUT first."
        );
        return;
      }

      const expression =
        buildBooleanExpression(
          outputs[0],
          nodes,
          edges
        );

      setBooleanExpression(
        `${outputs[0].data.label} = ${expression}`
      );

      setStatus(
        "Boolean expression generated."
      );
    }, [nodes, edges]);

  /* =======================================================
     NEW K-MAP GENERATOR
     ======================================================= */

  const generateKMap =
    useCallback(() => {
      const cleaned =
        parseKMapMinterms(
          kmapMinterms,
          kmapVariables
        );

      setKmapResult(cleaned);

      /*
       * No minterms = F = 0
       */
      if (
        cleaned.length ===
        0
      ) {
        setKmapGroups([]);
        setKmapExpression("0");

        setStatus(
          "K-map generated: F = 0."
        );

        return;
      }

      /*
       * All minterms = F = 1
       */
      if (
        cleaned.length ===
        2 ** kmapVariables
      ) {
        const pattern =
          "-".repeat(
            kmapVariables
          );

        const group: KMapGroup =
          {
            id: 1,
            pattern,
            minterms:
              cleaned,
            term: "1",
          };

        setKmapGroups([
          group,
        ]);

        setKmapExpression("1");

        setStatus(
          "K-map minimized successfully."
        );

        return;
      }

      const solution =
        solveKMap(
          cleaned,
          kmapVariables
        );

      const groups: KMapGroup[] =
        solution.map(
          (
            pattern,
            index
          ) => ({
            id:
              index + 1,
            pattern,
            minterms:
              getPatternMinterms(
                pattern
              ).filter(
                (m) =>
                  cleaned.includes(
                    m
                  )
              ),
            term:
              patternToTerm(
                pattern
              ),
          })
        );

      /*
       * Sort largest groups first.
       */
      groups.sort(
        (a, b) =>
          b.minterms.length -
            a.minterms.length ||
          countLiterals(
            a.pattern
          ) -
            countLiterals(
              b.pattern
            )
      );

      /*
       * Re-number after sorting.
       */
      groups.forEach(
        (group, index) => {
          group.id =
            index + 1;
        }
      );

      const expression =
        groups.length
          ? groups
              .map(
                (group) =>
                  group.term
              )
              .join(" + ")
          : "0";

      setKmapGroups(groups);
      setKmapExpression(
        expression
      );

      setStatus(
        "K-map minimized successfully."
      );
    }, [
      kmapMinterms,
      kmapVariables,
    ]);


  /* =======================================================
     EXPRESSION / K-MAP CIRCUIT GENERATION
     ======================================================= */

  const buildCircuitFromAst = useCallback((ast: BoolAst, variables: string[]) => {
    const newNodes: GateNodeType[] = [];
    const newEdges: Edge[] = [];
    const variableNodes = new Map<string, GateNodeType>();
    let nodeCounter = 0;

    variables.forEach((name, i) => {
      const node: GateNodeType = {
        id: `expr-input-${name}-${Date.now()}-${i}`,
        type: "gate",
        position: { x: 60, y: 80 + i * 100 },
        data: { label: name, gateType: "INPUT", value: false },
      };
      variableNodes.set(name, node);
      newNodes.push(node);
    });

    const build = (nodeAst: BoolAst, x: number, y: number): GateNodeType => {
      if (nodeAst.kind === "var") {
        if (nodeAst.name === "0" || nodeAst.name === "1") {
          const node: GateNodeType = { id: `const-${nodeCounter++}-${Date.now()}`, type: "gate", position: { x, y }, data: { label: nodeAst.name, gateType: "INPUT", value: nodeAst.name === "1" } };
          newNodes.push(node);
          return node;
        }
        return variableNodes.get(nodeAst.name)!;
      }

      const gateType: GateType = nodeAst.kind === "not" ? "NOT" : nodeAst.kind === "and" ? "AND" : "OR";
      const node: GateNodeType = {
        id: `expr-${gateType.toLowerCase()}-${nodeCounter++}-${Date.now()}`,
        type: "gate",
        position: { x, y },
        data: { label: gateNames[gateType], gateType, value: false },
      };
      newNodes.push(node);

      if (nodeAst.kind === "not") {
        const source = build(nodeAst.child, x - 180, y);
        newEdges.push({ id: `edge-${nodeCounter}-${Date.now()}`, source: source.id, target: node.id, targetHandle: "input-1", animated: true });
      } else {
        const left = build(nodeAst.left, x - 180, y - 35);
        const right = build(nodeAst.right, x - 180, y + 35);
        newEdges.push({ id: `edge-${nodeCounter++}-${Date.now()}`, source: left.id, target: node.id, targetHandle: "input-1", animated: true });
        newEdges.push({ id: `edge-${nodeCounter++}-${Date.now()}`, source: right.id, target: node.id, targetHandle: "input-2", animated: true });
      }
      return node;
    };

    const root = build(ast, 520, 260);
    const output: GateNodeType = { id: `expr-output-${Date.now()}`, type: "gate", position: { x: 760, y: 260 }, data: { label: "OUTPUT F", gateType: "OUTPUT", value: false } };
    newNodes.push(output);
    newEdges.push({ id: `edge-output-${Date.now()}`, source: root.id, target: output.id, animated: true });

    remember();
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
    setTruthTable(null);
    setBooleanExpression(`F = ${astToExpression(ast)}`);
    setStatus("Circuit generated from Boolean expression.");
  }, [remember, setNodes, setEdges]);

  const generateCircuitFromExpression = useCallback(() => {
    try {
      const parsed = parseBooleanExpression(expressionInput);
      if (parsed.variables.length > 8) throw new Error("Use at most 8 variables for a generated circuit.");
      setExpressionVariables(parsed.variables);
      buildCircuitFromAst(parsed.ast, parsed.variables);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid Boolean expression.");
    }
  }, [expressionInput, buildCircuitFromAst]);

  const generateAnalysisFromExpression = useCallback(() => {
    try {
      const parsed = parseBooleanExpression(expressionInput);
      if (parsed.variables.length === 0 || parsed.variables.length > 4) throw new Error("Expression-to-K-map supports 1 to 4 variables.");
      setExpressionVariables(parsed.variables);
      const total = 2 ** parsed.variables.length;
      const minterms: number[] = [];
      for (let mask = 0; mask < total; mask++) {
        const values: Record<string, boolean> = {};
        parsed.variables.forEach((name, i) => values[name] = Boolean(mask & (1 << (parsed.variables.length - 1 - i))));
        if (evaluateBooleanAst(parsed.ast, values)) minterms.push(mask);
      }
      setKmapVariables(parsed.variables.length);
      setKmapMinterms(minterms.join(","));
      setKmapResult(minterms);
      const solution = solveKMap(minterms, parsed.variables.length);
      const groups = solution.map((pattern, index) => ({ id: index + 1, pattern, minterms: getPatternMinterms(pattern).filter(m => minterms.includes(m)), term: patternToTerm(pattern) }));
      setKmapGroups(groups);
      setKmapExpression(groups.length ? groups.map(g => g.term).join(" + ") : "0");

      const inputs = parsed.variables;
      const rows: Record<string, number | boolean>[] = [];
      for (let mask = 0; mask < total; mask++) {
        const values: Record<string, boolean> = {};
        inputs.forEach((name, i) => values[name] = Boolean(mask & (1 << (inputs.length - 1 - i))));
        rows.push({ ...Object.fromEntries(inputs.map(name => [name, values[name]])), F: evaluateBooleanAst(parsed.ast, values) });
      }
      setTruthTable({ inputs, outputs: ["F"], rows });
      setBooleanExpression(`F = ${astToExpression(parsed.ast)}`);
      setStatus("Expression converted to K-map and truth table.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid Boolean expression.");
    }
  }, [expressionInput]);

  const generateCircuitFromKMap = useCallback(() => {
    if (!kmapExpression) {
      setStatus("Generate a K-map first.");
      return;
    }
    setExpressionInput(kmapExpression);
    try {
      const parsed = parseBooleanExpression(kmapExpression);
      buildCircuitFromAst(parsed.ast, parsed.variables);
      setStatus("Circuit generated from K-map expression.");
    } catch {
      setStatus("Could not convert the K-map expression to a circuit.");
    }
  }, [kmapExpression, buildCircuitFromAst]);

  /* =======================================================
     NUMBER / CODE CONVERTERS
     ======================================================= */

  const runConverter = useCallback(() => {
    try {
      setConverterError("");
      const from = converterFrom;
      const to = converterTo;
      const value = converterValue.trim();
      if (!value) throw new Error("Enter a value.");

      if (from === "gray" || to === "gray") {
        if (from === "binary" && to === "gray") {
          setConverterResult(binaryToGray(value));
          return;
        }
        if (from === "gray" && to === "binary") {
          setConverterResult(grayToBinary(value));
          return;
        }
        throw new Error("Gray conversion is available only between Binary and Gray Code.");
      }

      const bases: Record<string, number> = { binary: 2, octal: 8, decimal: 10, hexadecimal: 16 };
      const decimal = baseToDecimal(value, bases[from]);
      setConverterResult(decimalToBase(decimal, bases[to]));
    } catch (error) {
      setConverterResult("");
      setConverterError(error instanceof Error ? error.message : "Conversion failed.");
    }
  }, [converterFrom, converterTo, converterValue]);

  /* =======================================================
     SAVE
     ======================================================= */

  const saveCircuit = () => {
    const data = {
      version: 3,
      nodes,
      edges,
      savedAt:
        new Date().toISOString(),
    };

    downloadText(
      "logiclab-circuit.json",
      JSON.stringify(
        data,
        null,
        2
      ),
      "application/json"
    );

    setStatus(
      "Circuit saved."
    );
  };

  /* =======================================================
     LOAD
     ======================================================= */

  const loadCircuit = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        const data =
          JSON.parse(
            String(
              reader.result
            )
          );

        if (
          !Array.isArray(
            data.nodes
          ) ||
          !Array.isArray(
            data.edges
          )
        ) {
          throw new Error(
            "Invalid LogicLab file."
          );
        }

        remember();

        setNodes(
          data.nodes as GateNodeType[]
        );

        setEdges(
          data.edges as Edge[]
        );

        setTruthTable(null);
        setBooleanExpression("");
        setSelectedNode(null);

        setKmapResult([]);
        setKmapGroups([]);
        setKmapExpression("");

        previousClockRef.current =
          {};

        setClockValue(false);
        setClockRunning(false);

        setStatus(
          "Circuit loaded successfully."
        );
      } catch {
        setStatus(
          "Could not load the circuit file."
        );
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  };

  /* =======================================================
     EXPORT TRUTH TABLE
     ======================================================= */

  const exportTruthTable = () => {
    if (!truthTable) {
      setStatus(
        "Generate the truth table first."
      );
      return;
    }

    const header = [
      ...truthTable.inputs,
      ...truthTable.outputs,
    ];

    const csv = [
      header.join(","),
      ...truthTable.rows.map(
        (row) =>
          header
            .map((key) =>
              row[key]
                ? "1"
                : "0"
            )
            .join(",")
      ),
    ].join("\n");

    downloadText(
      "logiclab-truth-table.csv",
      csv,
      "text/csv"
    );

    setStatus(
      "Truth table exported."
    );
  };

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validateCircuit = () => {
    const problems: string[] =
      [];

    nodes.forEach((node) => {
      const type =
        node.data.gateType;

      if (
        type === "INPUT" ||
        type === "OUTPUT"
      ) {
        return;
      }

      const expected =
        getInputHandleIds(type);

      expected.forEach(
        (handle) => {
          const connected =
            edges.some(
              (edge) =>
                edge.target ===
                  node.id &&
                edge.targetHandle ===
                  handle
            );

          if (!connected) {
            problems.push(
              `${node.data.label}: ${handle} is unconnected`
            );
          }
        }
      );
    });

    if (!problems.length) {
      setStatus(
        "Circuit validation passed."
      );
    } else {
      setStatus(
        `${problems.length} connection issue(s) found.`
      );

      alert(
        "LogicLab validation:\n\n" +
          problems.join("\n")
      );
    }
  };

  /* =======================================================
     AUTOSAVE RESTORE
     ======================================================= */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const data =
        JSON.parse(saved);

      if (
        Array.isArray(
          data.nodes
        ) &&
        Array.isArray(
          data.edges
        )
      ) {
        setNodes(
          data.nodes as GateNodeType[]
        );

        setEdges(
          data.edges as Edge[]
        );

        setStatus(
          "Autosaved circuit restored."
        );
      }
    } catch {
      // Ignore invalid autosave
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     AUTOSAVE
     ======================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              nodes,
              edges,
            })
          );
        } catch {
          // Storage may be unavailable
        }
      }, 500);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [nodes, edges]);

  /* =======================================================
     KEYBOARD SHORTCUTS
     ======================================================= */

  useEffect(() => {
    const handler = (
      event: KeyboardEvent
    ) => {
      const target =
        event.target as HTMLElement;

      const editing =
        target.tagName ===
          "INPUT" ||
        target.tagName ===
          "TEXTAREA" ||
        target.tagName ===
          "SELECT";

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "z"
      ) {
        if (!editing) {
          event.preventDefault();
          undo();
        }

        return;
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "y"
      ) {
        if (!editing) {
          event.preventDefault();
          redo();
        }

        return;
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "c"
      ) {
        if (!editing) {
          event.preventDefault();
          copySelected();
        }

        return;
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "v"
      ) {
        if (!editing) {
          event.preventDefault();
          pasteCopied();
        }

        return;
      }

      if (
        event.key ===
          "Delete" ||
        event.key ===
          "Backspace"
      ) {
        if (!editing) {
          deleteSelected();
        }
      }
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handler
      );
  }, [
    undo,
    redo,
    copySelected,
    pasteCopied,
    deleteSelected,
  ]);

  /* =======================================================
     SELECTED NODE PREVIEW
     ======================================================= */

  const selectedOutputPreview =
    selectedNode?.data
      .outputValues
      ? Object.entries(
          selectedNode.data
            .outputValues
        )
          .map(
            ([key, value]) =>
              `${key}: ${
                value ? 1 : 0
              }`
          )
          .join(" | ")
      : selectedNode
        ? `Value: ${
            selectedNode.data
              .value
              ? 1
              : 0
          }`
        : "No component selected";

  /* =======================================================
     K-MAP LAYOUT
     ======================================================= */

  const kmapLayout =
    getKMapLayout(
      kmapVariables
    );

  const kmapCols =
    kmapLayout.colBits.length;

  function onGateTap(gate: string): void {
  if (!gateTypes.includes(gate as GateType)) {
    return;
  }

  const gateType = gate as GateType;

  const position = screenToFlowPosition({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const newNode: GateNodeType = {
    id: `${gateType.toLowerCase()}-${Date.now()}`,
    type: "gate",
    position,
    data: {
      label: gateNames[gateType],
      gateType,
      value: false,
    },
  };

  remember();

  setNodes((current) => [
    ...current,
    newNode,
  ]);

  setSelectedNode(newNode);

  setStatus(
    `${gateNames[gateType]} added.`
  );
}
  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="logiclab">
      {/* =================================================
          TOP BAR
          ================================================= */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            L
          </div>

          <div>
            <h1>
              LogicLab
            </h1>

            <span>
              Digital Logic Circuit
              Designer
            </span>
          </div>
        </div>

        <div className="toolbar">
          <button
            onClick={undo}
            disabled={
              !history.length
            }
          >
            ↶ Undo
          </button>

          <button
            onClick={redo}
            disabled={
              !future.length
            }
          >
            ↷ Redo
          </button>

          <button
            onClick={
              duplicateSelected
            }
          >
            Duplicate
          </button>

          <button
            onClick={saveCircuit}
          >
            Save
          </button>

          <button
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            Load
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            hidden
            onChange={loadCircuit}
          />

          <button
            onClick={
              validateCircuit
            }
          >
            Validate
          </button>

          <button
            className={
              running
                ? "primary running"
                : "primary"
            }
            onClick={simulate}
          >
            {running
              ? "Running..."
              : "Simulate"}
          </button>

          <button
            onClick={
              pulseClock
            }
            className={
              clockValue
                ? "clock-active"
                : ""
            }
          >
            Pulse Clock
          </button>

          <button
            onClick={() =>
              setClockRunning(
                (current) =>
                  !current
              )
            }
          >
            {clockRunning
              ? "Stop Clock"
              : "Start Clock"}
          </button>

          <select
            value={clockSpeed}
            onChange={(event) =>
              setClockSpeed(
                Number(
                  event.target.value
                )
              )
            }
            title="Clock speed"
          >
            <option value={2000}>
              Slow
            </option>

            <option value={1000}>
              Normal
            </option>

            <option value={500}>
              Fast
            </option>

            <option value={250}>
              Very Fast
            </option>
          </select>
        </div>
      </header>

      {/* =================================================
          WORKSPACE
          ================================================= */}

      <main className="workspace">

        {/* =================================================
            LEFT COMPONENT PANEL
            ================================================= */}

        <aside className="component-panel">
          <div className="panel-heading">
            <h2>
              Components
            </h2>

            <span>
              {gateTypes.length}
            </span>
          </div>

          <input
            className="component-search"
            placeholder="Search component..."
            value={
              componentSearch
            }
            onChange={(event) =>
              setComponentSearch(
                event.target.value
              )
            }
          />

          <div className="component-list">
            {filteredGates.map(
              (gate) => (
                <button
                  key={gate}
                  className="component-item"
                  draggable
                  onDragStart={(
                    event
                  ) =>
                    onDragStart(
                      event,
                      gate
                    )
                  }
                  onClick={() => onGateTap(gate)}
                >
                  <span className="component-symbol">
                    {gate ===
                    "INPUT"
                      ? "I"
                      : gate ===
                          "OUTPUT"
                        ? "O"
                        : gate ===
                            "SR_FLIP_FLOP"
                          ? "SR"
                          : gate ===
                              "JK_FLIP_FLOP"
                            ? "JK"
                            : gate ===
                                "D_FLIP_FLOP"
                              ? "D"
                              : gate ===
                                  "T_FLIP_FLOP"
                                ? "T"
                                : gate ===
                                    "REGISTER"
                                  ? "REG"
                                  : gate ===
                                      "COUNTER"
                                    ? "CTR"
                                    : gate.slice(
                                        0,
                                        3
                                      )}
                  </span>

                  <span>
                    {
                      gateNames[
                        gate
                      ]
                    }
                  </span>
                </button>
              )
            )}
          </div>
        </aside>

        {/* =================================================
            CANVAS
            ================================================= */}

        <section
          className="canvas-area"
          onDragOver={
            onDragOver
          }
          onDrop={onDrop}
        >
          <div className="canvas-toolbar">
            <div className="canvas-title">
              <strong>
                Circuit Canvas
              </strong>

              <span>
                {nodes.length}{" "}
                components ·{" "}
                {edges.length}{" "}
                wires
              </span>
            </div>

            <div className="canvas-actions">
              <button
                onClick={() =>
                  fitView()
                }
              >
                Fit View
              </button>

              <button
                onClick={
                  generateTruthTable
                }
              >
                Truth Table
              </button>

              <button
                onClick={
                  generateBooleanExpression
                }
              >
                Boolean
              </button>

              <button
                onClick={
                  clearCircuit
                }
                className="danger"
              >
                Clear
              </button>

              <button
                onClick={
                  resetCircuit
                }
              >
                Reset
              </button>
            </div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={
              onNodesChange
            }
            onEdgesChange={
              onEdgesChange
            }
            onConnect={onConnect}
            nodeTypes={
              nodeTypes
            }
            onNodeClick={
              onNodeClick
            }
            deleteKeyCode={[
              "Backspace",
              "Delete",
            ]}
            fitView
            minZoom={0.25}
            maxZoom={2.5}
          >
            <Background
              gap={20}
              size={1}
            />

            <Controls />

            <MiniMap />
          </ReactFlow>

          <div className="statusbar">
            <span className="status-dot" />

            {status}
          </div>
        </section>

        {/* =================================================
            RIGHT PANEL
            ================================================= */}

        <aside className="right-panel">

          {/* =================================================
              CLOCK
              ================================================= */}

          <div className="analysis-panel clock-panel">
            <div className="panel-heading">
              <h2>
                Clock
              </h2>
            </div>

            <div className="clock-status">
              <span
                className={
                  clockValue
                    ? "clock-indicator active"
                    : "clock-indicator"
                }
              />

              <strong>
                CLK:{" "}
                {clockValue
                  ? "HIGH"
                  : "LOW"}
              </strong>
            </div>

            <div className="clock-actions">
              <button
                className="full"
                onClick={
                  pulseClock
                }
              >
                Pulse Clock
              </button>

              <button
                className="full"
                onClick={() =>
                  setClockRunning(
                    (current) =>
                      !current
                  )
                }
              >
                {clockRunning
                  ? "Stop Automatic Clock"
                  : "Start Automatic Clock"}
              </button>
            </div>

            <label className="small-label">
              Clock Speed
            </label>

            <select
              value={
                clockSpeed
              }
              onChange={(
                event
              ) =>
                setClockSpeed(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            >
              <option value={2000}>
                Slow — 0.5 Hz
              </option>

              <option value={1000}>
                Normal — 1 Hz
              </option>

              <option value={500}>
                Fast — 2 Hz
              </option>

              <option value={250}>
                Very Fast — 4 Hz
              </option>
            </select>
          </div>

          {/* =================================================
              PROPERTIES
              ================================================= */}

          <div className="properties-panel">
            <div className="panel-heading">
              <h2>
                Properties
              </h2>
            </div>

            {selectedNode ? (
              <div className="info-card">
                <div className="property-type">
                  {
                    gateNames[
                      selectedNode
                        .data
                        .gateType
                    ]
                  }
                </div>

                <label>
                  Label
                </label>

                <input
                  value={
                    selectedNode
                      .data.label
                  }
                  onChange={
                    updateLabel
                  }
                />

                <div className="property-row">
                  <span>
                    ID
                  </span>

                  <strong>
                    {
                      selectedNode.id
                    }
                  </strong>
                </div>

                <div className="property-row">
                  <span>
                    State
                  </span>

                  <strong>
                    {selectedNode
                      .data
                      .value
                      ? "HIGH"
                      : "LOW"}
                  </strong>
                </div>

                {selectedNode
                  .data
                  .counterValue !==
                  undefined && (
                  <div className="property-row">
                    <span>
                      Count
                    </span>

                    <strong>
                      {
                        selectedNode
                          .data
                          .counterValue
                      }
                    </strong>
                  </div>
                )}

                <div className="output-preview">
                  {
                    selectedOutputPreview
                  }
                </div>

                <button
                  className="full danger"
                  onClick={
                    deleteSelected
                  }
                >
                  Delete Component
                </button>
              </div>
            ) : (
              <div className="empty-card">
                Select a component
                to see its
                properties.
              </div>
            )}
          </div>

          {/* =================================================
              K-MAP
              ================================================= */}

          <div className="analysis-panel">
            <div className="panel-heading">
              <h2>
                K-Map
              </h2>
            </div>

            <label className="small-label">
              Variables
            </label>

            <select
              value={
                kmapVariables
              }
              onChange={(
                event
              ) => {
                const value =
                  Number(
                    event.target
                      .value
                  );

                setKmapVariables(
                  value
                );

                /*
                 * Clear old solution because
                 * the map dimensions changed.
                 */
                setKmapResult([]);
                setKmapGroups([]);
                setKmapExpression("");
              }}
            >
              <option value={2}>
                2 Variables
              </option>

              <option value={3}>
                3 Variables
              </option>

              <option value={4}>
                4 Variables
              </option>
            </select>

            <label className="small-label">
              Minterms
            </label>

            <input
              placeholder="Example: 1,3,5,7"
              value={
                kmapMinterms
              }
              onChange={(
                event
              ) =>
                setKmapMinterms(
                  event.target
                    .value
                )
              }
            />

            <button
              className="full"
              onClick={
                generateKMap
              }
            >
              Generate K-Map
            </button>

            {(
              kmapResult.length >
                0 ||
              kmapExpression ===
                "0"
            ) && (
              <div className="kmap-box">

                <div className="kmap-header">
                  K-Map
                </div>

                {/* =========================================
                    VARIABLE AXIS LABEL
                    ========================================= */}

                <div
                  style={{
                    textAlign:
                      "center",
                    fontSize:
                      "11px",
                    fontWeight:
                      700,
                    marginBottom:
                      "4px",
                  }}
                >
                  {kmapLayout.colVariables.join(
                    ""
                  )}
                </div>

                {/* =========================================
                    K-MAP GRID
                    ========================================= */}

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      `48px repeat(${kmapCols}, minmax(42px, 1fr))`,
                    gap: "4px",
                    width:
                      "100%",
                  }}
                >

                  {/* Empty corner */}
                  <div />

                  {/* Column Gray-code labels */}
                  {kmapLayout.colBits.map(
                    (
                      bits
                    ) => (
                      <div
                        key={
                          `col-${bits}`
                        }
                        style={{
                          textAlign:
                            "center",
                          fontSize:
                            "10px",
                          fontWeight:
                            700,
                          padding:
                            "4px 0",
                        }}
                      >
                        {bits}
                      </div>
                    )
                  )}

                  {/* Rows */}
                  {kmapLayout.rowBits.map(
                    (
                      rowBits,
                      rowIndex
                    ) => (
                      <React.Fragment
                        key={
                          `row-${rowBits}`
                        }
                      >
                        {/* Row Gray-code label */}
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            fontSize:
                              "10px",
                            fontWeight:
                              700,
                          }}
                        >
                          {rowBits}
                        </div>

                        {kmapLayout.colBits.map(
                          (
                            colBits,
                            colIndex
                          ) => {
                            const minterm =
                              getMintermFromCell(
                                rowBits,
                                colBits
                              );

                            const active =
                              kmapResult.includes(
                                minterm
                              );

                            const cellGroups =
                              kmapGroups.filter(
                                (
                                  group
                                ) =>
                                  group.minterms.includes(
                                    minterm
                                  )
                              );

                            return (
                              <div
                                key={`${rowIndex}-${colIndex}`}
                                className={
                                  active
                                    ? "kmap-cell active"
                                    : "kmap-cell"
                                }
                                style={{
                                  position:
                                    "relative",
                                  minHeight:
                                    "48px",
                                  display:
                                    "flex",
                                  flexDirection:
                                    "column",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  borderRadius:
                                    "6px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize:
                                      "9px",
                                    opacity:
                                      0.7,
                                  }}
                                >
                                  m{minterm}
                                </span>

                                <strong
                                  style={{
                                    fontSize:
                                      "16px",
                                  }}
                                >
                                  {active
                                    ? "1"
                                    : "0"}
                                </strong>

                                {cellGroups.length >
                                  0 && (
                                  <div
                                    style={{
                                      position:
                                        "absolute",
                                      bottom:
                                        "2px",
                                      display:
                                        "flex",
                                      gap:
                                        "2px",
                                      flexWrap:
                                        "wrap",
                                      justifyContent:
                                        "center",
                                    }}
                                  >
                                    {cellGroups.map(
                                      (
                                        group
                                      ) => (
                                        <span
                                          key={
                                            group.id
                                          }
                                          style={{
                                            fontSize:
                                              "7px",
                                            fontWeight:
                                              800,
                                            padding:
                                              "1px 3px",
                                            borderRadius:
                                              "3px",
                                          }}
                                        >
                                          G{
                                            group.id
                                          }
                                        </span>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </React.Fragment>
                    )
                  )}
                </div>

                {/* =========================================
                    ROW / COLUMN VARIABLES
                    ========================================= */}

                <div
                  style={{
                    marginTop:
                      "7px",
                    fontSize:
                      "10px",
                    opacity:
                      0.75,
                    textAlign:
                      "center",
                  }}
                >
                  Rows:{" "}
                  {kmapLayout.rowVariables.join(
                    ""
                  )}{" "}
                  · Columns:{" "}
                  {kmapLayout.colVariables.join(
                    ""
                  )}
                </div>

                <div className="minterm-result">
                  Σm(
                  {kmapResult.join(
                    ", "
                  )}
                  )
                </div>

                {/* =========================================
                    GROUPS
                    ========================================= */}

                {kmapGroups.length >
                  0 && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "12px",
                        fontWeight:
                          800,
                        marginBottom:
                          "6px",
                      }}
                    >
                      Groups
                    </div>

                    {kmapGroups.map(
                      (
                        group
                      ) => (
                        <div
                          key={
                            group.id
                          }
                          style={{
                            padding:
                              "7px",
                            marginBottom:
                              "5px",
                            borderRadius:
                              "6px",
                            border:
                              "1px solid rgba(127,127,127,0.25)",
                            fontSize:
                              "10px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap:
                                "8px",
                            }}
                          >
                            <strong>
                              G{
                                group.id
                              }
                            </strong>

                            <strong>
                              {group.term}
                            </strong>
                          </div>

                          <div
                            style={{
                              opacity:
                                0.75,
                              marginTop:
                                "3px",
                            }}
                          >
                            m(
                            {group.minterms.join(
                              ", "
                            )}
                            )
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* =========================================
                    SIMPLIFIED EXPRESSION
                    ========================================= */}

                {kmapExpression && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "11px",
                        fontWeight:
                          800,
                        marginBottom:
                          "4px",
                      }}
                    >
                      Simplified Expression
                    </div>

                    <div
                      className="expression-box"
                      style={{
                        wordBreak:
                          "break-word",
                      }}
                    >
                      F ={" "}
                      {
                        kmapExpression
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =================================================
              BOOLEAN EXPRESSION
              ================================================= */}

          <div className="analysis-panel">
            <div className="panel-heading">
              <h2>
                Boolean Expression
              </h2>
            </div>

            <div className="expression-box">
              {booleanExpression ||
                "Generate an expression from the circuit."}
            </div>

            <button
              className="full"
              onClick={
                generateBooleanExpression
              }
            >
              Generate
            </button>
          </div>

          {/* =================================================
              BOOLEAN / K-MAP GENERATORS
              ================================================= */}

          <div className="analysis-panel feature-panel">
            <div className="panel-heading"><h2>Design from Expression</h2></div>
            <textarea className="logic-expression-input" value={expressionInput} onChange={(event) => setExpressionInput(event.target.value)} placeholder="Example: A'B + AC" rows={3} />
            <div className="feature-button-grid">
              <button className="full" onClick={generateCircuitFromExpression}>Expression → Circuit</button>
              <button className="full" onClick={generateAnalysisFromExpression}>Expression → K-Map + Truth Table</button>
            </div>
            {expressionVariables.length > 0 && <div className="tool-note">Variables: {expressionVariables.join(", ")}</div>}
          </div>

          <div className="analysis-panel feature-panel">
            <div className="panel-heading"><h2>K-Map → Circuit</h2></div>
            <button className="full" onClick={generateCircuitFromKMap}>Generate Circuit from Current K-Map</button>
          </div>

          <div className="analysis-panel feature-panel">
            <div className="panel-heading"><h2>Number & Code Converter</h2></div>
            <div className="converter-grid">
              <select value={converterFrom} onChange={(event) => setConverterFrom(event.target.value)}>
                <option value="binary">Binary</option><option value="octal">Octal</option><option value="decimal">Decimal</option><option value="hexadecimal">Hexadecimal</option><option value="gray">Gray Code</option>
              </select>
              <select value={converterTo} onChange={(event) => setConverterTo(event.target.value)}>
                <option value="binary">Binary</option><option value="octal">Octal</option><option value="decimal">Decimal</option><option value="hexadecimal">Hexadecimal</option><option value="gray">Gray Code</option>
              </select>
            </div>
            <input value={converterValue} onChange={(event) => setConverterValue(event.target.value)} placeholder="Enter value" />
            <button className="full" onClick={runConverter}>Convert</button>
            {converterResult && <div className="conversion-result">Result: {converterResult}</div>}
            {converterError && <div className="tool-error">{converterError}</div>}
            <div className="tool-note">Supports Binary, Octal, Decimal, Hexadecimal and Binary ↔ Gray Code.</div>
          </div>

          {/* =================================================
              TRUTH TABLE
              ================================================= */}

          {truthTable && (
            <div className="truth-panel">
              <div className="panel-heading">
                <h2>
                  Truth Table
                </h2>

                <button
                  onClick={
                    exportTruthTable
                  }
                >
                  CSV
                </button>
              </div>

              <div className="truth-scroll">
                <table>
                  <thead>
                    <tr>
                      {[
                        ...truthTable.inputs,
                        ...truthTable.outputs,
                      ].map(
                        (
                          header
                        ) => (
                          <th
                            key={
                              header
                            }
                          >
                            {
                              header
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {truthTable.rows.map(
                      (
                        row,
                        index
                      ) => (
                        <tr
                          key={
                            index
                          }
                        >
                          {[
                            ...truthTable.inputs,
                            ...truthTable.outputs,
                          ].map(
                            (
                              header
                            ) => (
                              <td
                                key={
                                  header
                                }
                              >
                                {row[
                                  header
                                ]
                                  ? 1
                                  : 0}
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

/* =========================================================
   EXPORT
   ========================================================= */

export default function CircuitDesigner() {
  return (
    <ReactFlowProvider>
      <CircuitDesignerContent />
    </ReactFlowProvider>
  );
}