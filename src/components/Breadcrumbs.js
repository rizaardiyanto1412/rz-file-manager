/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/FileManagerContext';

/**
 * Breadcrumbs component
 * 
 * This component displays the current path as clickable breadcrumbs
 * to allow easy navigation between directories.
 * 
 * @return {JSX.Element} The rendered component
 */
const Breadcrumbs = () => {
  // Get state and methods from context
  const { currentPath, navigateTo } = useFileManager();

  /**
   * Generate breadcrumb items from the current path
   * 
   * @return {Array} Array of breadcrumb items
   */
  const getBreadcrumbs = () => {
    // Start with root
    const breadcrumbs = [{ name: __('Root', 'rz-file-manager'), path: '' }];
    
    // If we're at root, just return the root breadcrumb
    if (!currentPath) {
      return breadcrumbs;
    }
    
    // Split the path and build breadcrumbs
    const parts = currentPath.split('/');
    let currentBreadcrumbPath = '';
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        currentBreadcrumbPath += (currentBreadcrumbPath ? '/' : '') + parts[i];
        breadcrumbs.push({
          name: parts[i],
          path: currentBreadcrumbPath,
        });
      }
    }
    
    return breadcrumbs;
  };

  /**
   * Handle breadcrumb click
   * 
   * @param {string} path Path to navigate to
   * @param {Event} event Click event
   */
  const handleBreadcrumbClick = (path, event) => {
    event.preventDefault();
    navigateTo(path);
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="rz-file-manager__breadcrumbs">
      {breadcrumbs.map((breadcrumb, index) => (
        <span key={breadcrumb.path}>
          {index > 0 && <span className="rz-file-manager__breadcrumbs-separator">/</span>}
          <a
            href="#"
            className="rz-file-manager__breadcrumbs-item"
            onClick={(e) => handleBreadcrumbClick(breadcrumb.path, e)}
          >
            {breadcrumb.name}
          </a>
        </span>
      ))}
    </div>
  );
};

export default Breadcrumbs;
