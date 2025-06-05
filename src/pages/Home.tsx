import { Link } from 'react-router-dom';
import { Brain, Shield, Activity } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';

export default function Home() {
  const { translate } = useLanguageStore();
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {translate('heroTitle')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {translate('heroSubtitle')}
        </p>
        <Link
          to="/signup"
          className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {translate('getStarted')}
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Brain className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{translate('feature1Title')}</h3>
          <p className="text-gray-600">
            {translate('feature1Description')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Shield className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{translate('feature2Title')}</h3>
          
<p className="text-gray-600">
            {translate('feature2Description')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Activity className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{translate('feature3Title')}</h3>
          <p className="text-gray-600">
            {translate('feature3Description')}
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{translate('teamSectionTitle')}</h2>
        <div className="grid md:grid-cols-5 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="https://i.postimg.cc/PJV8V3GB/Whats-App-Image-2025-04-13-at-21-25-30-41fdf19b-removebg-preview.png"
              alt="Ahmed Mohamed"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold">Ahmed Mohamed</h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="https://i.postimg.cc/VLb6cLXS/Whats-App-Image-2025-04-13-at-21-25-14-b732a9af-Picsart-Ai-Image-Enhancer-removebg-preview.png"
              alt="Ahmed Hossam"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold">Ahmed Hossam</h3>

          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="https://i.postimg.cc/BQwxm64X/Whats-App-Image-2025-01-22-at-21-46-04-b1174f1f-1-removebg-preview.png"
              alt="Raghdan Ramadan"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold">Raghdan Ramadan</h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="https://i.postimg.cc/vH9VtvqS/Whats-App-Image-2025-04-13-at-21-50-19-b2d3799b-Picsart-Ai-Image-Enhancer-removebg-preview.png"
              alt="Abdullah Raafat"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold">Abdullah Raafat</h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="https://i.postimg.cc/762HrKTF/Whats-App-Image-2025-04-13-at-21-38-30-02070495-Picsart-Ai-Image-Enhancer-removebg-preview.png"
              alt="Mohab Marzouk"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold">Mohab Marzouk</h3>
          </div>
        </div>
      </div>
    </div>
  );
}