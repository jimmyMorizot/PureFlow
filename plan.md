# Plan du projet

## 1. Architecture
- **Framework** : React 19+ (via Vite)
- **Langage** : TypeScript 5+
- **Styling** : Tailwind CSS + Shadcn/ui
- **Routing** : React Router v6/v7
- **State Management** : Zustand (pour les préférences, le mode famille, le comparateur)
- **Data Fetching** : TanStack Query (React Query) pour la gestion du cache et des états de chargement API
- **PWA** : Vite PWA Plugin
- **Export** : html2canvas + jspdf (pour la génération de rapports PDF)

## 2. Fonctionnalités

### 2.1 Géolocalisation & Recherche (Module `search`)
- **Description** : Détection automatique de la position de l'utilisateur ou recherche manuelle par nom de commune/code postal.
- **Composants** : `LocationRequest`, `SearchBar`, `CitySuggestions`.
- **API** :
    - API Géo Gouvernement (`/communes`) pour l'autocomplétion et la récupération du code INSEE.
    - API Navigateur `navigator.geolocation`.

### 2.2 Dashboard Qualité de l'Eau (Module `dashboard`)
- **Description** : Affichage des résultats pour une commune sélectionnée.
- **Composants** : `QualityScore` (Jauge globale), `ParameterCard` (Détail pH, Nitrates, etc.), `QualityBadge` (Indicateur simple).
- **API** : Hub'Eau Qualité Eau Potable (`/qualite_eau_potable`).

### 2.3 Mode Famille (Module `family-mode`)
- **Description** : Interface simplifiée avec explications vulgarisées et codes couleurs/icônes.
- **Composants** : `FamilyToggle`, `SimpleExplanation`, `KidFriendlyStatus`.
- **Logique** : Bascule globale via Context/Store qui transforme l'affichage des `ParameterCard`.

### 2.4 Comparateur (Module `compare`)
- **Description** : Comparaison côte à côte de 2 ou 3 communes.
- **Composants** : `ComparisonView`, `CityColumn`.
- **Logique** : Sélection multiple de communes, affichage en grille.

### 2.5 Alertes & Seuils (Module `alerts`)
- **Description** : Configuration de seuils personnalisés (ex: Nitrates > 50mg/L) et notifications visuelles.
- **Composants** : `AlertSettings`, `NotificationBanner`.
- **Stockage** : `localStorage` pour la persistance des préférences.

### 2.6 Export & PWA (Module `export`)
- **Description** : Génération d'un rapport PDF de la qualité de l'eau et installation PWA.
- **Composants** : `ExportButton`, `InstallPWAButton`.
- **Lib** : `jspdf`, `vite-plugin-pwa`.

## 3. Dépendances Clés
- `react`, `react-dom`
- `react-router-dom`
- `zustand`
- `@tanstack/react-query`
- `lucide-react`
- `clsx`, `tailwind-merge` (utils Shadcn)
- `class-variance-authority`
- `date-fns` (formatage dates)
- `jspdf`, `html2canvas`
- `vite-plugin-pwa`
