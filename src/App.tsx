import React from 'react';
import './App.css'
import FamilyTree from './components/FamilyTree'

const App: React.FC = () => {
  return (
    <div className="min-h-screen h-screen bg-gray-100">
      <FamilyTree />
    </div>
  );
};

export default App;