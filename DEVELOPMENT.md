# Development Guide

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chatbot_2.0.git
cd chatbot_2.0
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp config/.env.example config/.env
# Edit config/.env with your OpenAI API key
```

### Running Locally

Start the development server:
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Project Structure

```
src/
├── core/           # Core architecture (routing, factories)
├── agents/         # Specialized agents for different topics
├── server.js       # Main Express server
└── utils/          # Utilities

dados/              # Source data (markdown, photos, biographies)
└── _metadata/      # Data structure documentation

public/             # Build output (auto-generated from dados/)
```

### Making Changes

1. **Modifying agents**: Edit files in `src/agents/`
   - All agents extend `BaseAgent`
   - Update keywords in agent constructor
   - Modify logic in `process()` method

2. **Adding new data**: Put in `dados/` directory
   - Data is auto-copied to `public/` during build
   - Update agent keywords to detect new data

3. **Updating templates**: Edit `src/server.js`
   - System prompts for OpenAI
   - Response rendering logic

### Building

Generate production build:
```bash
npm run build
```

This copies all data from `dados/` to `public/`

### Testing

Run existing tests:
```bash
npm test
```

Write new tests in `src/__tests__/`

### Debugging

Enable debug logging:
```bash
DEBUG=* npm run dev
```

Check browser console for frontend errors

## Code Quality

### Linting

```bash
npm run lint
```

### Code Style

- 2-space indentation
- Use `const` by default, `let` when reassignment needed
- Comments for complex logic
- Portuguese comments for Portuguese context

### Common Tasks

**Add a new agent:**
1. Create `src/agents/YourAgent.js`
2. Extend `BaseAgent`
3. Implement `canHandle()` and `process()`
4. Register in `AgentsFactory.js`

**Add new keywords:**
- Update agent's `keywords` array
- Update system prompt in `server.js` if needed

**Update data files:**
- Edit `.md` files in `dados/`
- Run `npm run build`
- Restart dev server

## Deployment

See `DEPLOYMENT.md` for production deployment instructions.
