---
name: GigFlow Design System
colors:
  surface: '#f7fafd'
  surface-dim: '#d7dadd'
  surface-bright: '#f7fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f7'
  surface-container: '#ebeef1'
  surface-container-high: '#e5e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#181c1e'
  on-surface-variant: '#424654'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f4'
  outline: '#737785'
  outline-variant: '#c3c6d6'
  surface-tint: '#0056d2'
  primary: '#0040a1'
  on-primary: '#ffffff'
  primary-container: '#0056d2'
  on-primary-container: '#ccd8ff'
  inverse-primary: '#b2c5ff'
  secondary: '#8a5100'
  on-secondary: '#ffffff'
  secondary-container: '#fe9800'
  on-secondary-container: '#643900'
  tertiary: '#20438e'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c5ba8'
  on-tertiary-container: '#ccd8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001847'
  on-primary-fixed-variant: '#0040a1'
  secondary-fixed: '#ffdcbd'
  secondary-fixed-dim: '#ffb86f'
  on-secondary-fixed: '#2c1600'
  on-secondary-fixed-variant: '#693c00'
  tertiary-fixed: '#dae2ff'
  tertiary-fixed-dim: '#b2c5ff'
  on-tertiary-fixed: '#001848'
  on-tertiary-fixed-variant: '#20438e'
  background: '#f7fafd'
  on-background: '#181c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built for the modern freelance economy—dynamic, high-growth, and professional. The brand personality is **energetic, upward-mobile, and reliable**. It targets independent professionals and business owners who need to navigate opportunities with speed and clarity.

The visual style is **Corporate / Modern** with a touch of **High-Contrast**. It uses the bold primary blue for trust and stability, while the vibrant orange/gold accent injects a sense of momentum and "flow." The UI should feel intentional and data-driven, utilizing clean lines and structured layouts to facilitate quick decision-making.

## Colors

The palette is extracted directly from the brand identity to ensure visual continuity.
- **Primary Blue (#0056D2):** Used for primary actions, navigation headers, and core branding elements. It represents professionalism and the "Gig" foundation.
- **Vibrant Gold (#FF9900):** A high-visibility accent color used for "success" metrics, growth indicators, and call-to-action highlights that represent "Flow."
- **Deep Navy (#002E7A):** A darker variant of the primary blue used for deep-layered backgrounds or high-contrast text.
- **Neutral Foundation:** A cool-toned slate gray palette is used for the background and surface containers to maintain a crisp, clean aesthetic.

## Typography

The typographic hierarchy utilizes **Hanken Grotesk** for headlines and labels to provide a sharp, contemporary, and geometric feel. **Inter** is used for body copy to ensure maximum legibility for data-heavy views and long-form content. 

Headlines should use tighter letter spacing to feel "locked-in" and authoritative. Mobile-specific overrides are defined for display and headline roles to ensure they don't break layout on smaller viewports.

## Layout & Spacing

This design system employs a **Fluid Grid** model with a standard 12-column structure for desktop. 
- **Desktop (1280px+):** 40px margins, 24px gutters.
- **Tablet (768px - 1279px):** 8-column grid, 24px margins, 16px gutters.
- **Mobile (Up to 767px):** 4-column grid, 16px margins, 16px gutters.

The spacing rhythm is based on a 4px baseline, but defaults to 8px increments (8, 16, 24, 32) for most component relationships to ensure a clean, breathable UI.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. 
1. **Level 0 (Base):** Neutral background (#F4F7FA).
2. **Level 1 (Surface):** Pure white containers (#FFFFFF) with a soft 1px border (#E2E8F0).
3. **Level 2 (Lifted):** Used for cards and dropdowns. Features a diffused shadow: `0px 4px 20px rgba(0, 46, 122, 0.08)`. The shadow is tinted with the brand's Deep Navy to maintain color harmony.
4. **Level 3 (Overlay):** Used for modals. Features a stronger shadow: `0px 12px 48px rgba(0, 46, 122, 0.12)`.

## Shapes

The shape language is **Rounded**, reflecting the fluid curves in the logo's "G" and arrow. Standard components (Inputs, Buttons) use a **0.5rem (8px)** corner radius. Large containers and cards use **1rem (16px)** to feel modern and accessible. Interactive elements like "Status Chips" may use a full pill-shape to distinguish them from actionable buttons.

## Components

- **Buttons:** Primary buttons use the brand Blue with white text. Secondary buttons use a white fill with a 1px Blue border. The "Growth/Action" button can utilize the Gold accent for high-priority conversions.
- **Input Fields:** 8px rounded corners, 1px Slate border. On focus, the border transitions to Primary Blue with a subtle 2px glow.
- **Cards:** White backgrounds, Level 2 elevation, and 16px corner radius. Content should have 24px internal padding.
- **Chips/Badges:** Use light tints of the brand colors (e.g., 10% opacity Blue background with 100% Blue text) to indicate categories or statuses.
- **Charts & Graphs:** Use the Gold accent specifically for "positive trend" lines or bars, contrasting against the Deep Navy for "current" or "baseline" data.