# Design Guidelines & UI Styling Inspiration
## Based on Genesis Energy (genesis.energy.gov) and Federal Design Standards

---

## Overview

The Genesis Energy website follows U.S. Department of Energy (DOE) design standards and aligns with the **U.S. Web Design System (USWDS)** principles. While specific design guidelines aren't publicly available, we can extract design patterns from federal government websites and USWDS standards.

---

## 1. U.S. Web Design System (USWDS)

### What is USWDS?

The **U.S. Web Design System** is a design system for building fast, accessible, mobile-friendly federal government websites. It provides:

- **Design principles** for human-centered design
- **UI components** (buttons, forms, cards, navigation, etc.)
- **Design tokens** (colors, spacing, typography)
- **Accessibility standards** (WCAG 2.1 AA compliance)
- **Responsive design** patterns

### Installation & Usage

**CDN (Quick Start):**
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@uswds/uswds@3.5.0/dist/css/uswds.min.css">

<!-- JavaScript (optional, for interactive components) -->
<script src="https://cdn.jsdelivr.net/npm/@uswds/uswds@3.5.0/dist/js/uswds.min.js"></script>
```

**NPM:**
```bash
npm install @uswds/uswds
```

**Official Website:** https://designsystem.digital.gov/

---

## 2. Design Principles (USWDS)

### Core Principles

1. **Start with real user needs**
   - Understand user goals and tasks
   - Design for the user, not the agency

2. **Earn trust**
   - Be transparent and honest
   - Use clear, plain language
   - Provide accurate, timely information

3. **Embrace accessibility**
   - Design for everyone
   - Follow WCAG 2.1 AA standards
   - Test with real users and assistive technologies

4. **Promote continuity**
   - Use consistent patterns and components
   - Follow established conventions
   - Make navigation predictable

5. **Listen**
   - Test with users
   - Iterate based on feedback
   - Measure success

---

## 3. Color Palette

### USWDS Color System

USWDS uses a systematic color palette with semantic naming:

**Primary Colors:**
- **Primary Blue:** `#005ea2` (USWDS primary)
- **Primary Darker:** `#1a4480`
- **Primary Darkest:** `#162e51`

**Secondary Colors:**
- **Secondary:** `#d83933` (red)
- **Accent Cool:** `#00bde3` (cyan)
- **Accent Warm:** `#ffb81c` (yellow)

**Neutral Colors:**
- **Base:** `#1b1b1b` (text)
- **Base Lighter:** `#565c65`
- **Base Lightest:** `#f0f0f0`
- **White:** `#ffffff`

**Status Colors:**
- **Success:** `#00a91c` (green)
- **Warning:** `#ffbe2e` (yellow)
- **Error:** `#d83933` (red)
- **Info:** `#00bde3` (cyan)

### DOE-Inspired Color Scheme

Based on federal government standards:

```css
/* Primary Colors */
--color-primary: #005ea2;        /* Federal Blue */
--color-primary-dark: #1a4480;
--color-primary-darkest: #162e51;

/* Secondary Colors */
--color-secondary: #d83933;      /* Federal Red */
--color-accent: #00bde3;         /* Accent Cyan */

/* Neutral Colors */
--color-base: #1b1b1b;           /* Text */
--color-base-light: #565c65;
--color-base-lighter: #757575;
--color-base-lightest: #f0f0f0;
--color-white: #ffffff;

/* Background Colors */
--color-background: #ffffff;
--color-background-alt: #f0f0f0;
--color-background-dark: #162e51;

/* Status Colors */
--color-success: #00a91c;
--color-warning: #ffbe2e;
--color-error: #d83933;
--color-info: #00bde3;
```

---

## 4. Typography

### Font Stack (USWDS)

USWDS uses **Source Sans Pro** as the primary font:

```css
font-family: 'Source Sans Pro', 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
```

**Alternative (System Fonts):**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Typography Scale

```css
/* Headings */
h1 { font-size: 2.5rem; font-weight: 700; line-height: 1.2; }
h2 { font-size: 2rem; font-weight: 700; line-height: 1.3; }
h3 { font-size: 1.5rem; font-weight: 700; line-height: 1.4; }
h4 { font-size: 1.25rem; font-weight: 600; line-height: 1.4; }
h5 { font-size: 1.1rem; font-weight: 600; line-height: 1.5; }
h6 { font-size: 1rem; font-weight: 600; line-height: 1.5; }

/* Body Text */
body { font-size: 1rem; line-height: 1.6; }
p { margin-bottom: 1rem; }

/* Small Text */
small { font-size: 0.875rem; }
```

---

## 5. Spacing System

USWDS uses an **8px base unit** spacing system:

```css
/* Spacing Scale */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.5rem;   /* 24px */
--spacing-6: 2rem;     /* 32px */
--spacing-7: 2.5rem;   /* 40px */
--spacing-8: 3rem;     /* 48px */
--spacing-9: 4rem;     /* 64px */
```

---

## 6. Component Patterns

### Buttons

```css
/* Primary Button */
.btn-primary {
  background-color: #005ea2;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1a4480;
}

.btn-primary:active {
  background-color: #162e51;
}

/* Secondary Button */
.btn-secondary {
  background-color: #ffffff;
  color: #005ea2;
  border: 2px solid #005ea2;
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #f0f0f0;
}
```

### Cards

```css
.card {
  background-color: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 0.25rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1b1b1b;
  border-bottom: 2px solid #005ea2;
  padding-bottom: 0.5rem;
}
```

### Forms

