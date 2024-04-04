# T6-Noodle (PoC)

Anwesenheitskontrolle per Studi-Ausweis | Studierendenprojekt der DHBW des Studiengangs 'Onlinemedien'. Jahrgang ON22.

## Hauptfunktionen

- Registrierung von Studierenden und Dozierenden via QR-Code
- Anwesenheit von Studierenden via NFC erfassen
- Keine Speicherung von personenbezogenen Daten in der Datenbank
- Anwesenheitsliste in Tabelle ausgeben und kontrollieren
- Speicherung des FileHandlers in der IndexedDB

## Nutzen

Die manuellen Papierlisten zur Erfassung der Anwesenheiten können durch Noodle gänzlich abgeschafft werden.

## Themen von besonderem Interesse

- NFC
- Kamera + QR-Codes
- lokales Dateisystem
- IndexedDB
- Geolocation

## Funktionale Schwachstellen

- Ist der NFC-Scan einmal aktiviert, so bleibt dieser innerhalb der kompletten Session aktiv. Dies kann durch einen zusätzlichen AbortController gelöst werden. In der Kontroll-Funktion für Dozierende wurde dies bereits umgesetzt.

```javascript
controller = new AbortController();
controller.abort();
```

- Bei der Registrierung von Dozierenden werden die zu unterrichtenden Kurse angezeigt und via Checkboxen auswählbar gemacht. Allerdings werden diese Infos nicht weiter verarbeitet. In Zukunft sollte eine Verarbeitung dieser Daten implementiert werden, da Dozierende beim Erfassen der Anwesenheiten somit auf Ihre eigenen Kurse beschränkt sind und nicht für alle Kurse Daten erfassen können.
- Die technischen Grundlagen für den Export der Anwesenheitsliste wurde bereits geschaffen, allerdings noch nicht vollständig implementiert.
- Auch wurden die Grundlagen für das Hochladen und Verarbeiten von QR-Codes geschaffen. Die vollständige Implementierung ist jedoch noch nicht abgeschlossen.
- Einige Features wie WebNFC sind auf iOS derzeit nicht verfügbar. Es ist jedoch zu erwarten, dass diese Features durch Browser mit eigener Engine (kein Apple WebKit) auch auf iOS zeitnah zur Verfügung stehen.
- Aus zeitlichen Gründen wurden keine Unit-Tests durchgeführt.

## Benötigte Zugangsdaten

- Das benötigte Master-Passwort, um sich in der Sekretariatsrolle registrieren zu können:

```bash
)bs!j-uXdl;x1G[
```

## Benötigte Datei

- Bei der Verifizierung von neuen Studierenden durch das Sekretariat wird eine leere .json Datei auf dem Testgerät benötigt, welche die Sekretariatsrolle einnimmt. Diese Datei muss dann beim ersten Scan eines QR-Codes angeben werden. Diese JSON-Datei sollte vorab angelegt werden.

## Benötigte Geräte

- Android Gerät mit NFC-Unterstützung

  (Funktionstest: https://whatpwacando.today/nfc)

  Zum Testen von Noodle empfiehlt sich ein Android-Gerät mit NFC-Funktion. Sonst kann die Registrierung der Studierenden sowie der Scan-Vogang durch Dozierende nicht vollständig getestet werden.

- Weiteres Testgerät
  Kann ein PC (Windows/Mac/Linux), Tablet (Android/iOS) oder Smartphone (Android/iOS) sein. Eine Webcam bzw. eingebaute Kamera sollte verfügbar sein (Scan von QR-Codes). Es kann bei älteren Modellen oder älteren Betriebssystemen zu Komplikationen kommen.

## Update der PWA

Wurde ein neuer Build an die Firebase deployed, kann die installierte App durch das Aufrufen der Seite im Internetbrowser automatisch aktualisieren.

# Installation

## Alle notwendigen Pakete beziehen & installieren

### Installation des Quasar CLI

```bash
npm i -g @quasar/cli
```

### Installation der benötigten Packages

```bash
npm install
```

### Start the App im development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Build der App für das Ausspielen

```bash
quasar build -m pwa
```

### Deploy an Firbase

```bash
firebase deploy
```

Hinweis: Für den Deploy muss ein Firebase-Account vorliegen, die Firebase CLI muss installiert sein und die Konfiguration im Programmcode (firebase.js) muss angepasst werden.

Noodle läuft im dev mode standardmäßig auf localhost:9000.
Die Live-Anwendung ist auf https://noodle-t6.web.app erreichbar.

# Vorgeschlagene Teststrategie

## 1. Anlegen einer Sekretariat-Rolle

Auf einem Gerät mit Kamera sollte zunächst ein Nutzer für die Sekretariats-Rolle mit Hilfe der Registrierung auf https://noodle-t6.web.app/registration angelegt werden. Anschließend sollte auf diesem gerät eine Anmeldung für diese Rolle erfolgen.

## 2. Anlegen von mindestens zwei Studierenden-Rollen

Auf einem Gerät mit NFC-Unterstützung sollten mindestens zwei Studierende auf der Seite https://noodle-t6.web.app/registration registriert werden.

Dazu wird mit der ersten Rolle begonnen. Am Ende der Registrierung muss der QR-Code von dem zweiten Gerät mit Kamera und angemeldeter Sekretariatsrolle eingescannt und verifiziert werden. Danach kann der Vorgang für eine neue Rolle wiederholt werden.

## 3. Anlegen eines Dozierenden

Anlegen eines Dozierenden analog wie das der Studierenden, nur dass nun kein NFC-Tag eingescannt werden muss. Eine Verifikation durch das Sekretariat muss am Schluss erfolgen.

## 4. Anmelden des Dozierenden

Die neue Dozierendenrolle wird auf dem gerät mit NFC-Funktion angemeldet. Nun kann der Scann der Studierendenausweise vorgenommen werden.

## 5. Kontrolle der Anwesenheitsliste

In der Sekretariatsrolle kann nun auf die Anwesenheitskontrolle gewechselt werden. Dort können dann die Anwesenheitslisten kontrolliert werden.
