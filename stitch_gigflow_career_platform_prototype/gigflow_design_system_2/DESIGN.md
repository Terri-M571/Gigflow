---
name: GigFlow Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#434654'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#1b55d0'
  primary: '#003594'
  on-primary: '#ffffff'
  primary-container: '#004ac6'
  on-primary-container: '#b8c8ff'
  inverse-primary: '#b4c5ff'
  secondary: '#8f4e00'
  on-secondary: '#ffffff'
  secondary-container: '#fda552'
  on-secondary-container: '#703c00'
  tertiary: '#751f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#9c2e02'
  on-tertiary-container: '#ffb9a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#ffdcc1'
  secondary-fixed-dim: '#ffb779'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6c3a00'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#842500'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for a premium, AI-driven career ecosystem. The brand personality is **Professional, Sophisticated, and Forward-thinking**, aiming to evoke a sense of calm authority and high-tech efficiency. The target audience includes high-growth professionals and enterprise recruiters who value precision and clarity.

The visual style follows a **Corporate / Modern** aesthetic with a slight "Tech-Luxe" edge. It utilizes generous whitespace to reduce cognitive load during complex career transitions, paired with subtle glassmorphism in navigation and soft, elevated surfaces that create a clear mental model of information hierarchy. The interface feels reactive and intelligent, using precise motion and crisp layout to reinforce the AI-powered nature of the platform.

## Colors

The palette is anchored by **Deep Trust Blue (#004AC6)**, providing a foundation of institutional reliability. This is balanced by **Action Amber (#C97A2B)**, a warm accent used sparingly for primary conversion points and critical status updates to provide high-contrast visual cues without feeling aggressive.

The background uses a cool, slate-tinted white to reduce screen glare during long sessions, while interactive surfaces remain pure white to "pop" via elevation. 

- **Primary:** Use for navigation, primary buttons, and active states.
- **Secondary/Accent:** Use for high-priority CTA buttons and "New" badges.
- **Semantic Colors:** Reserved strictly for system feedback (success, warning, error) to maintain their communicative power.

## Typography

This design system utilizes **Inter** exclusively to leverage its exceptional legibility and systematic weight distribution. The type scale is optimized for data-rich SaaS environments, prioritizing clarity in dense dashboards.

- **Display & Headlines:** Use semi-bold and bold weights with slight negative letter-spacing to create a compact, "tech" appearance.
- **Body Text:** Standardized on a 16px base for optimal readability. Use the "Slate" neutral color for body text to maintain a softer contrast than pure black.
- **Labels:** Use for small metadata, table headers, and overlines. Upper-case treatment is reserved for secondary labels to provide rhythmic variety in the UI.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. Content is contained within a 1280px max-width wrapper on desktop but fluidly adapts within that container. A 12-column grid is used for dashboards, while a centered 8-column layout is preferred for long-form career content and settings.

- **Grid:** 12 columns (desktop), 6 columns (tablet), 4 columns (mobile).
- **Rhythm:** A 4px baseline grid ensures consistent vertical alignment.
- **Breakpoints:**
    - Mobile: < 640px (Margins: 16px)
    - Tablet: 640px - 1024px (Margins: 24px)
    - Desktop: > 1024px (Margins: 32px)

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. The background layer (#F8FAFC) acts as the base. 

- **Level 0 (Base):** Background color. Used for structural areas and page gutters.
- **Level 1 (Cards):** Pure White (#FFFFFF) with a soft 1px border (#E2E8F0) and a very subtle shadow (Y: 2px, Blur: 4px, Opacity: 4% Black). Use for dashboard widgets.
- **Level 2 (Interactive):** Same as Level 1 but with an increased shadow (Y: 8px, Blur: 16px, Opacity: 8% Black) on hover to indicate interactivity.
- **Level 3 (Modals/Overlays):** High elevation with a tinted backdrop blur (12px) to focus user attention on AI-generated insights or forms.

## Shapes

The design system employs a **Rounded** shape language to balance professional structure with modern approachability. 

- **Base Radius (8px):** The default for buttons, input fields, and small components.
- **Large Radius (16px):** Used for primary cards and dashboard containers.
- **Extra Large Radius (24px):** Reserved for hero sections and large image containers.
- **Pill:** Strictly used for status chips and tags to differentiate them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid #004AC6 with white text. 8px radius. Subtle gradient overlay (top to bottom) for depth.
- **Accent:** Solid #C97A2B for high-conversion actions (e.g., "Apply Now").
- **Ghost:** Transparent background with Primary color border and text. Used for secondary navigation.

### Input Fields
- White background with 1px #E2E8F0 border.
- On focus: Border changes to Primary Blue with a 3px soft outer glow (Primary Blue at 10% opacity).
- Labels should always be visible above the input field in `label-sm`.

### Cards
- Use for dashboard metrics and job listings. 
- Must include 24px internal padding.
- Headings inside cards should use `headline-md`.

### Chips & Badges
- Used for skills and status indicators.
- Skills: Light Blue background (#EFF6FF) with Primary Blue text.
- Status: Use semantic colors (Success/Warning) with 10% opacity backgrounds and 100% opacity text.

### Progress Indicators
- Use a slim (4px) horizontal bar for AI-processing states, utilizing a shimmering gradient animation from Primary to a lighter tint of the same hue.