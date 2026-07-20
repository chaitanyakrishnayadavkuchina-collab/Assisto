# Assisto HRM Test Automation Framework

A **Keyword-Driven Testing** framework built on **Playwright + TypeScript** with Page Object Model (POM).

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  Test Specs (tests/*.spec.ts)                   │
│  High-level tests with assertions              │
├─────────────────────────────────────────────────┤
│  Keywords (keywords/*.ts)                       │
│  Business actions: login(), navigateTo()       │
├─────────────────────────────────────────────────┤
│  Pages (pages/*.ts)                             │
│  Atomic locators and UI actions                │
├─────────────────────────────────────────────────┤
│  Fixtures (fixtures/*.ts)                       │
│  Dependency injection                           │
└─────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
assisto-hrm-tests/
├── pages/              # Page Object classes (locators + actions)
├── keywords/           # Keyword classes (business logic)
├── tests/              # Test specification files
├── fixtures/           # Custom Playwright fixtures
├── utils/              # Shared utilities
├── test-data/          # JSON test data files
├── reports/            # Test report output
├── .env.example        # Environment template
├── playwright.config.ts
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+ 
- **npm** v9+
- **Git**

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
BASE_URL=http://nsplus.perf.devassisto.com
LOGIN_URL=/login
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-password
```

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

Or install all browsers:

```bash
npx playwright install
```

## 🎯 Running Tests

### Basic Commands

```bash
# Run all tests (headless)
npm test

# Run tests with visible browser
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug
```

### Run Specific Tests

```bash
# Run a specific test file
npx playwright test tests/login.spec.ts

# Run tests matching a title
npx playwright test --grep "login"

# Run in specific browser
npx playwright test --project=chromium
```

### View Reports

```bash
# Open HTML report
npm run test:report
```

## 🧪 Features Implemented

### ✅ Login Feature

1. **Successful Login** - Test with valid credentials
2. **Invalid Credentials** - Test error message display
3. **Empty Fields** - Test form validation

## 🔑 Key Design Decisions

1. **Keyword-Driven Testing**: Tests call high-level business actions
2. **Page Object Model**: Each screen has its own class
3. **Role-Based Locators**: Uses `getByRole()` for accessibility
4. **Environment Variables**: Sensitive data from `.env`
5. **Dependency Injection**: Fixtures auto-inject objects

## 📝 Adding New Features

1. Create page class in `/pages/`
2. Create keyword class in `/keywords/`
3. Register in `/fixtures/test.fixture.ts`
4. Add test data to `/test-data/`
5. Write tests in `/tests/`

## 🤝 Contributing

- Follow TypeScript strict mode
- Use role-based locators
- Add TODO comments for unverified selectors
- Keep tests independent and parallelizable

## 📄 License

MIT
