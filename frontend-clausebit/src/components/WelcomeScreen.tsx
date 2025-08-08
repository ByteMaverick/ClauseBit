// components/WelcomeScreen.tsx
import React from 'react';
import {Shield, FileText, Cookie, Eye, Sparkles, Layers, AlertTriangle} from 'lucide-react';

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSendMessage }) => {
  const quickActions = [
    {
      icon: FileText,
      title: "Terms of Service",
      description: "Analyze legal terms & user agreements",
      prompt: "Please analyze the Terms of Service at https://github.com/ and highlight any concerning clauses, especially those related to data usage, liability limitations, and user rights.",
      gradient: "from-pink-500 to-purple-500",
      hoverColor: "hover:from-pink-600 hover:to-purple-600"
    },
    {
      icon: Eye,
      title: "Privacy Policy",
      description: "Review data collection & usage practices",
      prompt: "Can you review the Privacy Policy at https://www.youtube.com/ and explain what personal data they collect, how it's used, and if it's shared with third parties? Please highlight any red flags.",
      gradient: "from-purple-500 to-pink-400",
      hoverColor: "hover:from-purple-600 hover:to-pink-500"
    },
    {
      icon: Cookie,
      title: "Cookie Policy",
      description: "Understand tracking & cookie usage",
      prompt: "Please analyze the cookie policy at https://www.emirates.com/ and explain what types of cookies are being used, their purpose, and any privacy implications I should be aware of.",
      gradient: "from-pink-400 to-rose-500",
      hoverColor: "hover:from-pink-500 hover:to-rose-600"
    }
  ];

  const handleQuickAction = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="text-center py-8 max-w-5xl mx-auto px-6">
      {/* Hero Section */}
      <div className="relative mb-6">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-3 leading-tight">
        Take Control of
        <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent"> Your Privacy</span>
      </h1>

      <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
       Hi! I'm your AI-powered legal assistant.
        I can scan Terms of Service, Privacy Policies, and Cookie Banners — flagging risky clauses and explaining them clearly.
        For the most accurate, real-time results, try pasting the website URL you'd like me to analyze.
      </p>


  {/* Feature Highlights */}
<div className="flex flex-wrap items-center justify-center gap-4 mb-8">
  {/* Adaptive RAG + Hierarchical Agents */}
  <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl border border-pink-100 shadow-sm">
    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
      <Layers className="w-3 h-3 text-white" />
    </div>
    <span className="font-medium text-gray-700 text-sm">Adaptive RAG with Hierarchical Agents</span>
  </div>

 {/* Factual Consistency Scoring */}
<div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-3 py-2 rounded-xl border border-red-100 shadow-sm">
  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
    <AlertTriangle className="w-3 h-3 text-white" />
  </div>
  <span className="font-medium text-gray-700 text-sm">Factual Consistency Scoring</span>
</div>
</div>



      {/* Quick Action Widgets */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-800">Quick Start</h2>
          <Sparkles className="w-5 h-5 text-purple-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={index}
                onClick={() => handleQuickAction(action.prompt)}
                className="group relative p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                <div className="relative text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} ${action.hoverColor} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:rotate-3`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {action.description}
                  </p>

                  {/* Click indicator */}
                  <div className="absolute top-3 right-3 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-pink-50 via-purple-50 to-rose-50 rounded-2xl p-6 border border-white/60 backdrop-blur-sm shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-2xl opacity-30"></div>
        <div className="relative">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Or start with a custom question</h3>
          <p className="text-gray-600 mb-6">Ask me anything about privacy policies, terms of service, or data protection laws.</p>
          <button
            onClick={() => onSendMessage("Hi! I'd like to learn more about protecting my privacy online. Can you help me understand what to look for in privacy policies?")}
            className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-pink-500/30 transform hover:scale-105 hover:-translate-y-1 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center space-x-2">
              <span>Start Chatting</span>
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;