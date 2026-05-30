# Ferme Manager - Frontend

Interface Angular pour la gestion d'élevage.

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
- **Dashboard** : Tableau de bord
- **Animaux** : Gestion des animaux
- **Santé** : Suivi sanitaire
- **Stock** : Gestion du stock
- **Ventes** : Gestion des ventes
- **Finances** : Gestion financière

## Configuration
Modifier l'URL du backend dans `src/environments/environment.ts` :
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api'
};
```