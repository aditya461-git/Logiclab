import * as React from "react";

import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";

export type GateType =
  | "INPUT"
  | "AND"
  | "OR"
  | "NOT"
  | "NAND"
  | "NOR"
  | "XOR"
  | "XNOR"
  | "MUX"
  | "DEMUX"
  | "DECODER"
  | "ENCODER"
  | "SR_FLIP_FLOP"
  | "JK_FLIP_FLOP"
  | "D_FLIP_FLOP"
  | "T_FLIP_FLOP"
  | "REGISTER"
  | "COUNTER"
  | "OUTPUT";

export type GateNodeData = {
  label: string;
  gateType: GateType;
  value?: boolean;
  outputValues?: Record<
    string,
    boolean
  >;
  state?: boolean;

  registerState?: {
    q0: boolean;
    q1: boolean;
    q2: boolean;
    q3: boolean;
  };

  counterValue?: number;
};

export type GateNodeType =
  Node<
    GateNodeData,
    "gate"
  >;

type Props =
  NodeProps<GateNodeType>;

function GateSymbol({
  gateType,
}: {
  gateType: GateType;
}) {
  const stroke =
    "currentColor";

  switch (gateType) {
    case "AND":
      return (
        <svg
          viewBox="0 0 100 70"
          className="gate-svg"
        >
          <path
            d="M10 10 H48 A25 25 0 0 1 48 60 H10 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );

    case "OR":
      return (
        <svg
          viewBox="0 0 100 70"
          className="gate-svg"
        >
          <path
            d="M10 10 Q35 35 10 60 Q55 60 88 35 Q55 10 10 10"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );

    case "XOR":
      return (
        <svg
          viewBox="0 0 100 70"
          className="gate-svg"
        >
          <path
            d="M10 10 Q35 35 10 60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <path
            d="M17 10 Q42 35 17 60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <path
            d="M17 10 Q45 10 88 35 Q45 60 17 60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );

    case "NOT":
      return (
        <svg
          viewBox="0 0 100 70"
          className="gate-svg"
        >
          <path
            d="M15 10 L75 35 L15 60 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <circle
            cx="82"
            cy="35"
            r="6"
            fill="white"
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );

    case "NAND":
      return (
        <svg
          viewBox="0 0 100 70"
          className="gate-svg"
        >
          <path
            d="M10 10 H48 A25 25 0 0 1 48 60 H10 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <circle
            cx="82"
            cy="35"
            r="6"
            fill="white"
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );

    case "NOR":
      return (
        <svg
          viewBox="0 0 100 70"
          className="gate-svg"
        >
          <path
            d="M10 10 Q35 35 10 60 Q55 60 88 35 Q55 10 10 10"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <circle
            cx="91"
            cy="35"
            r="6"
            fill="white"
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );

    case "XNOR":
      return (
        <svg
          viewBox="0 0 100 70"
          className="gate-svg"
        >
          <path
            d="M10 10 Q35 35 10 60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <path
            d="M17 10 Q42 35 17 60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <path
            d="M17 10 Q45 10 88 35 Q45 60 17 60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <circle
            cx="92"
            cy="35"
            r="6"
            fill="white"
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );

    case "MUX":
      return (
        <svg
          viewBox="0 0 100 90"
          className="gate-svg"
        >
          <path
            d="M25 10 L80 20 L80 70 L25 80 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="48"
            y="42"
            textAnchor="middle"
            fontSize="15"
          >
            MUX
          </text>

          <text
            x="52"
            y="61"
            textAnchor="middle"
            fontSize="10"
          >
            2:1
          </text>
        </svg>
      );

    case "DEMUX":
      return (
        <svg
          viewBox="0 0 100 90"
          className="gate-svg"
        >
          <path
            d="M20 20 L75 10 L75 80 L20 70 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="47"
            y="48"
            textAnchor="middle"
            fontSize="13"
          >
            DEMUX
          </text>
        </svg>
      );

    case "DECODER":
      return (
        <svg
          viewBox="0 0 100 80"
          className="gate-svg"
        >
          <rect
            x="20"
            y="10"
            width="60"
            height="60"
            rx="4"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="50"
            y="36"
            textAnchor="middle"
            fontSize="12"
          >
            DEC
          </text>

          <text
            x="50"
            y="52"
            textAnchor="middle"
            fontSize="9"
          >
            2 × 4
          </text>
        </svg>
      );

    case "ENCODER":
      return (
        <svg
          viewBox="0 0 100 80"
          className="gate-svg"
        >
          <path
            d="M20 10 L80 20 L80 60 L20 70 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="50"
            y="38"
            textAnchor="middle"
            fontSize="11"
          >
            ENC
          </text>

          <text
            x="50"
            y="52"
            textAnchor="middle"
            fontSize="9"
          >
            4 × 2
          </text>
        </svg>
      );

    case "SR_FLIP_FLOP":
      return (
        <svg
          viewBox="0 0 100 80"
          className="gate-svg"
        >
          <rect
            x="20"
            y="10"
            width="60"
            height="60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="50"
            y="36"
            textAnchor="middle"
            fontSize="12"
          >
            SR
          </text>

          <text
            x="50"
            y="52"
            textAnchor="middle"
            fontSize="9"
          >
            F/F
          </text>
        </svg>
      );

    case "JK_FLIP_FLOP":
      return (
        <svg
          viewBox="0 0 100 80"
          className="gate-svg"
        >
          <rect
            x="20"
            y="10"
            width="60"
            height="60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="50"
            y="36"
            textAnchor="middle"
            fontSize="12"
          >
            JK
          </text>

          <text
            x="50"
            y="52"
            textAnchor="middle"
            fontSize="9"
          >
            F/F
          </text>
        </svg>
      );

    case "D_FLIP_FLOP":
      return (
        <svg
          viewBox="0 0 100 80"
          className="gate-svg"
        >
          <rect
            x="20"
            y="10"
            width="60"
            height="60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="50"
            y="45"
            textAnchor="middle"
            fontSize="18"
          >
            D
          </text>

          <path
            d="M20 57 L28 62 L20 67"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );

    case "T_FLIP_FLOP":
      return (
        <svg
          viewBox="0 0 100 80"
          className="gate-svg"
        >
          <rect
            x="20"
            y="10"
            width="60"
            height="60"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="50"
            y="45"
            textAnchor="middle"
            fontSize="18"
          >
            T
          </text>

          <path
            d="M20 57 L28 62 L20 67"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );

    case "REGISTER":
      return (
        <svg
          viewBox="0 0 100 80"
          className="gate-svg"
        >
          <rect
            x="20"
            y="8"
            width="60"
            height="64"
            rx="4"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="50"
            y="38"
            textAnchor="middle"
            fontSize="13"
          >
            REG
          </text>

          <text
            x="50"
            y="54"
            textAnchor="middle"
            fontSize="9"
          >
            4-BIT
          </text>
        </svg>
      );

    case "COUNTER":
      return (
        <svg
          viewBox="0 0 100 80"
          className="gate-svg"
        >
          <rect
            x="20"
            y="8"
            width="60"
            height="64"
            rx="4"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
          />

          <text
            x="50"
            y="37"
            textAnchor="middle"
            fontSize="12"
          >
            CTR
          </text>

          <text
            x="50"
            y="53"
            textAnchor="middle"
            fontSize="9"
          >
            4-BIT
          </text>
        </svg>
      );

    default:
      return null;
  }
}

function Label({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`handle-label ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export default function GateNode({
  data,
  selected,
}: Props) {
  const isInput =
    data.gateType ===
    "INPUT";

  const isOutput =
    data.gateType ===
    "OUTPUT";

  const multiOutput =
    data.gateType ===
      "DEMUX" ||
    data.gateType ===
      "DECODER" ||
    data.gateType ===
      "ENCODER" ||
    data.gateType ===
      "SR_FLIP_FLOP" ||
    data.gateType ===
      "JK_FLIP_FLOP" ||
    data.gateType ===
      "D_FLIP_FLOP" ||
    data.gateType ===
      "T_FLIP_FLOP" ||
    data.gateType ===
      "REGISTER" ||
    data.gateType ===
      "COUNTER";

  if (isInput) {
    return (
      <div
        className={`io-node ${
          selected
            ? "gate-selected"
            : ""
        } ${
          data.value
            ? "logic-high"
            : "logic-low"
        }`}
      >
        <div className="io-value">
          {data.value
            ? "1"
            : "0"}
        </div>

        <div className="io-label">
          {data.label}
        </div>

        <Handle
          type="source"
          position={
            Position.Right
          }
          className="logic-handle"
        />
      </div>
    );
  }

  if (isOutput) {
    return (
      <div
        className={`io-node output-node ${
          selected
            ? "gate-selected"
            : ""
        } ${
          data.value
            ? "logic-high"
            : "logic-low"
        }`}
      >
        <Handle
          type="target"
          position={
            Position.Left
          }
          className="logic-handle"
        />

        <div className="io-value">
          {data.value
            ? "1"
            : "0"}
        </div>

        <div className="io-label">
          {data.label}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`gate-node ${
        selected
          ? "gate-selected"
          : ""
      } ${
        data.value
          ? "logic-high"
          : "logic-low"
      }`}
    >
      {[
        "AND",
        "OR",
        "NAND",
        "NOR",
        "XOR",
        "XNOR",
      ].includes(
        data.gateType
      ) && (
        <>
          <Handle
            type="target"
            position={
              Position.Left
            }
            id="input-1"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="target"
            position={
              Position.Left
            }
            id="input-2"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              top: "35%",
            }}
          >
            A
          </Label>

          <Label
            style={{
              top: "65%",
            }}
          >
            B
          </Label>
        </>
      )}

      {data.gateType ===
        "NOT" && (
        <>
          <Handle
            type="target"
            position={
              Position.Left
            }
            id="input-1"
            className="logic-handle"
          />

          <Label
            style={{
              top: "50%",
            }}
          >
            A
          </Label>
        </>
      )}

      {data.gateType ===
        "MUX" && (
        <>
          <Handle
            type="target"
            position={
              Position.Left
            }
            id="input-1"
            style={{
              top: "30%",
            }}
            className="logic-handle"
          />

          <Handle
            type="target"
            position={
              Position.Left
            }
            id="input-2"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Handle
            type="target"
            position={
              Position.Bottom
            }
            id="select"
            className="logic-handle"
          />

          <Label
            style={{
              top: "30%",
            }}
          >
            D0
          </Label>

          <Label
            style={{
              top: "65%",
            }}
          >
            D1
          </Label>

          <Label
            style={{
              bottom: "-22px",
              left: "50%",
              transform:
                "translateX(-50%)",
            }}
          >
            S
          </Label>
        </>
      )}

      {data.gateType ===
        "DEMUX" && (
        <>
          <Handle
            type="target"
            position={
              Position.Left
            }
            id="input"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="target"
            position={
              Position.Left
            }
            id="select"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              top: "35%",
            }}
          >
            D
          </Label>

          <Label
            style={{
              top: "65%",
            }}
          >
            S
          </Label>

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="output-0"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="output-1"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              left: "auto",
              right: "-25px",
              top: "35%",
            }}
          >
            Y0
          </Label>

          <Label
            style={{
              left: "auto",
              right: "-25px",
              top: "65%",
            }}
          >
            Y1
          </Label>
        </>
      )}

      {data.gateType ===
        "DECODER" && (
        <>
          <Handle
            type="target"
            position={
              Position.Left
            }
            id="input-a"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="target"
            position={
              Position.Left
            }
            id="input-b"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              top: "35%",
            }}
          >
            A
          </Label>

          <Label
            style={{
              top: "65%",
            }}
          >
            B
          </Label>

          {[0, 1, 2, 3].map(
            (i) => (
              <React.Fragment
                key={i}
              >
                <Handle
                  type="source"
                  position={
                    Position.Right
                  }
                  id={`output-${i}`}
                  style={{
                    top: `${
                      20 +
                      i * 20
                    }%`,
                  }}
                  className="logic-handle"
                />

                <Label
                  style={{
                    left: "auto",
                    right: "-28px",
                    top: `${
                      20 +
                      i * 20
                    }%`,
                  }}
                >
                  Y{i}
                </Label>
              </React.Fragment>
            )
          )}
        </>
      )}

      {data.gateType ===
        "ENCODER" && (
        <>
          {[0, 1, 2, 3].map(
            (i) => (
              <React.Fragment
                key={i}
              >
                <Handle
                  type="target"
                  position={
                    Position.Left
                  }
                  id={`input-${i}`}
                  style={{
                    top: `${
                      20 +
                      i * 20
                    }%`,
                  }}
                  className="logic-handle"
                />

                <Label
                  style={{
                    top: `${
                      20 +
                      i * 20
                    }%`,
                  }}
                >
                  Y{i}
                </Label>
              </React.Fragment>
            )
          )}

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="output-a"
            style={{
              top: "40%",
            }}
            className="logic-handle"
          />

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="output-b"
            style={{
              top: "60%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "40%",
            }}
          >
            A
          </Label>

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "60%",
            }}
          >
            B
          </Label>
        </>
      )}

      {data.gateType ===
        "SR_FLIP_FLOP" && (
        <>
          <Handle
            type="target"
            position={
              Position.Left
            }
            id="set"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="target"
            position={
              Position.Left
            }
            id="reset"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              top: "35%",
            }}
          >
            S
          </Label>

          <Label
            style={{
              top: "65%",
            }}
          >
            R
          </Label>

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="q"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="q-bar"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "35%",
            }}
          >
            Q
          </Label>

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "65%",
            }}
          >
            Q̅
          </Label>
        </>
      )}

      {data.gateType ===
        "JK_FLIP_FLOP" && (
        <>
          <Handle
            type="target"
            position={
              Position.Left
            }
            id="j"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="target"
            position={
              Position.Left
            }
            id="k"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              top: "35%",
            }}
          >
            J
          </Label>

          <Label
            style={{
              top: "65%",
            }}
          >
            K
          </Label>

          <Handle
            type="target"
            position={
              Position.Bottom
            }
            id="clock"
            className="logic-handle"
          />

          <Label
            style={{
              bottom: "-22px",
              left: "50%",
              transform:
                "translateX(-50%)",
            }}
          >
            CLK
          </Label>

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="q"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="q-bar"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "35%",
            }}
          >
            Q
          </Label>

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "65%",
            }}
          >
            Q̅
          </Label>
        </>
      )}

      {data.gateType ===
        "D_FLIP_FLOP" && (
        <>
          <Handle
            type="target"
            position={
              Position.Left
            }
            id="d"
            className="logic-handle"
          />

          <Label
            style={{
              top: "50%",
            }}
          >
            D
          </Label>

          <Handle
            type="target"
            position={
              Position.Bottom
            }
            id="clock"
            className="logic-handle"
          />

          <Label
            style={{
              bottom: "-22px",
              left: "50%",
              transform:
                "translateX(-50%)",
            }}
          >
            CLK
          </Label>

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="q"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="q-bar"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "35%",
            }}
          >
            Q
          </Label>

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "65%",
            }}
          >
            Q̅
          </Label>
        </>
      )}

      {data.gateType ===
        "T_FLIP_FLOP" && (
        <>
          <Handle
            type="target"
            position={
              Position.Left
            }
            id="t"
            className="logic-handle"
          />

          <Label
            style={{
              top: "50%",
            }}
          >
            T
          </Label>

          <Handle
            type="target"
            position={
              Position.Bottom
            }
            id="clock"
            className="logic-handle"
          />

          <Label
            style={{
              bottom: "-22px",
              left: "50%",
              transform:
                "translateX(-50%)",
            }}
          >
            CLK
          </Label>

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="q"
            style={{
              top: "35%",
            }}
            className="logic-handle"
          />

          <Handle
            type="source"
            position={
              Position.Right
            }
            id="q-bar"
            style={{
              top: "65%",
            }}
            className="logic-handle"
          />

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "35%",
            }}
          >
            Q
          </Label>

          <Label
            style={{
              left: "auto",
              right: "-28px",
              top: "65%",
            }}
          >
            Q̅
          </Label>
        </>
      )}

      {data.gateType ===
        "REGISTER" && (
        <>
          {[
            "d0",
            "d1",
            "d2",
            "d3",
          ].map(
            (id, index) => (
              <React.Fragment
                key={id}
              >
                <Handle
                  type="target"
                  position={
                    Position.Left
                  }
                  id={id}
                  style={{
                    top: `${
                      20 +
                      index * 18
                    }%`,
                  }}
                  className="logic-handle"
                />

                <Label
                  style={{
                    top: `${
                      20 +
                      index * 18
                    }%`,
                  }}
                >
                  D{index}
                </Label>
              </React.Fragment>
            )
          )}

          <Handle
            type="target"
            position={
              Position.Bottom
            }
            id="clock"
            className="logic-handle"
          />

          <Label
            style={{
              bottom: "-22px",
              left: "50%",
              transform:
                "translateX(-50%)",
            }}
          >
            CLK
          </Label>

          {[0, 1, 2, 3].map(
            (index) => (
              <React.Fragment
                key={index}
              >
                <Handle
                  type="source"
                  position={
                    Position.Right
                  }
                  id={`q${index}`}
                  style={{
                    top: `${
                      20 +
                      index * 18
                    }%`,
                  }}
                  className="logic-handle"
                />

                <Label
                  style={{
                    left: "auto",
                    right: "-28px",
                    top: `${
                      20 +
                      index * 18
                    }%`,
                  }}
                >
                  Q{index}
                </Label>
              </React.Fragment>
            )
          )}
        </>
      )}

      {data.gateType ===
        "COUNTER" && (
        <>
          <Handle
            type="target"
            position={
              Position.Bottom
            }
            id="clock"
            className="logic-handle"
          />

          <Label
            style={{
              bottom: "-22px",
              left: "50%",
              transform:
                "translateX(-50%)",
            }}
          >
            CLK
          </Label>

          {[0, 1, 2, 3].map(
            (index) => (
              <React.Fragment
                key={index}
              >
                <Handle
                  type="source"
                  position={
                    Position.Right
                  }
                  id={`q${index}`}
                  style={{
                    top: `${
                      20 +
                      index * 18
                    }%`,
                  }}
                  className="logic-handle"
                />

                <Label
                  style={{
                    left: "auto",
                    right: "-28px",
                    top: `${
                      20 +
                      index * 18
                    }%`,
                  }}
                >
                  Q{index}
                </Label>
              </React.Fragment>
            )
          )}
        </>
      )}

      {!multiOutput && (
        <Handle
          type="source"
          position={
            Position.Right
          }
          className="logic-handle"
        />
      )}

      <GateSymbol
        gateType={
          data.gateType
        }
      />

      <div className="gate-title">
        {data.label}
      </div>

      <div className="gate-state">
        {data.value
          ? "HIGH"
          : "LOW"}
      </div>
    </div>
  );
}