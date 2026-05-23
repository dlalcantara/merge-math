I'm building a browser game for GitHub Pages using Vite + React.

TECHNICAL REQUIREMENTS:
- Build tool: Vite (with React plugin)
- Framework: React (functional components, hooks)
- Deployment: GitHub Pages (must work with repo subdirectory routing)
- No backend/server required
- localStorage for game state persistence
- Mobile responsive
- Works offline

DEPLOYMENT CONTEXT:
- Repository: [your-username]/[repo-name]
- GitHub Pages URL will be: https://[your-username].github.io/[repo-name]
- Must handle asset paths correctly for subdirectory deployment
- Single-page app (no server-side routing needed)

DESIGN REQUIREMENTS:
- UI: Simple but appealing (not minimalist to the point of boring)
- Aesthetic: modern clean
- No images
- Mobile-first responsive design
- Smooth micro-interactions and visual feedback

ARCHITECTURE REQUIREMENTS:
- Design Action tracking such that undo and redo is possible
- Design Classes and Method signatures such that Effects of user Actions can be modified in the future. 
