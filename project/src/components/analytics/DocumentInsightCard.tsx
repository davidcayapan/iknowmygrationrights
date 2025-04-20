import React from 'react';
import { BarChart2, FileText, PieChart } from 'lucide-react';
import { DocumentInsights } from '../../types';
import { useNavigate } from 'react-router-dom';

interface DocumentInsightCardProps {
  document: {
    id: string;
    title: string;
    uploadDate: string;
  };
  insights: DocumentInsights;
}

const DocumentInsightCard: React.FC<DocumentInsightCardProps> = ({ document, insights }) => {
  const navigate = useNavigate();

  const handleViewAnalysis = () => {
    navigate(`/documents/${document.id}/analysis`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4 bg-indigo-900 text-white flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          <h3 className="font-medium truncate">{document.title}</h3>
        </div>
        <span className="text-xs text-indigo-200">
          Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
        </span>
      </div>
      
      <div className="p-4">
        <h4 className="font-medium text-gray-800 mb-2">Document Summary</h4>
        <p className="text-sm text-gray-600 mb-4">{insights.summary}</p>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">Key Findings</h4>
            <span className="text-xs text-indigo-600">{insights.keyFindings.length} items</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
            {insights.keyFindings.slice(0, 3).map((finding, idx) => (
              <li key={idx}>{finding}</li>
            ))}
            {insights.keyFindings.length > 3 && (
              <li className="text-indigo-600 cursor-pointer">
                + {insights.keyFindings.length - 3} more findings
              </li>
            )}
          </ul>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center mb-2">
              <PieChart className="h-4 w-4 text-indigo-600 mr-1" />
              <h4 className="font-medium text-gray-800 text-sm">Top Entities</h4>
            </div>
            <div className="space-y-2">
              {insights.entities.slice(0, 3).map((entity, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-gray-600">{entity.name}</span>
                  <span className="text-gray-800 font-medium">{entity.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <BarChart2 className="h-4 w-4 text-indigo-600 mr-1" />
              <h4 className="font-medium text-gray-800 text-sm">Key Topics</h4>
            </div>
            <div className="space-y-2">
              {insights.topics.slice(0, 3).map((topic, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">{topic.name}</span>
                    <span className="text-gray-800 font-medium">
                      {(topic.relevance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full" 
                      style={{ width: `${topic.relevance * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button 
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            onClick={handleViewAnalysis}
          >
            View Full Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentInsightCard;