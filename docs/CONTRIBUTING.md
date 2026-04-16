# Contributing to WanderWise AI

Thank you for your interest in contributing to WanderWise AI! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- A clear title and description
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node version)

### Suggesting Features

We love new ideas! Please create an issue with:

- A clear description of the feature
- Why it would be useful
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments where necessary
   - Update documentation if needed

4. **Test your changes**

   ```bash
   npm run test
   npm run build
   ```

5. **Commit your changes**

   ```bash
   git commit -m "Add: brief description of your changes"
   ```

   Use conventional commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Remove:` for removing code/files
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

1. Clone your fork
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your credentials
4. Start dev server: `npm run dev`

## Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/contexts/` - React contexts
- `src/lib/` - Utility functions
- `src/hooks/` - Custom React hooks

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test on multiple browsers if possible

## Questions?

Feel free to open an issue for any questions or clarifications.

Thank you for contributing! 🎉
