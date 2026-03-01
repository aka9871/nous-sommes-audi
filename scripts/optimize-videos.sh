#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

CONTENT_DIR="${CONTENT_DIR:-./content}"
CRF="${CRF:-23}"
PRESET="${PRESET:-slow}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}FFmpeg n'est pas installé.${NC}"
    echo "Installez-le avec : sudo apt install ffmpeg"
    exit 1
fi

if [ ! -d "$CONTENT_DIR" ]; then
    echo -e "${RED}Dossier content introuvable : $CONTENT_DIR${NC}"
    exit 1
fi

TOTAL=0
OPTIMIZED=0
SKIPPED=0
ERRORS=0
SAVED_BYTES=0

echo -e "${YELLOW}=== Optimisation des vidéos ===${NC}"
echo "Dossier : $CONTENT_DIR"
echo "Qualité CRF : $CRF (plus bas = meilleure qualité, 18-28 recommandé)"
echo "Preset : $PRESET"
echo ""

find "$CONTENT_DIR" -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.avi" -o -iname "*.webm" -o -iname "*.mkv" -o -iname "*.m4v" \) -print0 | while IFS= read -r -d '' VIDEO; do
    TOTAL=$((TOTAL + 1))
    FILENAME="$(basename "$VIDEO")"
    DIR="$(dirname "$VIDEO")"

    MARKER="$DIR/.$FILENAME.optimized"
    if [ -f "$MARKER" ]; then
        echo -e "  ${YELLOW}SKIP${NC} $FILENAME (déjà optimisé)"
        SKIPPED=$((SKIPPED + 1))
        echo "$TOTAL $OPTIMIZED $SKIPPED $ERRORS $SAVED_BYTES" > /tmp/optimize_stats
        continue
    fi

    ORIGINAL_SIZE=$(stat -c%s "$VIDEO" 2>/dev/null || stat -f%z "$VIDEO" 2>/dev/null)
    ORIGINAL_SIZE_MB=$(awk "BEGIN {printf \"%.1f\", ${ORIGINAL_SIZE:-0} / 1048576}")

    echo -e "  ${YELLOW}TRAITEMENT${NC} $FILENAME (${ORIGINAL_SIZE_MB} Mo)..."

    NAMENOEXT="${FILENAME%.*}"
    TEMP_FILE="$DIR/.tmp_optimized_${NAMENOEXT}.mp4"

    ffmpeg -nostdin -i "$VIDEO" \
        -map 0:v:0 -map 0:a? \
        -c:v libx264 \
        -crf "$CRF" \
        -preset "$PRESET" \
        -pix_fmt yuv420p \
        -movflags +faststart \
        -c:a aac -b:a 128k \
        -max_muxing_queue_size 1024 \
        -y \
        -loglevel warning \
        "$TEMP_FILE" </dev/null 2>&1

    FFMPEG_EXIT=$?

    if [ $FFMPEG_EXIT -eq 0 ] && [ -f "$TEMP_FILE" ]; then
        NEW_SIZE=$(stat -c%s "$TEMP_FILE" 2>/dev/null || stat -f%z "$TEMP_FILE" 2>/dev/null)
        NEW_SIZE_MB=$(awk "BEGIN {printf \"%.1f\", ${NEW_SIZE:-0} / 1048576}")

        if [ "${NEW_SIZE:-0}" -lt "${ORIGINAL_SIZE:-0}" ]; then
            REDUCTION=$(awk "BEGIN {printf \"%.0f\", (1 - ${NEW_SIZE:-0} / ${ORIGINAL_SIZE:-1}) * 100}")
            SAVED=$((${ORIGINAL_SIZE:-0} - ${NEW_SIZE:-0}))
            SAVED_BYTES=$(($SAVED_BYTES + $SAVED))

            EXT_ORIG="${FILENAME##*.}"
            EXT_LOWER=$(echo "$EXT_ORIG" | tr '[:upper:]' '[:lower:]')

            if [ "$EXT_LOWER" = "mp4" ]; then
                mv "$TEMP_FILE" "$VIDEO"
            else
                mv "$TEMP_FILE" "$DIR/${NAMENOEXT}.mp4"
                rm -f "$VIDEO"
            fi

            touch "$MARKER"

            echo -e "  ${GREEN}OK${NC} ${ORIGINAL_SIZE_MB} Mo -> ${NEW_SIZE_MB} Mo (-${REDUCTION}%)"
            OPTIMIZED=$((OPTIMIZED + 1))
        else
            rm -f "$TEMP_FILE"
            touch "$MARKER"
            echo -e "  ${GREEN}OK${NC} Déjà optimale, pas de changement"
            SKIPPED=$((SKIPPED + 1))
        fi
    else
        rm -f "$TEMP_FILE"
        echo -e "  ${RED}ERREUR${NC} Impossible de traiter $FILENAME (code: $FFMPEG_EXIT)"
        ERRORS=$((ERRORS + 1))
    fi

    echo "$TOTAL $OPTIMIZED $SKIPPED $ERRORS $SAVED_BYTES" > /tmp/optimize_stats

done

if [ -f /tmp/optimize_stats ]; then
    read TOTAL OPTIMIZED SKIPPED ERRORS SAVED_BYTES < /tmp/optimize_stats
    rm -f /tmp/optimize_stats
fi

SAVED_MB=$(awk "BEGIN {printf \"%.1f\", ${SAVED_BYTES:-0} / 1048576}")

echo ""
echo -e "${YELLOW}=== Résultat ===${NC}"
echo "Vidéos trouvées : $TOTAL"
echo -e "Optimisées : ${GREEN}$OPTIMIZED${NC}"
echo "Ignorées : $SKIPPED"
if [ "${ERRORS:-0}" -gt 0 ]; then
    echo -e "Erreurs : ${RED}$ERRORS${NC}"
fi
echo -e "Espace économisé : ${GREEN}${SAVED_MB} Mo${NC}"
