#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

CONTENT_DIR="${CONTENT_DIR:-./content}"
MAX_WIDTH="${MAX_WIDTH:-3840}"
QUALITY="${QUALITY:-85}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

HAS_CONVERT=false
HAS_JPEGOPTIM=false
HAS_OPTIPNG=false

if command -v convert &> /dev/null || command -v magick &> /dev/null; then
    HAS_CONVERT=true
fi

if command -v jpegoptim &> /dev/null; then
    HAS_JPEGOPTIM=true
fi

if command -v optipng &> /dev/null; then
    HAS_OPTIPNG=true
fi

if [ "$HAS_CONVERT" = false ] && [ "$HAS_JPEGOPTIM" = false ]; then
    echo -e "${RED}Aucun outil d'optimisation trouvé.${NC}"
    echo "Installez au moins un des outils suivants :"
    echo "  sudo apt install imagemagick jpegoptim optipng"
    exit 1
fi

if [ ! -d "$CONTENT_DIR" ]; then
    echo -e "${RED}Dossier content introuvable : $CONTENT_DIR${NC}"
    exit 1
fi

CONVERT_CMD="convert"
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
fi

TOTAL=0
OPTIMIZED=0
SKIPPED=0
ERRORS=0
SAVED_BYTES=0

echo -e "${YELLOW}=== Optimisation des images ===${NC}"
echo "Dossier : $CONTENT_DIR"
echo "Qualité JPEG : $QUALITY%"
echo "Largeur max : ${MAX_WIDTH}px"
echo "Outils : ImageMagick=$HAS_CONVERT jpegoptim=$HAS_JPEGOPTIM optipng=$HAS_OPTIPNG"
echo ""

