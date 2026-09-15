# Improve Explore search and phone cards

## Changes
- Make the Explore search bar submit reliably from the keyboard and a visible search action.
- Keep search text synchronized with the page URL so navigation and shared searches work correctly.
- Preserve live title suggestions and category filters.
- Reduce Explore poster-card dimensions on phones by using a tighter four-column grid, smaller gaps, and compact card labels.
- Keep larger tablet and desktop card layouts spacious and readable.

## Verification
- Search for a movie and TV title, open a result, and confirm navigation.
- Check the empty, loading, suggestion, and filtered-result states.
- Verify the Explore grid at 393px has no overflow or clipped text.
