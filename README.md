# FPGA Web - Mock FPGA Design Tool

A browser-based "mini FPGA tool" that lets users create FPGA projects, generate RTL from natural language, run lightweight simulations, and get AI-powered explanations and debugging help.

**Status**: MVP 1.1  
**License**: MIT  
**Demo**: local development server, usually `http://127.0.0.1:4173/`

## 🎯 Features

### Core Functionality
- ✅ **Create FPGA Projects**: Browser-based project management
- ✅ **Natural Language RTL**: Describe hardware modules in plain English
- ✅ **Editable RTL Editor**: Review and edit generated RTL, then save in place or save as a copy
- ✅ **Auto-Generate Testbenches**: Automatic testbench creation
- ✅ **Lightweight Simulation**: Mock WASM simulator with real-time progress
- ✅ **Browser Notifications**: Get alerted when simulations complete
- ✅ **AI Assistant**: Explain, debug, and document your RTL

### Data & Storage
- ✅ **sql.js Integration**: In-browser SQLite (WASM) for structured storage
- ✅ **localStorage Fallback**: Automatic fallback for compatibility
- ✅ **Export Projects**: Download as ZIP with all artifacts
- ✅ **Offline-Capable**: Works entirely in the browser

### AI Features
- 🤖 **RTL Explanation**: Understand what your code does
- 🐛 **Debug Suggestions**: Get help when simulations fail
- 📚 **Auto-Documentation**: Generate Markdown docs for modules
- 🔄 **Live + Mock Modes**: Uses OpenAI Responses API when a key is saved; works without a key for demos

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Edge, Safari)
- OpenAI API key (optional, for real AI - mock mode works without)

### Installation

```bash
# Clone the repository
git clone https://github.com/siliconx-ai5/fpga_web.git
cd fpga_web

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Open the URL printed by Vite, usually `http://127.0.0.1:4173/`.

### First Steps

1. **Describe a module** in the first-screen generator
2. **Review/edit RTL** in the RTL tab and save changes
3. **Run simulation** to test your design and inspect waveform/run history
4. **Ask AI Copilot** for explanations, debug suggestions, or docs
5. **Export** your work as a ZIP file

See [Quick Start Guide](specs/001-mock-fpga-tool/quickstart.md) for detailed instructions.

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── components/      # UI components (Editor, RunHistory, etc.)
│   ├── pages/           # Main views (ProjectList, ProjectView)
│   ├── models/          # Data models (projectModel)
│   ├── lib/
│   │   ├── storage.js       # localStorage wrapper with error handling
│   │   ├── sqlite.js        # sql.js WASM integration
│   │   ├── openaiClient.js  # OpenAI/mock RTL generation
│   │   ├── exportZip.js     # Project export utility
│   │   ├── notify.js        # Browser notification wrapper
│   │   └── simulator/       # WASM/mock simulator
│   └── main.js          # App entry point
├── tests/               # Browser-based tests
└── public/              # Static assets
```

## 🔐 Security Notes

### ⚠️ API Key Storage

**IMPORTANT**: This tool stores OpenAI API keys in browser `localStorage` **for development convenience only**.

**Risks**:
- Keys stored in **plain text** (not encrypted)
- Accessible to any JavaScript running on the same origin
- Persists until manually cleared
- **NOT suitable for production or shared computers**

**Best Practices**:
1. ✅ Use only on **personal, secure devices**
2. ✅ **Clear your API key** after each session (click "Clear" button)
3. ✅ Never use **production API keys** in this tool
4. ✅ Use **test/development API keys** with usage limits
5. ❌ **Never** use on public/shared computers

**How to Clear Your API Key**:
- Click the "Clear" button in the API Key Manager (left sidebar)
- Or clear browser localStorage: `localStorage.clear()`
- Or use incognito/private browsing mode

### Data Privacy

- All data stored **locally** in your browser
- **No server** communication (except OpenAI API if configured)
- Data **not synced** across devices
- Clearing browser data = **losing your projects** (export first!)

## 🧪 Testing

### Browser Tests

```bash
# Start dev server first
npm run dev

# Open in browser
http://localhost:5173/tests/index.html
```

Tests cover:
- Storage layer (localStorage and sql.js)
- Project CRUD operations
- Artifact management

### Manual Testing

See [Quick Start Guide](specs/001-mock-fpga-tool/quickstart.md) for validation scenarios.

## 📚 Documentation

- **[Specification](specs/001-mock-fpga-tool/spec.md)**: Feature requirements and user stories
- **[Tasks](specs/001-mock-fpga-tool/tasks.md)**: Implementation breakdown
- **[Quick Start](specs/001-mock-fpga-tool/quickstart.md)**: User guide and validation scenarios

## 🛠️ Development

### Project Structure

This is a **frontend-only** application built with:
- **Vite**: Build tool and dev server
- **Tailwind CSS 3**: Utility-first styling
- **Vanilla JavaScript**: No framework dependencies
- **sql.js**: In-browser SQLite (WASM)
- **JSZip**: Client-side ZIP generation

### Development Commands

```bash
# Install dependencies
npm install

# Start dev server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### OpenAI Integration

The app calls the OpenAI Responses API directly from the browser when an API key is saved in AI Settings. Without a key, it falls back to deterministic demo generation so the full workflow remains testable.

### Adding Real WASM Simulator

Currently uses a **JavaScript mock**. To add a real WASM simulator:

1. Compile your Verilog simulator to WASM
2. Place `sim.wasm` in `frontend/public/simulator/`
3. Update `frontend/src/lib/simulator/index.js` to call the WASM module

## 🐛 Known Limitations

- **Mock Simulator**: Uses JavaScript mock, not real signal-level simulation
- **Client-Side Only**: No server, no multi-device sync
- **Storage Limits**: Browser localStorage has ~5-10MB quota
- **API Key Security**: Stored in plain text (development only)
- **Client-side OpenAI calls**: API key is stored in plain browser localStorage for prototype convenience

## 🗺️ Roadmap

### Phase 1 (✅ Complete - MVP)
- [x] Project creation and management
- [x] Natural language RTL generation
- [x] Editable RTL editor
- [x] Testbench generation
- [x] Mock simulator with notifications
- [x] AI explanation and debug suggestions
- [x] Documentation generation
- [x] Export to ZIP

### Phase 2 (Future)
- [ ] Real WASM Verilog simulator integration
- [ ] Syntax highlighting for Verilog
- [ ] Waveform viewer (VCD parsing)
- [ ] Real-time collaboration
- [ ] Cloud storage option
- [ ] Advanced AI: code optimization, bug detection

### Phase 3 (Future)
- [ ] Support for SystemVerilog/VHDL
- [ ] Synthesis result estimation
- [ ] FPGA resource utilization preview
- [ ] Integration with real FPGA tools (Vivado, Quartus)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by professional FPGA tools: Vivado, Quartus
- Built with modern web technologies
- sql.js by kripken (WASM SQLite)
- JSZip for client-side ZIP generation

---

**Questions?** Open an issue or see the [Quick Start Guide](specs/001-mock-fpga-tool/quickstart.md).

**Version**: MVP 1.0  
**Last Updated**: 2026-06-12
