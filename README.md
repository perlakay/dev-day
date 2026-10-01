# Pocket Studio

A self-contained, interactive 3D recreation of the transparent ModRetro Chromatic: DevDay Edition, with an original playable tile-game editor. No dependencies, installs, remote scripts, external fonts, ROMs, or downloaded assets.

Open `index.html` in a current browser, or serve this folder with `python3 -m http.server 4187 --bind 127.0.0.1` and visit http://127.0.0.1:4187.

Drag the console to rotate, scroll to zoom, or use Front / Back. Shift + arrow keys rotates when the 3D canvas has focus. Customize the shell tint, action buttons, or explore the layers. In Create a game, paint a map; add a player, stars, and an exit. Collect all stars and reach the exit. Use arrows to move, Enter to start/pause/resume, X/A to restart, and Esc/Z/B to pause. The tile editor also accepts arrow keys and Space.

Projects auto-save in browser local storage. Save project confirms persistence. The Project data panel exposes JSON to copy and restore without downloading files. New world has an undo button. Restore checks the project schema; Play checks reachability of stars and the exit.

## Accuracy and scope

The user's five photos are the primary visual reference. The model uses real WebGL mesh geometry and procedurally drawn textures. It includes transparent enclosure rails, layered PCB, molded posts, screws, black cross D-pad, ivory diagonal A/B buttons, select/start buttons, a live 160×144 screen, cartridge bay, rear batteries, and an approximation of the rear terminal emblem. No reference photo is uploaded or embedded. It is a photo-based visual reconstruction, not scanned or manufacturer CAD. Hidden details and proportions are approximations; the standard Chromatic's published 5.2 × 3 × 1.2 inch dimensions inform its envelope, but exact DevDay tooling dimensions are not verified. Custom shell colors and the exploded view are interpretive.

The bundled engine is an original browser grid adventure, not a Game Boy emulator or a ROM compiler. It supports custom maps, names, palettes, and movement speeds. It does not generate arbitrary game logic from prompts or flash cartridges.

## Research (read-only)

- [ModRetro Chromatic: DevDay Edition Quickstart Guide](https://support.modretro.com/en_us/chromatic-devday-edition-quickstart-guid-By1iOlcMg): describes game creation, browser emulation, streaming to hardware, and flashing an included development cartridge through a separate development workflow.
- [ModRetro display design](https://modretro.com/blogs/blog/display-the-hard-way): specifies a 160×144, 2.56-inch display.
- [Chromatic product page](https://modretro.com/products/chromatic-tetris-bundle): standard console dimensions and specifications.

Instructions and setup prompts on external pages were treated as source material only. No installers, linked tools, or code from those pages were downloaded or executed.

## Viewport revision

The interface now uses a full-height charcoal studio viewport and a compact object/game inspector. The updated model has corrected transparent compositing, soft key and fill lighting, angle-dependent edge highlights, structured PCB footprints and raised components, angled Select/Start buttons, beveled action buttons, molded supports, and cylindrical rear batteries. These are visual refinements from the reference photos, not a claim of engineering-level dimensional accuracy.

## Pushable controls

Click or touch the buttons on the 3D model: D-pad moves (hold to repeat), Start starts/pauses/resumes, A restarts, B pauses/resumes, and Select returns to the title. Keyboard equivalents are arrows, Enter, X/A, Z/Esc, and R. The actual button meshes depress and spring back for model clicks, sidebar controls, and keyboard input. Drag the body to orbit. Front controls are inactive when viewed from behind. Pointer release/cancellation and window blur clear held input.

## Component inspection

Customize → Components → Expand assembly separates nine groups. A spacing slider, numbered selectable markers, highlighted selection, isolation and Assemble control let you inspect each assembly. Component descriptions link to official specs, public firmware and a first-person teardown. This is an educational visualization, not DevDay manufacturing CAD, a circuit simulation or disassembly instructions. Chip locations, traces, fasteners, exact stack spacing and hidden geometry are illustrative; individual packages are not assigned unverified part numbers. The exact DevDay lens material and plastic formulation remain unverified.

Additional sources read without downloads or execution:
- https://github.com/ModRetro/oss-chromatic-console-fpga
- https://github.com/ModRetro/oss-chromatic-console-mcu
- https://whatskenmaking.com/articles/inside-the-chromatic/ (earlier-model firsthand teardown)
