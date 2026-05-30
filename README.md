# Ferme Manager - Frontend

Interface de gestion d'élevage développée dans le cadre du projet de fin d'année à l'Institut Universitaire Saint Jean 2025-2026.

## Description
Ferme Manager est une application web permettant de gérer efficacement un élevage. Elle offre une interface intuitive pour suivre les animaux, leur santé, les stocks, les ventes et les finances de la ferme.

## Technologies
- Angular 17
- Bootstrap 5
- Bootstrap Icons
- JWT Authentication

## Installation
```bash
npm install
npm start
```

## Accès
- **Application** : http://localhost:4200

## Modules
- **Dashboard** : Vue d'ensemble de la ferme
- **Animaux** : Gestion et suivi des animaux
- **Santé** : Suivi sanitaire et vaccinations
- **Stock** : Gestion des stocks et mouvements
- **Ventes** : Enregistrement et suivi des ventes
- **Finances** : Gestion des dépenses et revenus

## Configuration
Modifier l'URL du backend dans `src/environments/environment.ts` :
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api'
};
```