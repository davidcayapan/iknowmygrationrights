import React from 'react';
import { useParams } from 'react-router-dom';
import { BarChart2, FileText, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

const DocumentAnalysis: React.FC = () => {
  const { id } = useParams();
  
  // In a real app, fetch document data based on id
  const document = {
    id,
    title: "USCIS Policy Memo 2023-04: Asylum Procedures",
    uploadDate: "2023-06-15",
    insights: {
      summary: "This immigration memo outlines recent changes to asylum application procedures and processing timelines under the current administration's policies.",
      keyFindings: [
        "New expedited processing path for applicants from certain countries",
        "Updated documentation requirements for employment authorization",
        "Revised guidelines for credible fear interviews",
        "Changes to the detention policy for asylum seekers",
        "Modified hearing procedures for immigration courts",
        "New requirements for supporting evidence",
        "Updated timeline expectations for case processing"
      ],
      entities: [
        { name: "USCIS", type: "organization", count: 23 },
        { name: "ICE", type: "organization", count: 18 },
        { name: "DOJ", type: "organization", count: 15 },
        { name: "June 2023", type: "date", count: 12 },
        { name: "Mexico", type: "location", count: 8 }
      ],
      topics: [
        { name: "Asylum Process", relevance: 0.87 },
        { name: "Documentation", relevance: 0.65 },
        { name: "Legal Procedures", relevance: 0.58 },
        { name: "Employment Auth", relevance: 0.45 },
        { name: "Court Hearings", relevance: 0.42 }
      ],
      sentiment: 0.2
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{document.title}</h1>
        <p className="text-gray-600">
          Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Document Summary</h2>
            <p className="text-gray-600">{document.insights.summary}</p>
          </div>

          {/* Key Findings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Key Findings</h2>
            </div>
            <ul className="space-y-3">
              {document.insights.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="h-2 w-2 mt-2 rounded-full bg-indigo-600 mr-3" />
                  <span className="text-gray-600">{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Topics Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Topic Analysis</h2>
            </div>
            <div className="space-y-4">
              {document.insights.topics.map((topic, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">{topic.name}</span>
                    <span className="text-gray-800 font-medium">
                      {(topic.relevance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${topic.relevance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Entity Recognition */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Named Entities</h2>
            </div>
            <div className="space-y-4">
              {document.insights.entities.map((entity, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-800 font-medium">{entity.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({entity.type})</span>
                  </div>
                  <span className="text-indigo-600 font-medium">{entity.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <BarChart2 className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Sentiment Analysis</h2>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {(document.insights.sentiment * 100).toFixed(0)}%
              </div>
              <p className="text-gray-600">Positive Sentiment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysis;