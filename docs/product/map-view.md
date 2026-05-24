# Kartvy

**Status:** UI mock med OpenStreetMap + Leaflet

## Funktioner

- Zoom/pan (mus + scroll)
- Placera kameror genom att välja kamera → «Placera» → klick på karta
- Dra markörer för att flytta
- **Bildfält (FOV):** färgad sektor visar bäring, vinkel och räckvidd
- Justera bäring (0–359°), bildvinkel (20–120°), räckvidd (m), vy-beskrivning
- Sparas i `localStorage` (`smart-vms-map-placements`)

## Standard

Demo-centrum nära Stockholm — **pan/zoom till din adress** och placera om kameror.

## Chatt

«Öppna kartan», «visa kameror på karta»

## Larm på karta

- Prickar i kamerans bildfält (färg = allvar)
- Filter: 24 h / 48 h / 7 d
- Öppna larm: klicka prick eller lista «Larm på karta»
- Öppna larm pulserar om status = open

## Min plats

- Knapp **Min plats** — `navigator.geolocation`
- Blå prick + noggrannhetscirkel
- Kräver HTTPS eller localhost och tillstånd i webbläsaren

- `PUT /api/v1/sites/{id}/camera-placements`
- Satellit/lokal planlösning som alternativ tile layer
