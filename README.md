# @vibzart/sri-yantra

Mathematically precise Sri Yantra SVG generator. Every marma point a true triple intersection. Every stroke from the shastras.

```
npm install @vibzart/sri-yantra
```

## What is the Sri Yantra?

The Sri Yantra (श्री यन्त्र) is the most revered yantra in the Sri Vidya tradition — the geometric dwelling of Goddess Lalita Tripurasundari. Its exact structure is described in **Soundarya Lahari, Verse 11** by Adi Shankaracharya (~8th century CE):

> चतुर्भिः श्रीकण्ठैः शिवयुवतिभिः पञ्चभिरपि
> प्रभिन्नाभिः शम्भोर्नवभिरपि मूलप्रकृतिभिः ।
> चतुश्चत्वारिंशद्वसुदलकलाश्चत्रिवलय-
> त्रिरेखाभिः सार्धं तव शरणकोणाः परिणताः ॥ ११ ॥
>
> *"By four Shrikanthas (Shiva triangles), by five Shiva-consorts (Shakti triangles), nine root-natures in all, pierced by Shambhu (the Bindu) — forty-three angles of Your dwelling are evolved, along with eight and sixteen petals, three circles, and three lines."*

This library generates the Sri Yantra **programmatically** from verified mathematical coordinates — not from approximation, not from tracing, but from the geometry itself.

## Usage

### As a library

```typescript
import { generateSriYantra, generateMinimalMark } from '@vibzart/sri-yantra'

// Full Sri Yantra — all 9 avaranas
const fullSvg = generateSriYantra({
  size: 1024,
  color: '#C9501C',
})

// Minimal mark — innermost triangles + bindu (for favicons, icons)
const miniSvg = generateMinimalMark({
  size: 64,
  color: '#C9501C',
})

// Dual-color: Shiva in brown, Shakti in saffron, bindu in gold
const dualSvg = generateSriYantra({
  shivaColor: '#1A0F0A',
  shaktiColor: '#C9501C',
  binduColor: '#D4A843',
})

// Triangles only (no lotuses, no bhupura)
const coreSvg = generateSriYantra({
  bhupura: false,
  sixteenPetalLotus: false,
  eightPetalLotus: false,
})

// Access raw geometry
import { computeGeometry, NINE_AVARANAS } from '@vibzart/sri-yantra'

const geo = computeGeometry()
console.log(geo.triangles) // All 9 triangles with coordinates
console.log(NINE_AVARANAS) // Sanskrit names and meanings
```

### CLI

```bash
# Full yantra in saffron
npx @vibzart/sri-yantra -o sri-yantra.svg

# Minimal mark for favicon
npx @vibzart/sri-yantra --minimal --size 64 -o favicon.svg

# Dual-color
npx @vibzart/sri-yantra --shiva-color "#1A0F0A" --shakti-color "#C9501C" -o dual.svg

# On cream background
npx @vibzart/sri-yantra --background "#FDF8F0" -o on-cream.svg

# Triangles only
npx @vibzart/sri-yantra --no-bhupura --no-lotus -o core.svg

# Filled triangles
npx @vibzart/sri-yantra --filled --fill-opacity 0.15 -o filled.svg
```

Run `npx @vibzart/sri-yantra --help` for all options.

## The Nine Avaranas

The Sri Yantra comprises nine concentric enclosures (avaranas), from outermost to innermost:

| # | Sanskrit | Transliteration | Meaning | Form |
|---|----------|----------------|---------|------|
| 1 | त्रैलोक्य मोहन चक्र | Trailokya Mohana | Enchanter of the Three Worlds | Bhupura (3 nested squares) |
| 2 | सर्वाशापरिपूरक चक्र | Sarvashaparipuraka | Fulfiller of All Desires | 16-petalled lotus |
| 3 | सर्वसंक्षोभण चक्र | Sarvasankshobhana | Agitator of All | 8-petalled lotus |
| 4 | सर्वसौभाग्यदायक चक्र | Sarvasaubhagyadayaka | Bestower of All Fortune | 14 outer triangles |
| 5 | सर्वार्थसाधक चक्र | Sarvarthasadhaka | Accomplisher of All Purposes | 10 outer triangles |
| 6 | सर्वरक्षाकर चक्र | Sarvarakshakara | Protector of All | 10 inner triangles |
| 7 | सर्वरोगहर चक्र | Sarvarogahara | Remover of All Afflictions | 8 triangles |
| 8 | सर्वसिद्धिप्रद चक्र | Sarvasiddhiprada | Bestower of All Attainments | Central triangle |
| 9 | सर्वानन्दमय चक्र | Sarvanandamaya | Full of All Bliss | Bindu (the point) |

## The Nine Triangles

Four upward triangles (Shiva / श्रीकण्ठ) and five downward triangles (Shakti / शिवयुवती):

| Triangle | Direction | Tattva | Rule |
|----------|-----------|--------|------|
| **U1** | ↑ Upward (largest) | Shiva | All 3 vertices touch outer circle |
| **U2** | ↑ Upward | Shiva | Apex touches base of D3 |
| **U3** | ↑ Upward | Shiva | Fully enclosed |
| **U4** | ↑ Upward (smallest) | Shiva | Apex touches base of D5 |
| **D1** | ↓ Downward (largest) | Shakti | All 3 vertices touch outer circle |
| **D2** | ↓ Downward | Shakti | Apex touches base of U1 |
| **D3** | ↓ Downward | Shakti | Fully enclosed |
| **D4** | ↓ Downward | Shakti | Fully enclosed |
| **D5** | ↓ Downward (smallest) | Shakti | Forms innermost triangle around Bindu |