find "$CONTENT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -print0 | while IFS= read -r -d '' IMAGE; do
    TOTAL=$((TOTAL + 1))
    FILENAME="$(basename "$IMAGE")"
    DIR="$(dirname "$IMAGE")"

    MARKER="$DIR/.$FILENAME.img_optimized"
    if [ -f "$MARKER" ]; then
        echo -e "  ${YELLOW}SKIP${NC} $FILENAME (déjà optimisé)"
        SKIPPED=$((SKIPPED + 1))
        echo "$TOTAL $OPTIMIZED $SKIPPED $ERRORS $SAVED_BYTES" > /tmp/optimize_img_stats
        continue
    fi

    ORIGINAL_SIZE=$(stat -c%s "$IMAGE" 2>/dev/null || stat -f%z "$IMAGE" 2>/dev/null)
    ORIGINAL_SIZE_KB=$(awk "BEGIN {printf \"%.0f\", ${ORIGINAL_SIZE:-0} / 1024}")

    EXT_LOWER=$(echo "${FILENAME##*.}" | tr '[:upper:]' '[:lower:]')

    echo -ne "  ${YELLOW}TRAITEMENT${NC} $FILENAME (${ORIGINAL_SIZE_KB} Ko)..."

    SUCCESS=false

    if [ "$EXT_LOWER" = "jpg" ] || [ "$EXT_LOWER" = "jpeg" ]; then
        if [ "$HAS_CONVERT" = true ]; then
            CURRENT_WIDTH=$($CONVERT_CMD "$IMAGE" -format "%w" info: 2>/dev/null)

            if [ "${CURRENT_WIDTH:-0}" -gt "$MAX_WIDTH" ]; then
                $CONVERT_CMD "$IMAGE" \
                    -resize "${MAX_WIDTH}x>" \
                    -quality "$QUALITY" \
                    -sampling-factor 4:2:0 \
                    -strip \
                    -interlace JPEG \
                    "$IMAGE" 2>/dev/null
                SUCCESS=true
            else
                $CONVERT_CMD "$IMAGE" \
                    -quality "$QUALITY" \
                    -sampling-factor 4:2:0 \
                    -strip \
                    -interlace JPEG \
                    "$IMAGE" 2>/dev/null
                SUCCESS=true
            fi
        fi

        if [ "$HAS_JPEGOPTIM" = true ]; then
            jpegoptim --strip-all --max="$QUALITY" -q "$IMAGE" 2>/dev/null
            SUCCESS=true
        fi

    elif [ "$EXT_LOWER" = "png" ]; then
        if [ "$HAS_CONVERT" = true ]; then
            CURRENT_WIDTH=$($CONVERT_CMD "$IMAGE" -format "%w" info: 2>/dev/null)

            if [ "${CURRENT_WIDTH:-0}" -gt "$MAX_WIDTH" ]; then
                $CONVERT_CMD "$IMAGE" \
                    -resize "${MAX_WIDTH}x>" \
                    -strip \
                    "$IMAGE" 2>/dev/null
                SUCCESS=true
            else
                $CONVERT_CMD "$IMAGE" -strip "$IMAGE" 2>/dev/null
                SUCCESS=true
            fi
        fi

        if [ "$HAS_OPTIPNG" = true ]; then
            optipng -o2 -quiet "$IMAGE" 2>/dev/null
            SUCCESS=true
        fi

    elif [ "$EXT_LOWER" = "webp" ]; then
        if [ "$HAS_CONVERT" = true ]; then
            CURRENT_WIDTH=$($CONVERT_CMD "$IMAGE" -format "%w" info: 2>/dev/null)

            if [ "${CURRENT_WIDTH:-0}" -gt "$MAX_WIDTH" ]; then
                $CONVERT_CMD "$IMAGE" \
                    -resize "${MAX_WIDTH}x>" \
                    -quality "$QUALITY" \
                    -strip \
                    "$IMAGE" 2>/dev/null
                SUCCESS=true
            else
                $CONVERT_CMD "$IMAGE" \
                    -quality "$QUALITY" \
                    -strip \
                    "$IMAGE" 2>/dev/null
                SUCCESS=true
            fi
        fi
    fi

    if [ "$SUCCESS" = true ]; then
        NEW_SIZE=$(stat -c%s "$IMAGE" 2>/dev/null || stat -f%z "$IMAGE" 2>/dev/null)
        NEW_SIZE_KB=$(awk "BEGIN {printf \"%.0f\", ${NEW_SIZE:-0} / 1024}")

        if [ "${NEW_SIZE:-0}" -lt "${ORIGINAL_SIZE:-0}" ]; then
            REDUCTION=$(awk "BEGIN {printf \"%.0f\", (1 - ${NEW_SIZE:-0} / ${ORIGINAL_SIZE:-1}) * 100}")
            SAVED=$((${ORIGINAL_SIZE:-0} - ${NEW_SIZE:-0}))
            SAVED_BYTES=$(($SAVED_BYTES + $SAVED))
            OPTIMIZED=$((OPTIMIZED + 1))
            echo -e " ${GREEN}OK${NC} ${ORIGINAL_SIZE_KB} Ko -> ${NEW_SIZE_KB} Ko (-${REDUCTION}%)"
        else
            SKIPPED=$((SKIPPED + 1))
            echo -e " ${GREEN}OK${NC} Déjà optimale"
        fi
        touch "$MARKER"
    else
        ERRORS=$((ERRORS + 1))
        echo -e " ${RED}ERREUR${NC}"
    fi

    echo "$TOTAL $OPTIMIZED $SKIPPED $ERRORS $SAVED_BYTES" > /tmp/optimize_img_stats

done

if [ -f /tmp/optimize_img_stats ]; then
    read TOTAL OPTIMIZED SKIPPED ERRORS SAVED_BYTES < /tmp/optimize_img_stats
    rm -f /tmp/optimize_img_stats
fi

SAVED_MB=$(awk "BEGIN {printf \"%.1f\", ${SAVED_BYTES:-0} / 1048576}")

echo ""
echo -e "${YELLOW}=== Résultat ===${NC}"
echo "Images trouvées : $TOTAL"
echo -e "Optimisées : ${GREEN}$OPTIMIZED${NC}"
echo "Ignorées : $SKIPPED"
if [ "${ERRORS:-0}" -gt 0 ]; then
    echo -e "Erreurs : ${RED}$ERRORS${NC}"
fi
echo -e "Espace économisé : ${GREEN}${SAVED_MB} Mo${NC}"
