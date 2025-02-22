import React from 'react';
import { RoomForm } from './RoomForm';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Collaborative Jamboard
        </h1>
        
        <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
          <RoomForm type="create" />
          <div className="hidden md:flex items-center">
            <div className="w-px h-64 bg-gray-300"></div>
          </div>
          <RoomForm type="join" />
        </div>
      </div>
    </div>
  );
};