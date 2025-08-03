// components/WelcomeScreen.tsx
import React from 'react';
import { Shield, Zap, Database } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="text-center py-16">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-32 h-32 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <h2 className="text-4xl font-bold mb-4">
        Take Control of
        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Your Privacy</span>
      </h2>
      <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
        ClauseBit is your AI-powered legal assistant that scans Terms of Service, Privacy Policies, and Cookie Banners — flagging risky clauses and explaining them in plain English. Personalized to your privacy preferences.
      </p>

      <div className="flex items-center justify-center space-x-12 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-500" />
          <span>Sub-3s Analysis</span>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-500" />
          <span>Dynamic Knowledge Base</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <span>AI-Powered</span>
        </div>
      </div>

      <button className="mt-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
        Try Now!
      </button>
    </div>
  );
};

export default WelcomeScreen;
