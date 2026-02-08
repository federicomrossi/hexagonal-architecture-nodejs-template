# Hexagonal Architecture Node.js Template

A simple template for a Node.js server with hexagonal architecture using native TypeScript.

## 🚀 Features

- **Native TypeScript**: Run TypeScript directly with Node.js v24.13.0+ without transpilation
- **Hexagonal Architecture**: Clean separation of concerns with ports and adapters
- **Express.js**: Web framework with comprehensive security middleware
- **Awilix**: Dependency injection container
- **RBAC**: Role-Based Access Control with audit logging
- **ABAC**: Attribute-Based Access Control with policy engine
- **Jest**: Testing framework with TypeScript support
- **Security**: Helmet, CORS, rate limiting, XSS protection, and more

## 📋 Prerequisites

- **Node.js**: v24.13.0 or higher
- **npm**: Latest version

## 🛠️ Installation

```bash
# Clone the repository
git clone <repository-url>
cd hexagonal-architecture-nodejs-template

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Update .env with your configuration
```

## 🏗️ Project Structure

```
src/
├── domain/                 # Business logic and entities
│   ├── entities/          # Core business entities
│   ├── repositories/      # Repository interfaces
│   └── services/          # Domain services
├── application/           # Use cases and application services
│   ├── usecases/         # Application use cases
│   ├── services/         # Application services (Policy Engine)
│   └── types/             # Application DTOs
├── infrastructure/        # External adapters
│   ├── database/         # Database implementations
│   ├── policies/         # Policy configurations
│   └── security/         # Security configurations
├── presentation/          # Interface adapters
│   ├── controllers/      # HTTP controllers
│   ├── middleware/       # Express middleware
│   └── routes/           # Route definitions
└── shared/               # Shared utilities and types
    ├── types/            # Common type definitions
    ├── utils/            # Utility functions
    └── errors/           # Custom error classes
```

## 🔧 Development

### Running the Server

```bash
# Development mode with type checking
npm run dev

# Production mode
npm start
```

### Type Checking

```bash
# One-time type check
npm run typecheck

# Type checking in watch mode
npm run typecheck:watch
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test by name
npm run test:single "test name"

# Run tests in specific file
npm run test:file "filename"
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

## 🔐 Security Features

### RBAC (Role-Based Access Control)

- **Roles**: admin, manager, user, guest
- **Permissions**: Fine-grained permissions like `users:read`, `users:write`, `users:delete`
- **Middleware**: Automatic permission checking with audit logging

### ABAC (Attribute-Based Access Control)

- **Policy Engine**: Configurable policies with priority system
- **Context Evaluation**: User, resource, action, and environment attributes
- **Default Policies**: Owner access, admin access, department-based access, business hours

### Security Middleware

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **XSS Protection**: Cross-site scripting prevention
- **Input Sanitization**: NoSQL injection prevention

## 📝 API Endpoints

### Authentication

All endpoints require JWT authentication (except health check).

```bash
# Add Authorization header
Authorization: Bearer <your-jwt-token>
```

### User Management

```bash
# Create user (requires users:write permission)
POST /api/users
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "department": "engineering"
}

# Get user by ID (requires users:read permission)
GET /api/users/:id
Authorization: Bearer <token>
```

### Health Check

```bash
# Health check (no authentication required)
GET /health
```

## 🧪 Testing Strategy

### Unit Tests
- **Domain Entities**: Pure business logic testing
- **Use Cases**: Application logic with mocked dependencies
- **Repositories**: Data access layer testing

### Integration Tests
- **Controllers**: HTTP endpoint testing
- **Middleware**: Authentication and authorization testing
- **Policy Engine**: ABAC policy evaluation testing

### Test Structure

```
tests/
├── setup/               # Test configuration and utilities
├── domain/             # Domain layer tests
├── application/         # Application layer tests
├── infrastructure/      # Infrastructure layer tests
└── presentation/        # Presentation layer tests
```

## 🔒 Audit Logging

The application provides comprehensive audit logging for:

- **Authentication**: Success/failure login attempts
- **Authorization**: RBAC/ABAC permission checks
- **Use Cases**: Business operation execution
- **API Requests**: HTTP request logging

Log files are created in the `logs/` directory:
- `logs/combined.log`: General application logs
- `logs/error.log`: Error logs
- `logs/audit.log`: Security and audit logs

## 🚀 Deployment

### Environment Variables

Configure these environment variables for production:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-production-secret
ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=warn
```

### Production Build

```bash
# Type checking
npm run typecheck

# Run tests
npm test

# Start production server
npm start
```

## 📚 Architecture Guidelines

### Dependency Injection

Use Awilix for dependency injection:

```typescript
// Register dependencies
container.register({
  userRepository: asClass(UserRepository).singleton(),
  createUserUseCase: asClass(CreateUserUseCase).singleton(),
});

// Resolve dependencies
const useCase = container.resolve<CreateUserUseCase>('createUserUseCase');
```

### Error Handling

Use custom error classes:

```typescript
// Validation errors
throw new ValidationError('Invalid email', 'email');

// Authorization errors
throw new ForbiddenError('Access denied');

// Not found errors
throw new NotFoundError('User');
```

### Result Pattern

Use Result<T> for operation results:

```typescript
const result = await useCase.execute(data);

if (result.isSuccess) {
  // Handle success
  const user = result.value;
} else {
  // Handle error
  const error = result.error;
}
```

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Run type checking and linting before committing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.