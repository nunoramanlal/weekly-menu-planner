import { useState } from 'react';
import './App.css';

import Sidebar from './components/layout/Sidebar';
import MenusPage from './pages/MenusPage';
import CreateMenuPage from './pages/CreateMenuPage';
import DishesPage from './pages/DishesPage';
import CategoriesPage from './pages/CategoriesPage';

import type { Page } from './types/navigation';

function App() {
  const [page, setPage] = useState<Page>('menus');

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} />

      <main className="main">
        {page === 'menus' && (
          <MenusPage
            onCreateMenu={() => setPage('create-menu')}
          />
        )}

        {page === 'create-menu' && (
          <CreateMenuPage
            onCancel={() => setPage('menus')}
            onCreated={() => setPage('menus')}
          />
        )}

        {page === 'dishes' && <DishesPage />}

        {page === 'categories' && <CategoriesPage />}
      </main>
    </div>
  );
}

export default App;