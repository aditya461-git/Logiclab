import CircuitDesigner from "./components/CircuitDesigner";
import { useState } from "react";
import "./App.css";

type Feature = {
  title: string;
  description: string;
  icon: string;
};

const features: Feature[] = [
  {
    title: "Circuit Designer",
    description:
      "Build digital circuits visually using logic gates and connections.",
    icon: "⚡",
  },
  {
    title: "Truth Table Generator",
    description:
      "Generate complete truth tables automatically from your logic.",
    icon: "▦",
  },
  {
    title: "Boolean Analyzer",
    description:
      "Understand Boolean expressions and analyze their logic.",
    icon: "∑",
  },
  {
    title: "K-Map Solver",
    description:
      "Simplify Boolean expressions using Karnaugh maps.",
    icon: "◇",
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [showDesigner, setShowDesigner] = useState(false);

const startDesigning = () => {
  setShowDesigner(true);
};

 if (showDesigner) {
  return <CircuitDesigner />;
}

return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-mark">L</div>
            <span>Logic<span className="logo-accent">Lab</span></span>
          </div>

          <nav className={menuOpen ? "nav-links mobile-open" : "nav-links"}>
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
          </nav>

          <button className="nav-button" onClick={startDesigning}>
            Start Designing
          </button>

          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="hero">
          <div className="hero-grid"></div>

          <div className="hero-content">
            <div className="badge">
              <span className="badge-dot"></span>
              Interactive Digital Logic Platform
            </div>

            <h1>
              Design circuits.
              <br />
              <span>Simulate logic.</span>
              <br />
              Understand everything.
            </h1>

            <p>
              LogicLab is an interactive platform for designing digital
              circuits, simulating logic gates, generating truth tables,
              and learning digital electronics visually.
            </p>

            <div className="hero-buttons">
              <button className="primary-button" onClick={startDesigning}>
                Start Designing
                <span>→</span>
              </button>

              <a href="#features" className="secondary-button">
                Explore Features
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>8+</strong>
                <span>Logic Gates</span>
              </div>

              <div className="stat-divider"></div>

              <div>
                <strong>8</strong>
                <span>Input Variables</span>
              </div>

              <div className="stat-divider"></div>

              <div>
                <strong>∞</strong>
                <span>Possibilities</span>
              </div>
            </div>
          </div>

          {/* Circuit preview */}
          <div className="circuit-preview">
            <div className="preview-window">
              <div className="window-top">
                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="window-title">LogicLab Simulator</div>

                <div className="live-status">
                  <span></span>
                  LIVE
                </div>
              </div>

              <div className="circuit-area">
                <div className="input-label input-a">
                  <span className="signal-dot active"></span>
                  INPUT A
                </div>

                <div className="input-label input-b">
                  <span className="signal-dot"></span>
                  INPUT B
                </div>

                <div className="wire wire-a"></div>
                <div className="wire wire-b"></div>

                <div className="gate gate-and">
                  <div className="gate-symbol">&amp;</div>
                  <span>AND</span>
                </div>

                <div className="wire wire-output"></div>

                <div className="output-label">
                  <span className="signal-dot active"></span>
                  OUTPUT
                </div>

                <div className="truth-mini">
                  <div className="truth-title">TRUTH TABLE</div>
                  <div className="truth-row header">
                    <span>A</span>
                    <span>B</span>
                    <span>Y</span>
                  </div>
                  <div className="truth-row">
                    <span>0</span>
                    <span>0</span>
                    <span>0</span>
                  </div>
                  <div className="truth-row">
                    <span>0</span>
                    <span>1</span>
                    <span>0</span>
                  </div>
                  <div className="truth-row">
                    <span>1</span>
                    <span>1</span>
                    <span className="result-one">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section" id="features">
          <div className="section-heading">
            <div className="section-label">CORE FEATURES</div>
            <h2>Everything you need to master digital logic.</h2>
            <p>
              From your first AND gate to complex digital systems, LogicLab
              brings design, simulation and analysis together.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

                <button onClick={startDesigning}>
                  Explore <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="workflow-section" id="how-it-works">
          <div className="section-heading">
            <div className="section-label">HOW IT WORKS</div>
            <h2>From idea to working circuit.</h2>
          </div>

          <div className="workflow">
            <div className="workflow-step">
              <div className="step-number">01</div>
              <h3>Design</h3>
              <p>
                Place logic gates on the canvas and connect them together.
              </p>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <div className="step-number">02</div>
              <h3>Simulate</h3>
              <p>
                Change inputs and watch signals propagate through your circuit.
              </p>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-step">
              <div className="step-number">03</div>
              <h3>Understand</h3>
              <p>
                Generate truth tables and analyze the Boolean logic behind it.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section" id="about">
          <div className="cta-glow"></div>

          <div className="cta-content">
            <div className="section-label">BUILT FOR LEARNING</div>

            <h2>
              Stop memorizing logic.
              <br />
              <span>Start building it.</span>
            </h2>

            <p>
              Learn digital electronics by actually designing and
              experimenting with circuits.
            </p>

            <button className="primary-button" onClick={startDesigning}>
              Start with LogicLab <span>→</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="logo">
            <div className="logo-mark">L</div>
            <span>Logic<span className="logo-accent">Lab</span></span>
          </div>

          <p>Design. Simulate. Understand.</p>

          <span className="copyright">
            © 2026 LogicLab
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;