# AuthMeter - Password Strength & Crack Time Estimator

Browser-based password strength analyzer with crack-time estimation and breach checking.

## Features

- Entropy-based strength calculation (0-100%)
- Pattern detection (common passwords, sequences, keyboard walks)
- Crack time estimation for multiple attack scenarios
- Have I Been Pwned breach check (k-anonymity protocol)
- Password suggestions and passphrase generation

## Setup

```bash
git clone https://github.com/abh1nav9/AuthMeter
```

```bash
npm install
```

```bash
npm run dev
```

## Tech Stack

React 19, TypeScript, Vite, Tailwind CSS v4, zxcvbn-ts, Axios

## How It Works

### Strength Calculation
1. **Character Set Detection** - Identifies charset size (lowercase, uppercase, digits, symbols, spaces)
2. **Entropy Calculation** - `entropy = length × log2(charset_size)`
3. **Pattern Penalties** - Reduces entropy for:
   - Common passwords (30-bit penalty)
   - Sequences (abc, 123) (10-bit penalty)
   - Keyboard walks (qwerty) (10-bit penalty)
   - Repeated characters (6-20 bit penalty)
   - Year patterns (6-bit penalty)
4. **Final Score** - Maps 0-80 bits → 0-100% scale

### Crack Time Estimation
- **Guess Count** = `2^effective_entropy`
- **Time** = `guesses / (attack_rate × 2)` for average case
- Attack rates:
  - Online throttled: 0.1/sec
  - Online unthrottled: 10/sec
  - Offline slow (bcrypt/argon2): 50-2000/sec
  - Offline fast (GPU): 10B/sec

### Breach Check
- SHA-1 hash password locally
- Send first 5 chars to HIBP API (k-anonymity)
- API returns all hash suffixes matching prefix
- Check if full hash exists in response

## Architecture

- `src/domain/` - Business logic managers
- `src/viewmodels/` - React hooks connecting domain to UI
- `src/components/` - UI components
- `src/pages/` - Page components

OOP-first design: single responsibility, manager pattern, modular composition.

## Privacy

- All analysis runs locally in browser
- HIBP API uses k-anonymity (only SHA-1 prefix sent)
- No data storage, logging, or tracking

## License

[MIT](LICENSE)

## Author

**Abhinav Gautam**  
Email: abhinavgautam092@gmail.com  
Website: [portfolio](https://abhinavdev.vercel.app/)