Together they form **43 sub-triangles** with **18 marma sthanas** (triple intersection points where exactly three lines meet).

## Construction Method

This library uses **Type III (mathematically rigid)** coordinates derived from systems of linear and circular equations. The construction ensures:

- All 18 marma points are true triple intersections (tri-rekha sangama)
- No extraneous sub-triangles from misaligned intersections
- The innermost triangle approaches equilateral (60° apex)
- The bindu sits at the geometric center of the innermost triangle
- All vertices of U1 and D1 lie exactly on the outer circle

## API Reference

### `generateSriYantra(options?)`

Generates a complete Sri Yantra SVG string.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `size` | `number` | `512` | Output size in pixels |
| `color` | `string` | `'#C9501C'` | Primary stroke color |
| `shivaColor` | `string` | `color` | Upward triangle color |
| `shaktiColor` | `string` | `color` | Downward triangle color |
| `binduColor` | `string` | `color` | Bindu color |
| `background` | `string` | `'none'` | Background color |
| `strokeWidth` | `number` | `0.004` | Stroke width (relative to size) |
| `binduRadius` | `number` | `0.008` | Bindu radius (relative to size) |
| `outerCircle` | `boolean` | `true` | Include outer circle |
| `sixteenPetalLotus` | `boolean` | `true` | Include 16-petal lotus |
| `eightPetalLotus` | `boolean` | `true` | Include 8-petal lotus |
| `bhupura` | `boolean` | `true` | Include outer square frame |
| `bindu` | `boolean` | `true` | Include bindu point |
| `filled` | `boolean` | `false` | Fill triangles with color |
| `fillOpacity` | `number` | `0.1` | Fill opacity |

### `generateMinimalMark(options?)`

Generates the minimal mark — innermost Shiva-Shakti interlock (U4 + D5) and bindu.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `size` | `number` | `512` | Output size in pixels |
| `color` | `string` | `'#C9501C'` | Primary color |
| `shivaColor` | `string` | `color` | Upward triangle color |
| `shaktiColor` | `string` | `color` | Downward triangle color |
| `binduColor` | `string` | `color` | Bindu color |
| `background` | `string` | `'none'` | Background color |
| `strokeWidth` | `number` | `0.006` | Stroke width |
| `binduRadius` | `number` | `0.015` | Bindu radius |
| `enclosingCircle` | `boolean` | `false` | Add enclosing circle |
| `filled` | `boolean` | `false` | Fill triangles |
| `fillOpacity` | `number` | `0.1` | Fill opacity |

### `computeGeometry()`

Returns the raw geometry (normalized coordinates in [0,1] space).

### `getMinimalGeometry()`

Returns geometry for only the innermost triangles (U4 + D5).

### `NINE_AVARANAS`

Array of the nine avaranas with Sanskrit names, transliterations, and meanings.

## Shastra References

- **Soundarya Lahari** — Adi Shankaracharya (~8th century CE), Verse 11
- **Sri Vidya Ratna Sutram** — Cryptic sutra encoding Sri Yantra structure
- **Lalita Sahasranama** — Names of the Goddess corresponding to yantra elements
- **Tripura Rahasya** — Philosophy of the Sri Vidya tradition
- **Yogini Tantra**, **Kularnava Tantra**, **Tantrasara** — Ritual and construction details

## Mathematical References

- [Sri Yantra Geometry — sriyantraresearch.com](https://www.sriyantraresearch.com/)
- [The Optimal Sri Yantra](https://sriyantraresearch.com/Optimal/optimal_sri_yantra.htm)
- [Geometry of Sri Chakra — Anantaa Journal (2023)](https://www.anantaajournal.com/archives/2023/vol9issue6/PartD/9-6-39-715.pdf)
- [Type III Construction — TeXample.net](https://texample.net/sri-yantra/)
- [GeoGebra Construction — artbody/sri_yantra](https://github.com/artbody/sri_yantra)

## Creating a New Release

This project uses a Makefile for local release prep and GitHub Actions for publishing.

### Release commands

```bash
make release-patch   # 0.2.0 → 0.2.1  (bug fixes)
make release-minor   # 0.2.0 → 0.3.0  (new features)
make release-major   # 0.2.0 → 1.0.0  (breaking changes)
```

Each command will:
1. Bump the version in `package.json`
2. Build and lint the project
3. Regenerate all output SVGs
4. Commit with message `release: v<version>` and push to `main`

GitHub Actions then automatically:
1. Creates a git tag (`v0.2.1`)
2. Creates a GitHub Release with auto-generated notes
3. Publishes `@vibzart/sri-yantra@0.2.1` to npm with provenance

### Other Makefile targets

```bash
make build      # Compile TypeScript
make lint       # Type-check without emitting
make generate   # Regenerate all output SVGs
make clean      # Remove dist/
```

## License

MIT — Sacred knowledge should be freely computable.

विद्या दानं सर्व दानं प्रधानम् — *The gift of knowledge is the greatest of all gifts.*

Built by [Vibz.Art](https://vibz.art) — Ancient Wisdom. Modern Code.
