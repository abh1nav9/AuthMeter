# Password Checker

A modern password strength analyzer and crack-time estimator built with React, TypeScript, and Tailwind CSS. Analyzes passwords locally in the browser and provides real-time feedback on strength, estimated crack times across multiple attack scenarios, and breach exposure checks via Have I Been Pwned.

## Features

- **Password Strength Analysis**

  - Entropy-based strength percentage (0-100%)
  - Character set detection (lowercase, uppercase, digits, symbols, spaces)
  - Pattern penalty detection (common passwords, repeats, sequences, keyboard walks, year patterns)
  - Visual strength indicator with color-coded progress bar

- **Crack Time Estimation**

  - Multiple attack scenarios:
    - Online (rate-limited)
    - Online (no rate limit)
    - Offline (slow hash: bcrypt, argon2id, scrypt, PBKDF2)
    - Offline (fast hash, GPU / fast hashes)
  - Shows average and worst-case crack times
  - Expandable view to see all scenarios

- **Breach Exposure Check**

  - Integration with Have I Been Pwned (HIBP) Pwned Passwords API
  - Privacy-safe k-anonymity protocol (only SHA-1 prefix sent, never the full password)
  - Real-time breach count if password appears in known data breaches

- **Password Suggestions**

  - Generates stronger password variants based on your input
  - Provides passphrase-style alternatives
  - Updates dynamically as you type

- **Modern UI/UX**
  - Bento grid layout (responsive: mobile, tablet, desktop)
  - Dark/light theme toggle
  - Smooth animations with Motion
  - Aceternity UI-inspired design elements
  - No page scroll (content fits viewport)

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v4** (styling)
- **Motion** (animations)
- **Lucide React** (icons)
- **Axios** (HTTP client for HIBP API)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Architecture

The codebase follows **object-oriented principles** with clear separation of concerns:

- **Domain Layer** (`src/domain/`): Business logic managers (password analysis, crack time estimation, breach checking)
- **ViewModels** (`src/viewmodels/`): React hooks that connect domain logic to UI
- **Components** (`src/components/`): Reusable UI components (shadcn-style primitives, password-specific cards, theme toggle)
- **Pages** (`src/pages/`): Top-level page components

### Key Design Principles

- **Single Responsibility**: Each class/function does one thing
- **Modular Design**: Components are reusable and testable
- **Manager Pattern**: Business logic separated into dedicated manager classes
- **No God Classes**: Logic split across focused, small files (< 200 lines per class)

## Privacy & Security

- **100% Local Analysis**: Password strength and crack-time calculations run entirely in your browser
- **Privacy-Safe Breach Check**: HIBP integration uses k-anonymity—only the first 5 characters of your password's SHA-1 hash are sent to the API
- **No Data Storage**: Your password is never stored, logged, or sent to any server (except the anonymized HIBP prefix)
- **No Tracking**: No analytics, cookies, or third-party trackers

## Limitations

- **Estimates Only**: Crack-time calculations are rough estimates. Real attackers may use:
  - Leaked password databases
  - Dictionary/rule-based attacks
  - Targeted guessing (personal info, company names, etc.)
  - Phishing or malware (bypassing password entirely)
- **No Guarantees**: This tool provides guidance, not security guarantees. Always use unique passwords per site and enable MFA when available.

## License

MIT License - see [LICENSE](LICENSE) file for details.
