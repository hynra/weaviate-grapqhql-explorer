import React, { useState } from 'react';
import { GraphiQL } from 'graphiql';
import type { Fetcher } from '@graphiql/toolkit';

import 'graphiql/graphiql.css';

const App: React.FC = () => {
  const [config, setConfig] = useState<WeaviateConfig>({
    endpoint: '',
    apiKey: ''
  });

  const fetcher: Fetcher = async (graphQLParams) => {
    if (!config.endpoint) throw new Error('Please enter Weaviate endpoint');
    if (!config.apiKey) throw new Error('Please enter API key');

    const response = await fetch(`${config.endpoint}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(graphQLParams),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result;
  };

  const handleConfigChange = (key: keyof WeaviateConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfig(prev => ({
      ...prev,
      [key]: event.target.value
    }));
  };

  const defaultQuery = `{
  Get {
    Article {
      title
      content
      _additional {
        id
      }
    }
  }
}`;

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label 
                htmlFor="endpoint" 
                className="block text-sm font-medium text-gray-700"
              >
                Weaviate Endpoint
              </label>
              <input
                id="endpoint"
                type="text"
                value={config.endpoint}
                onChange={handleConfigChange('endpoint')}
                placeholder="https://localhost"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label 
                htmlFor="apiKey" 
                className="block text-sm font-medium text-gray-700"
              >
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={handleConfigChange('apiKey')}
                placeholder="Your API Key"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* GraphiQL Section */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <GraphiQL
            fetcher={fetcher}
            defaultQuery={defaultQuery}
            editorTheme="light"
          />
        </div>
      </div>
    </div>
  );
};

interface WeaviateConfig {
  endpoint: string;
  apiKey: string;
}

export default App;