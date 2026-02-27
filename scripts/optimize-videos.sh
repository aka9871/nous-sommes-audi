#!/bin/bash

CONTENT_DIR="${CONTENT_DIR:-./content}"
CRF="${CRF:-23}"
PRESET="${PRESET:-slow}"
LOG_FILE="optimize-videos.log"

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
SAVED_BYTES=0

echo -e "${YELLOW}=== Optimisation des vidéos ===${NC}"
echo "Dossier : $CONTENT_DIR"
echo "Qualité CRF : $CRF (plus bas = meilleure qualité, 18-28 recommandé)"
echo "Preset : $PRESET"
echo ""

while IFS= read -r -d '' VIDEO; do
    TOTAL=$((TOTAL + 1))
    FILENAME=$(basename "$VIDEO")
    DIR=$(dirname "$VIDEO")

    MARKER="$DIR/.$FILENAME.optimized"
    if [ -f "$MARKER" ]; then
        echo -e "  ${YELLOW}SKIP${NC} $VIDEO (déjà optimisé)"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    ORIGINAL_SIZE=$(stat -c%s "$VIDEO" 2>/dev/null || stat -f%z "$VIDEO" 2>/dev/null)
    ORIGINAL_SIZE_MB=$(echo "scale=1; $ORIGINAL_SIZE / 1048576" | bc)

    echo -e "  ${YELLOW}TRAITEMENT${NC} $VIDEO (${ORIGINAL_SIZE_MB} Mo)..."

    TEMP_FILE="$DIR/.tmp_optimized_$FILENAME"

    ffmpeg -i "$VIDEO" \
        -c:v libx264 \
        -crf "$CRF" \
        -preset "$PRESET" \
        -movflags +faststart \
        -c:a aac -b:a 128k \
        -y \
        -loglevel warning \
        "$TEMP_FILE" 2>&1

    if [ $? -eq 0 ] && [ -f "$TEMP_FILE" ]; then
        NEW_SIZE=$(stat -c%s "$TEMP_FILE" 2>/dev/null || stat -f%z "$TEMP_FILE" 2>/dev/null)
        NEW_SIZE_MB=$(echo "scale=1; $NEW_SIZE / 1048576" | bc)

        if [ "$NEW_SIZE" -lt "$ORIGINAL_SIZE" ]; then
            REDUCTION=$(echo "scale=0; (1 - $NEW_SIZE / $ORIGINAL_SIZE) * 100" | bc)
            SAVED=$(($ORIGINAL_SIZE - $NEW_SIZE))
            SAVED_BYTES=$(($SAVED_BYTES + $SAVED))

            mv "$TEMP_FILE" "$VIDEO"
            touch "$MARKER"

            echo -e "  ${GREEN}OK${NC} ${ORIGINAL_SIZE_MB} Mo → ${NEW_SIZE_MB} Mo (-${REDUCTION}%)"
            OPTIMIZED=$((OPTIMIZED + 1))
        else
            rm -f "$TEMP_FILE"
            touch "$MARKER"
            echo -e "  ${GREEN}OK${NC} Déjà optimale, pas de changement"
            SKIPPED=$((SKIPPED + 1))
        fi
    else
        rm -f "$TEMP_FILE"
        echo -e "  ${RED}ERREUR${NC} Impossible de traiter $VIDEO"
    fi

done < <(find "$CONTENT_DIR" -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.avi" -o -iname "*.webm" \) -print0)

SAVED_MB=$(echo "scale=1; $SAVED_BYTES / 1048576" | bc)

echo ""
echo -e "${YELLOW}=== Résultat ===${NC}"
echo "Vidéos trouvées : $TOTAL"
echo "Optimisées : $OPTIMIZED"
echo "Ignorées : $SKIPPED"
echo -e "Espace économisé : ${GREEN}${SAVED_MB} Mo${NC}"
echo ""
echo "Pour re-optimiser une vidéo déjà traitée, supprimez le fichier marqueur :"
echo "  rm $CONTENT_DIR/.nom-video.mp4.optimized"
