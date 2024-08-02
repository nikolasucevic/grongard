import React, { useEffect, useState } from 'react';
import GronGardPlatform from './grongardplatform.js';
import './AppWrapper.css';

function AppWrapper() {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
      localStorage.removeItem('userType');
    }
  }, []);

  const getUserTypeDisplay = () => {
    if (userType === 'customer') {
      return 'Kund';
    } else if (userType === 'provider') {
      return 'Leverantör';
    }
    return '';
  };

  return (
    <div className="app-wrapper">
      <header>
        <nav>
          <div className="logo">
            <h1><span>Grön</span>Gård</h1>
          </div>
          <div className={`user-type-display ${userType}`}>
            {getUserTypeDisplay()}
          </div>
        </nav>
      </header>
      <main>
        <GronGardPlatform userType={userType} />
      </main>
      <footer>
        <p>&copy; 2024 GrönGård AB. Alla rättigheter förbehållna.</p>
      </footer>
    </div>
  );
}

export default AppWrapper;