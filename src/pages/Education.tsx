import React from 'react';
import { Eye, Book, Calendar, AlertCircle } from 'lucide-react';

function Education() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Eye Health Education Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <Eye className="h-8 w-8 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Common Eye Conditions</h2>
          <p className="text-gray-600 mb-4">
            Learn about various eye conditions, their symptoms, and treatment options.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• Diabetic Retinopathy</li>
            <li>• Age-related Macular Degeneration</li>
            <li>• Glaucoma</li>
            <li>• Cataracts</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <Book className="h-8 w-8 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Prevention & Care</h2>
          <p className="text-gray-600 mb-4">
            Discover ways to maintain healthy eyes and prevent vision problems.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• Regular Eye Examinations</li>
            <li>• Proper Nutrition for Eye Health</li>
            <li>• Digital Eye Strain Prevention</li>
            <li>• Protective Eyewear</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <Calendar className="h-8 w-8 text-purple-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Treatment Options</h2>
          <p className="text-gray-600 mb-4">
            Explore various treatment options and procedures available.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• Laser Treatments</li>
            <li>• Medication Options</li>
            <li>• Surgical Procedures</li>
            <li>• Vision Therapy</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mb-12">
        <div className="flex items-start space-x-4">
          <AlertCircle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Notice</h3>
            <p className="text-blue-800">
              Regular eye examinations are crucial for maintaining eye health. The American Academy of Ophthalmology 
              recommends comprehensive eye exams every 1-2 years for adults over 65, and every 2-4 years for adults 
              aged 40-65.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Latest Research</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">Advances in OCT Technology</h3>
              <p className="text-gray-600 mt-1">New developments in OCT imaging are revolutionizing early detection of eye diseases.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">AI in Ophthalmology</h3>
              <p className="text-gray-600 mt-1">How artificial intelligence is improving diagnosis accuracy and treatment planning.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Resources</h2>
          <div className="space-y-4">
            <a href="#" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-gray-900">Eye Health Guidelines</h3>
              <p className="text-gray-600 mt-1">Download our comprehensive guide to maintaining healthy eyes.</p>
            </a>
            <a href="#" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-gray-900">Video Library</h3>
              <p className="text-gray-600 mt-1">Watch educational videos about eye health and common conditions.</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Education;