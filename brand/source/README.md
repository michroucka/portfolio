# Zdroj loga

Logo „mr.“ je generované z písma Archivo (SIL OFL) skriptem `build_final.py`.

```bash
cd brand/source
python3 -m venv .venv && .venv/bin/pip install fonttools
mkdir -p fonts && curl -sSL -o fonts/Archivo.ttf "https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf"
.venv/bin/python build_final.py      # přepíše brand/logo/*.svg a brand/motion/*.svg
```

Barvy a geometrie (řez, velikost tečky) jsou nahoře v `build_final.py` (`VERSIONS`, konstanty barev).
Web ikony (`brand/web/`) se pak exportují z `brand/logo/mr-favicon.svg` (favicon.ico, PNG, manifest).
