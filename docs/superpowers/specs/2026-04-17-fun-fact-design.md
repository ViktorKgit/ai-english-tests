# Fun Fact Feature - Design Spec

**Date:** 2026-04-17
**Status:** Approved

## Overview

Add a "Fun Fact" component to the home page that displays a random interesting fact from a curated list of 100 facts. Facts are a mix of English language facts and general knowledge, all in English to provide additional reading practice.

## Goals

- Make the home page more engaging
- Provide additional English reading exposure
- Easy to maintain and extend

## Architecture

### File Structure

```
public/facts.json              — 100 curated facts
components/FunFact.tsx         — Displays random fact
components/test/HomePage.tsx   — Add FunFact at bottom
```

### Data Format

```json
{
  "facts": [
    {
      "text": "The word 'set' has the highest number of definitions in the English language - over 430!",
      "category": "english"
    },
    {
      "text": "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.",
      "category": "general"
    }
  ]
}
```

**Categories:**
- `english` — Facts about English language, grammar, vocabulary, history
- `general` — Interesting facts about science, history, nature, etc.

**Distribution:** ~50 facts per category (100 total)

## Component: FunFact

### Props
None (self-contained)

### Behavior
- Selects one random fact on mount (never changes during session)
- Uses `useMemo` with `Math.random()` for selection
- Falls back to default fact if JSON fails to load

### UI Design
```
┌─────────────────────────────────────┐
│ 💡 Did you know?                    │
│                                     │
│ The word 'set' has the highest...   │
└─────────────────────────────────────┘
```

**Styling:**
- Card with `muted` background (light gray in light mode, dark gray in dark mode)
- `muted-foreground` text color
- Lightbulb icon (Lucide `Lightbulb`)
- Centered at bottom of HomePage
- Max width ~600px
- Rounded corners, subtle border

## Placement

Add `FunFact` component at the bottom of `HomePage.tsx`, before the footer area.

## Data Loading

- Fetch from `/facts.json` on component mount
- Show loading state while fetching
- Show error state if fetch fails (with fallback fact)

## Future Considerations

Out of scope for this implementation:
- Fact sharing to social media
- User-submitted facts
- Fact categories filter
- Fact favorites
- Daily fact (date-based selection)

## Testing

- Verify random selection on page reload
- Verify fallback behavior if JSON fails
- Verify dark mode styling
- Verify responsive layout on mobile
