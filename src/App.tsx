import React, { useState } from 'react';
import { GraphiQL } from 'graphiql';
import type { Fetcher } from '@graphiql/toolkit';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import 'graphiql/graphiql.css';

interface WeaviateConfig {
  endpoint: string;
  apiKey: string;
}

const App: React.FC = () => {
  const [config, setConfig] = useState<WeaviateConfig>({
    endpoint: '',
    apiKey: ''
  });
  const [showConfig, setShowConfig] = useState(true);
  const [configError, setConfigError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  const validateConnection = async (config: WeaviateConfig) => {
    setIsValidating(true);
    setConfigError('');

    try {
      // Test query to check connection
      const response = await fetch(`${config.endpoint}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          query: `{
            __schema {
              queryType {
                name
              }
            }
          }`
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // If we got here, connection is valid
      setShowConfig(false);
    } catch (error) {
      setConfigError(error instanceof Error ? error.message : 'Failed to connect to Weaviate instance');
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateConnection(config);
  };

  const handleConfigChange = (key: keyof WeaviateConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfig(prev => ({
      ...prev,
      [key]: event.target.value
    }));
    setConfigError('');
  };

  const fetcher: Fetcher = async (graphQLParams) => {
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

  const defaultQuery = `{
  Get {
    Documents(limit: 2) {
      content
      documentId
      metadata {
        content_type
        document_id
        object_name
      }
    }
  }
}`;

  return (
    <div className="h-screen flex flex-col bg-white">
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Weaviate Connection</DialogTitle>
            <DialogDescription>
              Enter your Weaviate instance details to connect to the GraphQL explorer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfigSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">Weaviate Endpoint</Label>
              <Input
                id="endpoint"
                type="text"
                value={config.endpoint}
                onChange={handleConfigChange('endpoint')}
                placeholder="https://your-instance.weaviate.cloud"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={handleConfigChange('apiKey')}
                placeholder="Your API Key"
                required
              />
            </div>

            {configError && (
              <Alert variant="destructive">
                <AlertDescription>{configError}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isValidating}
            >
              {isValidating ? 'Validating Connection...' : 'Connect to Weaviate'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings button in the main interface */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">Weaviate GraphQL Explorer</h1>
          <Button 
            variant="outline"
            onClick={() => setShowConfig(true)}
          >
            Settings
          </Button>
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

export default App;