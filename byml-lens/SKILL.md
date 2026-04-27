# BYML Lens Agent Skill

This skill enables AI agents to read, modify, and repackage Nintendo game assets (.byml, .bgyml, .pack, .zs) with production-grade stability and hardware compatibility.

## Capabilities
- **Perfect Decompile/Recompile**: Automated bidirectional conversion between binary and YAML. Supports Version 7 with high-precision 64-bit alignment.
- **Archive Management**: Unpack and Pack SARC archives with 256-byte file alignment and UTF-8 path support.
- **Smart Asset Surgery**: Injecting specific sub-files (bcett, RenderingDay, Ocean) into existing packs while maintaining binary integrity.

## Technical Standards (Anti-Crash)
1. **8-Byte Alignment**: When encoding BYML Version 7, all 64-bit values (Double, Long, ULong) MUST be aligned to an 8-byte boundary relative to the file start. Failing this causes crashes on real hardware and Ryujinx.
2. **256-Byte SARC Alignment**: Inside `.pack` files, data blocks for each file should be aligned to 256 bytes (0x100) for optimal memory mapping.
3. **UTF-8 Byte Hashing**: SARC filename hashes (SFAT) must be calculated from UTF-8 bytes, not UTF-16 character codes.
4. **Surgical Modding SOP**:
   - **Maps**: Replace `bcett.byml` for layout.
   - **Ocean**: Inject ocean parameters with their *original* names to satisfy `OceanRef` pointers in rendering configs.
   - **Sky/Atmosphere**: Swap `RenderingDay.bgyml` (excluding Boss/Cloudy variants) to sync lighting/skybox.
   - **Graffiti**: To remove graffiti cleanly, use `deyaml` -> set `GraffitiObjInfo` to `[]` -> `yaml2byml` with reference.

## CLI Usage Guidelines
- Always use `--reference` with `yaml2byml` to inherit correct versions and endianness.
- Use `-z` for Zstd compression and `-r` for SARC metadata inheritance to ensure game engine compatibility.
- Prefer binary surgery over full re-encoding for sensitive metadata-heavy files.
