# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in this Node.js hexagonal architecture repository.

## Build, Lint, and Test Commands

Since this is a template repository, the following commands should be set up in `package.json` once the project is initialized:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:single": "jest --testNamePattern",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

### Running Single Tests
- Use `npm run test:single "test name"` to run a specific test by name
- Use `npm run test -- --testPathPattern=filename` to run tests in a specific file
- Use `npm run test:watch` to run tests in watch mode during development

## Project Structure

This project follows hexagonal (ports and adapters) architecture:

```
src/
├── domain/           # Business logic and entities
│   ├── entities/     # Core business entities
│   ├── repositories/ # Repository interfaces
│   └── services/     # Domain services
├── application/      # Use cases and application services
│   ├── usecases/     # Application use cases
│   └── services/     # Application services
├── infrastructure/    # External adapters
│   ├── database/     # Database implementations
│   ├── http/         # HTTP clients
│   └── messaging/    # Message brokers
├── presentation/     # Interface adapters
│   ├── controllers/  # HTTP controllers
│   ├── routes/       # Route definitions
│   └── middleware/   # Express/Fastify middleware
└── shared/           # Shared utilities and types
    ├── types/        # Common type definitions
    ├── utils/        # Utility functions
    └── errors/       # Custom error classes
```

## Code Style Guidelines

### TypeScript Configuration
- Use strict TypeScript settings
- Enable all type-checking rules
- Use path mapping for clean imports between layers
- Prefer explicit return types for public APIs

### Import Organization
```typescript
// 1. Node.js built-in modules
import { EventEmitter } from 'events';

// 2. External dependencies (alphabetical)
import express from 'express';
import { injectable } from 'inversify';

// 3. Internal modules (layered, alphabetical)
import { UserEntity } from '@/domain/entities/UserEntity';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { CreateUserUseCase } from '@/application/usecases/CreateUserUseCase';
```

### Naming Conventions
- **Files**: PascalCase for classes (UserEntity.ts), camelCase for utilities (userMapper.ts)
- **Classes**: PascalCase (UserRepository, UserService)
- **Interfaces**: Prefix with 'I' (IUserRepository)
- **Methods**: camelCase, descriptive verbs (createUser, findById)
- **Variables**: camelCase, descriptive nouns (userData, userRepository)
- **Constants**: UPPER_SNAKE_CASE (MAX_RETRY_COUNT, API_BASE_URL)

### Error Handling
- Create custom error classes for different error types
- Use consistent error propagation through layers
- Implement proper HTTP status codes in presentation layer
- Log errors appropriately without exposing sensitive information

```typescript
// Custom error example
export class ValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handling in use case
try {
  const result = await this.repository.create(data);
  return Result.success(result);
} catch (error) {
  if (error instanceof ValidationError) {
    return Result.failure(error);
  }
  throw new ApplicationError('Failed to create user', error);
}
```

### Dependency Injection
- Use constructor injection for dependencies
- Prefer interfaces over concrete implementations
- Use a DI container (inversify) for managing dependencies

```typescript
@injectable()
export class CreateUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EventEmitter) private eventEmitter: IEventEmitter
  ) {}
}
```

### Testing Guidelines
- Write unit tests for all business logic
- Use dependency injection for mocking
- Test both success and failure scenarios
- Use descriptive test names that explain the behavior

```typescript
describe('CreateUserUseCase', () => {
  it('should create user successfully when valid data is provided', async () => {
    // Arrange
    const userData = { name: 'John', email: 'john@example.com' };
    const expectedUser = new UserEntity('1', userData.name, userData.email);
    
    // Act
    const result = await useCase.execute(userData);
    
    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(expectedUser);
  });
});
```

### Code Quality
- Always run linting and type checking before committing
- Use meaningful variable and function names
- Keep functions small and focused on single responsibility
- Add JSDoc comments for public APIs
- Prefer composition over inheritance

## Development Workflow

1. Always run `npm run typecheck` and `npm run lint` before committing
2. Write tests for new features before implementation (TDD)
3. Keep the dependency inversion principle in mind when adding new modules
4. Ensure all layers remain loosely coupled through interfaces
5. Use environment variables for configuration, never hardcode values

## Tools and Technologies

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js or Fastify (to be decided)
- **DI Container**: Inversify
- **Testing**: Jest with TypeScript support
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier (recommended)

## Notes for Agents

- This is a template repository - you may need to initialize the project structure
- Always follow hexagonal architecture principles
- Maintain clean separation between layers
- Use interfaces to define contracts between layers
- Prefer dependency injection for testability and maintainability
- Keep business logic independent of external concerns