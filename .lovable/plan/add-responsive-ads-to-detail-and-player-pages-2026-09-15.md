# Add responsive ads to detail and player pages

## Changes
- Add a reusable 468×60 ad unit using the supplied ad key and script, isolated so multiple placements load reliably.
- Scale the banner proportionally on narrow phones instead of clipping or overflowing it.
- Place the banner at the top of the movie details page and directly above the player on movie and TV watch pages.
- Place the existing supplied native ad above the Watch Now/download buttons on movie details.
- Place the native ad below the title and above recommendation or episode cards on movie and TV watch pages.

## Technical details
- Reuse the existing native-ad component, which already loads `abc2c7fde6d68fc96757765c351d9dfc`.
- Render the new `5551e426f8b9593102b2e9e6faea702c` iframe ad in an isolated document and resize its 468×60 canvas based on available width.
- Preserve all current player, source, download, and episode behavior.

## Verification
- Confirm the app builds without errors.
- Check movie details, movie player, and TV episode player at phone width for correct placement and no horizontal overflow.
