/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { fetchFiles } from '../services/api';

/**
 * TestFolderTree component
 *
 * This component is for testing the folder tree API.
 *
 * @return {JSX.Element} The rendered component
 */
const TestFolderTree = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test the root path
      const response = await fetchFiles('');
      console.log('API Response:', response);
      setApiResponse(response);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rz-file-manager__test">
      <h3>API Test</h3>
      <Button isPrimary onClick={testApi} disabled={loading}>
        {loading ? 'Loading...' : 'Test API'}
      </Button>
      
      {error && (
        <div className="rz-file-manager__error">
          <p>Error: {error}</p>
        </div>
      )}
      
      {apiResponse && (
        <div className="rz-file-manager__test-results">
          <h4>API Response:</h4>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          
          <h4>Items:</h4>
          {apiResponse.items && apiResponse.items.length > 0 ? (
            <ul>
              {apiResponse.items.map((item, index) => (
                <li key={index}>
                  {item.name} - Type: {item.type} - Path: {item.path}
                </li>
              ))}
            </ul>
          ) : (
            <p>No items found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TestFolderTree;
