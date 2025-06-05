import React from 'react';
import { Eye, Book, Calendar, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';

function Education() {
  const { translate } = useLanguageStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">{translate('educationCenterTitle')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <Eye className="h-8 w-8 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{translate('commonEyeConditionsTitle')}</h2>
          <p className="text-gray-600 mb-4">
            {translate('commonEyeConditionsDescription')}
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• {translate('diabeticRetinopathy')}</li>
            <li>• {translate('macularDegeneration')}</li>
            <li>• {translate('glaucoma')}</li>
            <li>• {translate('cataracts')}</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <Book className="h-8 w-8 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{translate('preventionCareTitle')}</h2>
          <p className="text-gray-600 mb-4">
            {translate('preventionCareDescription')}
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• {translate('regularEyeExams')}</li>
            <li>• {translate('properNutrition')}</li>
            <li>• {translate('digitalEyeStrain')}</li>
            <li>• {translate('protectiveEyewear')}</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <Calendar className="h-8 w-8 text-purple-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{translate('treatmentOptionsTitle')}</h2>
          <p className="text-gray-600 mb-4">
            {translate('treatmentOptionsDescription')}
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• {translate('laserTreatments')}</li>
            <li>• {translate('medicationOptions')}</li>
            <li>• {translate('surgicalProcedures')}</li>
            <li>• {translate('visionTherapy')}</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mb-12">
        <div className="flex items-start space-x-4">
          <AlertCircle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">{translate('importantNoticeTitle')}</h3>
            <p className="text-blue-800">
              {translate('importantNoticeDescription')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{translate('latestResearchTitle')}</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">{translate('octTechnologyTitle')}</h3>
              <p className="text-gray-600 mt-1">{translate('octTechnologyDescription')}</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">{translate('aiOphthalmologyTitle')}</h3>
              <p className="text-gray-600 mt-1">{translate('aiOphthalmologyDescription')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{translate('resourcesTitle')}</h2>
          <div className="space-y-4">
            <a href="#" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-gray-900">{translate('eyeHealthGuidelinesTitle')}</h3>
              <p className="text-gray-600 mt-1">{translate('eyeHealthGuidelinesDescription')}</p>
            </a>
            <a href="#" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-gray-900">{translate('videoLibraryTitle')}</h3>
              <p className="text-gray-600 mt-1">{translate('videoLibraryDescription')}</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Education;