```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1b1b1b;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #565c65;
  border-radius: 0.25rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #005ea2;
  box-shadow: 0 0 0 3px rgba(0, 94, 162, 0.1);
}
```

---

## 7. Layout Patterns

### Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}
```

### Grid System

```css
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
```

---

## 8. Recommended Libraries & Frameworks

### 1. **U.S. Web Design System (USWDS)**
   - **Type:** Design System / Component Library
   - **Website:** https://designsystem.digital.gov/
   - **Installation:** `npm install @uswds/uswds`
   - **CDN:** Available via jsDelivr
   - **Best for:** Federal-style websites, accessibility compliance

### 2. **Bootstrap 5** (Government Theme)
   - **Type:** CSS Framework
   - **Website:** https://getbootstrap.com/
   - **Installation:** `npm install bootstrap`
   - **Best for:** Rapid development, responsive layouts
   - **Note:** Can be customized to match USWDS colors

### 3. **Tailwind CSS** (Custom Config)
   - **Type:** Utility-First CSS Framework
   - **Website:** https://tailwindcss.com/
   - **Installation:** `npm install tailwindcss`
   - **Best for:** Custom design systems, utility-based styling
   - **Note:** Can configure with USWDS colors and spacing

### 4. **Material Design** (Government Variant)
   - **Type:** Design System
   - **Website:** https://material.io/
   - **Best for:** Modern, clean interfaces
   - **Note:** Less aligned with federal standards

### 5. **Foundation for Sites**
   - **Type:** CSS Framework
   - **Website:** https://get.foundation/
   - **Best for:** Flexible, customizable frameworks

---

## 9. Implementation Recommendations

### Option 1: Full USWDS Implementation (Recommended)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Site</title>
  
  <!-- USWDS CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@uswds/uswds@3.5.0/dist/css/uswds.min.css">
  
  <!-- Custom CSS (if needed) -->
  <link rel="stylesheet" href="css/custom.css">
</head>
<body>
  <!-- Your content using USWDS classes -->
</body>
</html>
```

### Option 2: Custom CSS with USWDS Colors

Create a custom stylesheet using USWDS design tokens:

```css
/* Custom CSS using USWDS-inspired design tokens */
:root {
  --color-primary: #005ea2;
  --color-primary-dark: #1a4480;
  --color-base: #1b1b1b;
  --color-base-lightest: #f0f0f0;
  /* ... other tokens */
}

/* Use these tokens throughout your CSS */
```

### Option 3: Tailwind CSS with Custom Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005ea2',
          dark: '#1a4480',
          darkest: '#162e51',
        },
        // ... other colors
      },
      fontFamily: {
        sans: ['Source Sans Pro', 'Helvetica Neue', 'Helvetica', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
}
```

---

## 10. Accessibility Standards

### WCAG 2.1 AA Compliance

- **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** All interactive elements must be keyboard accessible
- **Screen Readers:** Proper ARIA labels and semantic HTML
- **Focus Indicators:** Visible focus states on all interactive elements

### Testing Tools

- **WAVE:** https://wave.webaim.org/
- **axe DevTools:** Browser extension
- **Lighthouse:** Built into Chrome DevTools

---

## 11. Key Design Characteristics

### Federal Government Website Traits

1. **Clean, Professional Layout**
   - Generous white space
   - Clear hierarchy
   - Consistent spacing

2. **Accessible Color Scheme**
   - High contrast ratios
   - Color-blind friendly
   - Status colors with icons/text

3. **Readable Typography**
   - Sans-serif fonts
   - Appropriate line-height
   - Clear heading hierarchy

4. **Mobile-First Design**
   - Responsive layouts
   - Touch-friendly targets (min 44x44px)
   - Collapsible navigation

5. **Trust Indicators**
   - Official branding
   - Clear disclaimers
   - Contact information
   - Last updated dates

---

## 12. Resources & References

### Official Resources

- **USWDS:** https://designsystem.digital.gov/
- **DOE Design Guidelines:** https://www.energy.gov/design
- **DOE Graphics Standards:** https://www.energy.gov/eere/communicationstandards/graphics-and-image-standards-web
- **GSA Web Style Guide:** https://www.gsa.gov/reference/gsa-web-style-guide

### Design Inspiration

- **Genesis Energy:** https://genesis.energy.gov/
- **Energy.gov:** https://www.energy.gov/
- **Other Federal Sites:** Browse other .gov websites for patterns

### Tools

- **USWDS Components:** https://designsystem.digital.gov/components/
- **USWDS Design Tokens:** https://designsystem.digital.gov/design-tokens/
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

## 13. Quick Start Checklist

- [ ] Choose a framework (USWDS recommended)
- [ ] Set up color palette using USWDS tokens
- [ ] Configure typography (Source Sans Pro or system fonts)
- [ ] Implement spacing system (8px base unit)
- [ ] Create component library (buttons, forms, cards)
- [ ] Set up responsive grid system
- [ ] Test accessibility (WCAG 2.1 AA)
- [ ] Test on multiple devices/browsers
- [ ] Review with users (if possible)

---

## Summary

For a website inspired by Genesis Energy and federal design standards:

1. **Use USWDS** for the most authentic federal look
2. **Follow WCAG 2.1 AA** accessibility standards
3. **Use USWDS color palette** (#005ea2 primary blue)
4. **Implement responsive design** with mobile-first approach
5. **Use clear, readable typography** (Source Sans Pro or system fonts)
6. **Maintain consistent spacing** (8px base unit)
7. **Test accessibility** with tools like WAVE or axe

The USWDS framework provides the most direct path to achieving a federal government-style design that matches Genesis Energy's aesthetic.

