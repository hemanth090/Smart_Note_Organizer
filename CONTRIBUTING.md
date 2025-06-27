# Contributing to Smart Notes Organizer

Thank you for your interest in contributing to Smart Notes Organizer! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node.js version, etc.)

### Suggesting Features

1. **Check existing feature requests** to avoid duplicates
2. **Use the feature request template**
3. **Provide clear use cases** and explain why the feature would be valuable
4. **Consider the scope** - keep features focused and well-defined

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/mernSmartNote.git
   cd mernSmartNote
   ```

3. **Set up the development environment**:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Configure environment variables**:
   - Copy `.env.example` to `.env` in both `server` and `client` directories
   - Fill in the required values (see README.md for details)

5. **Start the development servers**:
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev
   
   # Terminal 2 - Start client
   cd client
   npm run dev
   ```

### Making Changes

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow coding standards**:
   - Use consistent indentation (2 spaces)
   - Follow existing code style and patterns
   - Add comments for complex logic
   - Use meaningful variable and function names

3. **Write tests** for new functionality (when applicable)

4. **Test your changes**:
   - Ensure both client and server start without errors
   - Test the functionality you've added/modified
   - Check for console errors or warnings

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

### Submitting Changes

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Link any related issues
   - Add screenshots for UI changes

3. **Respond to feedback**:
   - Address review comments promptly
   - Make requested changes in new commits
   - Keep the conversation constructive

## Development Guidelines

### Frontend (React)

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Keep components small and focused
- Use proper prop types or TypeScript

### Backend (Node.js/Express)

- Follow RESTful API conventions
- Use proper error handling
- Validate input data
- Use middleware appropriately
- Follow the existing project structure

### Database (MongoDB)

- Use Mongoose for data modeling
- Define proper schemas with validation
- Use appropriate indexes
- Handle database errors gracefully

### File Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page-level components
├── services/           # API calls and external services
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── constants/          # Application constants
```

## Testing

- Write unit tests for utility functions
- Test API endpoints with proper error cases
- Test React components with user interactions
- Ensure all tests pass before submitting PR

## Documentation

- Update README.md if you change setup/usage instructions
- Add JSDoc comments for complex functions
- Update API documentation for new endpoints
- Include code examples where helpful

## Performance Considerations

- Optimize images and assets
- Use lazy loading where appropriate
- Minimize bundle size
- Consider database query performance
- Profile and test performance changes

## Security

- Never commit sensitive data (API keys, passwords)
- Validate and sanitize user input
- Use HTTPS in production
- Follow security best practices
- Report security issues privately

## Questions?

If you have questions about contributing, feel free to:
- Open an issue with the "question" label
- Start a discussion in the GitHub Discussions tab
- Contact the maintainers

Thank you for contributing to Smart Notes Organizer!