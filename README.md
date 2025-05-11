# Nora Trello Clone

A kanban board application built with the MERN stack and GraphQL, featuring drag-and-drop functionality and responsive design.

## Features

- **Board Management**: Create, rename, and delete boards
- **List Management**: Create, rename, and delete lists within boards
- **Card Management**: Create, edit, and delete cards with titles and descriptions
- **Drag & Drop**: Move cards between lists and reorder them
- **Responsive Design**: 
  - Desktop view with horizontal scrolling lists
  - Mobile view with tab navigation or scrollable lists
  - Touch support for card management

## Tech Stack

### Frontend
- React with TypeScript
- Apollo Client for GraphQL
- Tailwind CSS
- Radix UI components
- Lucide React icons
- React Router

### Backend
- Node.js with Express
- GraphQL with Apollo Server
- MongoDB with Mongoose
- TypeScript

### Deployment
- MVP Demo is currrently deployed on Render https://mini-trello-clone-1.onrender.com/
- Consider to deploy backend with AWS in the future

## Current Progress
- Implemented task management
- Will optimize the drag-drop especially on the drag to the top
- Will add user login/logout

## Implementation Details

- Native Drag & Drop API instead of external libraries
- GraphQL mutations and queries for data operations
- Optimistic UI updates with Apollo Client
- Mobile-first responsive design with adaptive layouts
- Context-sensitive dropdown menus for item management
