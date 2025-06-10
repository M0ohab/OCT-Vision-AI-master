import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useLanguageStore } from './store/languageStore';
import Navbar from './components/Navbar';
import Routes from './Routes';

function App() {
  const { language } = useLanguageStore();

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes />
      </div>
    </BrowserRouter>
  );
}

export default App;