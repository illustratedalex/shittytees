# ShittyTees Brand Guide

## Brand Positioning

ShittyTees is independent apparel for people who prefer honesty over polish. The brand voice is dry, sharp, and self-aware.

## Voice

Core voice traits:

- blunt
- witty
- low-ego
- anti-corporate
- never mean-spirited toward customers

Write like a person who has seen enough marketing and is done pretending.

## Visual Direction

- premium dark groundwork
- warm neutral typography
- selective oxblood accents
- structured layouts with strong spacing rhythm
- garments should carry visual weight over decorative UI chrome

## Logo Usage

Use components from [components/brand/index.ts](components/brand/index.ts).

- Header: `LogoLockup` compact/horizontal
- Footer: `LogoLockup` horizontal
- Stamps or badges: `BrandStamp`
- Background restraint: `BrandPattern` at low opacity

Avoid stretching or distorting logo components.

## Color Palette

- ink / charcoal for base
- bone tones for text and highlights
- oxblood for key action emphasis
- metal tones for micro labels

Avoid bright neon accents and high-saturation rainbow themes.

## Typography

- Display/headline: condensed uppercase system via display font
- Body: clean sans for legibility
- Kicker/meta lines: small uppercase with controlled tracking

Avoid novelty fonts, graffiti fonts, and cartoon styles.

## Photography Direction

When real photography is used:

- directional, moody light
- neutral or dark backdrops
- fabric texture visible
- no glossy over-retouching
- no fake lifestyle stock scenes with unrelated context

## Garment Mockup Direction

Use [components/product/GarmentMockup.tsx](components/product/GarmentMockup.tsx) and keep presentation grounded:

- realistic shirt silhouette
- subtle fold and shadow treatment
- placement-aware artwork
- restrained hover lift

Use [data/productPresentation.ts](data/productPresentation.ts) for any per-product display overrides so card, hero, and PDP visuals stay consistent.

## Front/Back Presentation Rules

- If real imagery exists, prefer real front/back shots.
- If real imagery is unavailable, use garment mockups with explicit front/back view controls.
- Keep descriptive copy honest: do not imply studio photography where there is none.

## Accessibility Baseline

- Decorative garment and branding SVG elements should remain `aria-hidden`.
- Informational marks and mockups should expose explicit labels.
- Navigation links should use `aria-current` for active route context.

## Campaign Direction

Campaign sections should feel editorial, not ad-spam:

- clear headline
- one concise supporting paragraph
- one primary and one secondary action
- product focus first

## Artist's Bench

Artist's Bench is the brand's permanent collection for tattoo-shop craft, sketchbook process, workstation discipline, and the people who make things by hand.

What belongs:

- registration marks
- tracing paper layers
- crop lines
- masking tape details
- sketchbook notation
- bench-top geometry
- restrained maker/editorial typography

What does not belong:

- generic tattoo clip art
- novelty skull/rose filler
- fake claims about handmade garment production
- loud flash-sheet parody graphics

The tone should stay premium, useful, and observant rather than decorative.

## Acceptable Copy Examples

- Independent apparel for questionable people.
- Built for long shifts and louder opinions.
- Terrible ideas. Excellent shirts.

## Copy to Avoid

- We sold 1 million shirts this week.
- Hurry before countdown ends in 00:03.
- Certified elite premium guaranteed luxury class-A tier.

No fabricated social proof, scarcity, or unverifiable claims.
