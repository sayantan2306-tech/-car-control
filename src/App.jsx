import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [direction, setDirection] = useState('STOP')
  const [emergency, setEmergency] = useState(false)
  const [horn, setHorn] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [talking, setTalking] = useState(false)
  const [voiceChanger, setVoiceChanger] = useState(true)
  const [cameraDirection, setCameraDirection] = useState('CENTER')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [lights, setLights] = useState({
    headlights: false,
    underbodyBlue: false,
    hazard: false,
    underbodyRGB: false,
    rearRed: false,
    leftIndicator: false,
    rightIndicator: false,
  })

  const [syncLights, setSyncLights] = useState(false)

  const toggleLight = (name) => {
    setLights(old => ({ ...old, [name]: !old[name] }))

    if (name === 'underbodyBlue' || name === 'underbodyRGB') {
      setSyncLights(false)
    }
  }

  const toggleSyncLights = () => {
    setSyncLights(old => {
      const next = !old
      setLights(prev => ({
        ...prev,
        underbodyBlue: next,
        underbodyRGB: next,
      }))
      return next
    })
  }

  useEffect(() => {
    const movementKeys = {
      ArrowUp: true,
      ArrowDown: true,
      ArrowLeft: true,
      ArrowRight: true,
    }

    const lighting = {
      Digit1: 'headlights', Numpad1: 'headlights',
      Digit2: 'underbodyRGB', Numpad2: 'underbodyRGB',
      Digit4: 'underbodyBlue', Numpad4: 'underbodyBlue',
      Digit5: 'rearRed', Numpad5: 'rearRed',
      Digit7: 'hazard', Numpad7: 'hazard',
      Digit8: 'leftIndicator', Numpad8: 'leftIndicator',
      Digit9: 'rightIndicator', Numpad9: 'rightIndicator',
    }

    const camera = {
      KeyI: 'UP',
      KeyK: 'DOWN',
      KeyJ: 'LEFT',
      KeyL: 'RIGHT',
    }

    const pressed = new Set()

    const getMovement = () => {
      const f = pressed.has('ArrowUp')
      const b = pressed.has('ArrowDown')
      const l = pressed.has('ArrowLeft')
      const r = pressed.has('ArrowRight')

      if (f && l) return 'FORWARD_LEFT'
      if (f && r) return 'FORWARD_RIGHT'
      if (b && l) return 'BACKWARD_LEFT'
      if (b && r) return 'BACKWARD_RIGHT'
      if (f) return 'FORWARD'
      if (b) return 'BACKWARD'
      if (l) return 'LEFT'
      if (r) return 'RIGHT'
      return 'STOP'
    }

    const isTyping = (target) =>
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

    const stopAll = () => {
      pressed.clear()
      setDirection('STOP')
      setHorn(false)
      setTalking(false)
    }

    const handleKeyDown = (event) => {
      if (isTyping(event.target)) return

      if (movementKeys[event.code] || event.code === 'Space') {
        event.preventDefault()
      }

      if (event.repeat) return

      if (event.code === 'Digit3' || event.code === 'Numpad3') {
        setSidebarCollapsed(old => !old)
        return
      }

      if (movementKeys[event.code]) {
        pressed.add(event.code)
        if (!emergency) setDirection(getMovement())
        return
      }

      if (event.code === 'KeyX') {
        pressed.clear()
        setDirection('STOP')
        return
      }

      if (event.code === 'Space') {
        setHorn(true)
        return
      }

      if (event.code === 'Digit6' || event.code === 'Numpad6') {
        toggleSyncLights()
        return
      }

      if (lighting[event.code]) {
        toggleLight(lighting[event.code])
        return
      }

      if (camera[event.code]) {
        setCameraDirection(camera[event.code])
        return
      }

      if (event.code === 'KeyO') {
        setCameraDirection('CENTER')
        return
      }

      if (event.code === 'KeyP') {
        const screen = document.querySelector('.camera-screen')
        if (screen && !document.fullscreenElement) {
          screen.requestFullscreen?.()
        } else if (document.fullscreenElement) {
          document.exitFullscreen?.()
        }
        return
      }

      if (event.code === 'KeyQ' && !micMuted) {
        setTalking(true)
        return
      }

      if (event.code === 'KeyM') {
        setMicMuted(old => !old)
        setTalking(false)
        return
      }

      if (event.code === 'KeyV') {
        setVoiceChanger(old => !old)
      }
    }

    const handleKeyUp = (event) => {
      if (movementKeys[event.code]) {
        pressed.delete(event.code)
        if (!emergency) setDirection(getMovement())
      }

      if (event.code === 'Space') setHorn(false)
      if (event.code === 'KeyQ') setTalking(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', stopAll)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', stopAll)
    }
  }, [emergency, micMuted])

  const lightItems = [
    { id: 'headlights', name: 'WHITE', color: '#ffffff' },
    { id: 'underbodyBlue', name: 'BLUE', color: '#268cff' },
    { id: 'hazard', name: 'HAZARD', color: '#f5c542' },
    { id: 'underbodyRGB', name: 'RGB', color: '#a855f7' },
    { id: 'rearRed', name: 'RED', color: '#ef4444' },
  ]

  const leftActive = lights.hazard || lights.leftIndicator
  const rightActive = lights.hazard || lights.rightIndicator

  const move = (value) => {
    if (!emergency) setDirection(value)
  }

  const lightControls = [
    ['headlights', 'Front Headlights', '1'],
    ['underbodyBlue', 'Underbody Blue', '4'],
    ['underbodyRGB', 'Underbody RGB', '2'],
    ['syncLights', 'RGB + Blue Sync', '6'],
    ['rearRed', 'Rear Red Lights', '5'],
    ['hazard', 'Hazard Lights', '7'],
    ['leftIndicator', 'Left Indicator', '8'],
    ['rightIndicator', 'Right Indicator', '9'],
  ]

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h2>CAR CONTROL</h2>
            <span>ROVER CONTROL SYSTEM</span>
          </div>
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(old => !old)}
          title="Collapse / Expand Sidebar (3)"
        >
          {sidebarCollapsed ? '❯' : '❮'}
        </button>

        <div className="nav-label">MAIN MENU</div>
        <nav>
          <button className="nav-item active">▦ <span>Dashboard</span></button>
          <button className="nav-item">▣ <span>Live Camera</span></button>
          <button className="nav-item">⌘ <span>Car Control</span></button>
          <button className="nav-item">⌖ <span>Navigation</span></button>
          <button className="nav-item">⚙ <span>Settings</span></button>
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-dot" />
          <span>System Offline</span>
          <small>Demo Version 2.5</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>CAR CONTROL</h1>
            <p>Rover monitoring and control station</p>
          </div>
          <span className="demo-badge">● DEMO MODE</span>
        </header>

        <section className="compact-status">
          <div className="mini-status">
            <span className="mini-icon">▰</span>
            <div><small>BATTERY</small><strong>--%</strong></div>
          </div>

          <div className="mini-status">
            <span className="mini-icon">◉</span>
            <div><small>SPEED</small><strong>-- km/h</strong></div>
          </div>

          <div className="mini-status">
            <span className="mini-icon">⌁</span>
            <div><small>NETWORK</small><strong className="offline-text">OFFLINE</strong></div>
          </div>

          <div className="mini-status">
            <span className="mini-icon">⌖</span>
            <div><small>GPS</small><strong className="warning-text">NO FIX</strong></div>
          </div>

          <div className="mini-status horn-status">
            <span
              className={`horn-icon ${horn ? 'active' : ''}`}
              aria-label={horn ? 'Horn on' : 'Horn off'}
              title="Hold SPACE for horn"
            >
              🔊
            </span>
          </div>
        </section>

        <section className="lighting-bar">
          <div className="section-title">
            <h3>LIGHTING STATUS</h3>
            <span>LIVE INDICATORS</span>
          </div>

          <div className="lighting-content">
            <div className="light-indicators">
              {lightItems.map(item => (
                <div className="light-indicator" key={item.id}>
                  <span
                    className={`light-dot ${
                      lights[item.id] ? 'light-on' : ''
                    } ${
                      item.id === 'underbodyRGB' && lights.underbodyRGB
                        ? 'rgb-light-on'
                        : ''
                    } ${
                      item.id === 'underbodyBlue' && lights.underbodyBlue
                        ? syncLights ? 'blue-pulse' : 'blue-light-on'
                        : ''
                    }`}
                    style={{ '--light-color': item.color }}
                  />
                  <small>{item.name}</small>
                </div>
              ))}
            </div>

            <div className="inline-turn-signals">
              <div className={`turn-arrow ${leftActive ? 'turn-active' : ''}`} title="Left indicator">
                <span>◀</span>
              </div>
              <div className={`turn-arrow ${rightActive ? 'turn-active' : ''}`} title="Right indicator">
                <span>▶</span>
              </div>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel camera-panel">
            <div className="panel-heading">
              <div>
                <h3>LIVE CAMERA</h3>
                <p>Front camera feed</p>
              </div>
              <span className="offline-label">OFFLINE</span>
            </div>

            <div className="camera-screen">
              <div className="camera-symbol">▣</div>
              <h3>No Video Signal</h3>
              <p>ESP32-CAM is not connected</p>
              <small>Camera: {cameraDirection}</small>
            </div>

            <p className="keyboard-hint">
              I / J / K / L = Camera · O = Center · P = Fullscreen
            </p>
          </div>

          <div className="panel control-panel">
            <div className="panel-heading">
              <div>
                <h3>CAR MOVEMENT</h3>
                <p>Keyboard and button control</p>
              </div>
              <span className="demo-label">DEMO</span>
            </div>

            <div className="direction-pad">
              <button onClick={() => move('FORWARD')}>▲</button>
              <div className="middle-controls">
                <button onClick={() => move('LEFT')}>◀</button>
                <button className="stop-button" onClick={() => move('STOP')}>■</button>
                <button onClick={() => move('RIGHT')}>▶</button>
              </div>
              <button onClick={() => move('BACKWARD')}>▼</button>
            </div>

            <div className="movement-status">
              Direction: <strong>{emergency ? 'EMERGENCY STOP' : direction}</strong>
            </div>

            <button
              className={`emergency-button ${emergency ? 'emergency-active' : ''}`}
              onClick={() => {
                setEmergency(old => !old)
                setDirection('STOP')
                setHorn(false)
                setTalking(false)
              }}
            >
              {emergency ? 'RESET EMERGENCY STOP' : 'EMERGENCY STOP'}
            </button>

            <p className="keyboard-hint">
              Arrow Keys = Move · Diagonal = Corner · X = Stop
            </p>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel accessory-panel">
            <div className="panel-heading">
              <div>
                <h3>LIGHTING CONTROL</h3>
                <p>Individual light switches</p>
              </div>
            </div>

            {lightControls.map(([id, name, key]) => {
              const active = id === 'syncLights' ? syncLights : lights[id]

              return (
                <div className="accessory-row" key={id}>
                  <div>
                    <strong>{name}</strong>
                    <small>Key: {key} / Numpad {key}</small>
                  </div>
                  <button
                    className={active ? 'toggle on' : 'toggle'}
                    onClick={() =>
                      id === 'syncLights'
                        ? toggleSyncLights()
                        : toggleLight(id)
                    }
                  >
                    {active ? 'ON' : 'OFF'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="panel audio-panel">
            <div className="panel-heading">
              <div>
                <h3>AUDIO CONTROL</h3>
                <p>Microphone and voice changer</p>
              </div>
            </div>

            <div className="accessory-row">
              <strong>Rover Microphone</strong>
              <button
                className={micMuted ? 'toggle danger' : 'toggle on'}
                onClick={() => {
                  setMicMuted(old => !old)
                  setTalking(false)
                }}
              >
                {micMuted ? 'MUTED' : 'LISTENING'}
              </button>
            </div>

            <div className="accessory-row">
              <strong>Voice Changer</strong>
              <button
                className={voiceChanger ? 'toggle on' : 'toggle'}
                onClick={() => setVoiceChanger(old => !old)}
              >
                {voiceChanger ? 'ON' : 'OFF'}
              </button>
            </div>

            <button
              className="talk-button"
              disabled={micMuted}
              onPointerDown={() => setTalking(true)}
              onPointerUp={() => setTalking(false)}
              onPointerLeave={() => setTalking(false)}
              onPointerCancel={() => setTalking(false)}
            >
              {talking ? 'TRANSMITTING VOICE...' : 'HOLD TO TALK (Q)'}
            </button>

            <p className="keyboard-hint">
              Q = Hold to Talk · M = Mic Mute · V = Voice Changer
            </p>
          </div>
        </section>

        <section className="panel hardware-panel">
          <div className="panel-heading">
            <div>
              <h3>HARDWARE STATUS</h3>
              <p>Device connection overview</p>
            </div>
          </div>

          {['ESP32 Controller', 'ESP32-CAM', '4G Module', 'GPS Module'].map(item => (
            <div className="hardware-row" key={item}>
              <span>{item}</span>
              <span className="disconnected">● Offline</span>
            </div>
          ))}
        </section>

        <footer>
          CAR CONTROL SYSTEM <span>•</span> Dashboard v2.5 <span>•</span> Demo Mode
        </footer>
      </main>
    </div>
  )
}

export default App