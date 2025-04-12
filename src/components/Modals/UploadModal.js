/**
 * WordPress dependencies
 */
import { useState, useRef, useContext, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Modal, Button, ProgressBar } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../../context/fileManager';

/**
 * UploadModal component
 *
 * This component displays a modal for uploading files.
 *
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @return {JSX.Element} The rendered component
 */
const UploadModal = ({ isOpen, onClose }) => {
  // Get state and methods from context
  const { currentPath, handleUploadFiles, uploadError, clearUploadError } = useFileManager();

  // Reference to file input
  const fileInputRef = useRef(null);

  // State for selected files
  const [selectedFiles, setSelectedFiles] = useState([]);

  // State for upload progress
  const [uploadProgress, setUploadProgress] = useState({});

  // State for upload errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      clearUploadError();
    }
  }, [isOpen, clearUploadError]);

  /**
   * Handle file selection
   *
   * @param {Event} event Change event
   */
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    // Reset progress and errors
    setUploadProgress({});
    setErrors({});
    clearUploadError();
  };

  /**
   * Handle form submission
   *
   * @param {Event} event Submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate files
    if (selectedFiles.length === 0) {
      return;
    }

    // Upload files
    handleUploadFiles(selectedFiles, currentPath, {
      onProgress: (file, progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress
        }));
      },
      onError: (file, error) => {
        setErrors(prev => ({
          ...prev,
          [file.name]: error
        }));
      },
      onComplete: () => {
        // Close modal after all files are uploaded
        onClose();
      }
    });
  };

  /**
   * Handle browse button click
   */
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  /**
   * Get file size in human-readable format
   *
   * @param {number} bytes File size in bytes
   * @return {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClose = () => {
    clearUploadError();
    onClose();
  };

  return (
    <Modal
      title={__('Upload Files', 'rz-file-manager')}
      onRequestClose={handleClose}
      className="rz-file-manager__modal rz-file-manager__upload-modal"
    >
      {uploadError && (
        <div className="rz-fm-upload-error">
          Error: {uploadError}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="rz-file-manager__modal-content">
          <p>
            {__('Upload files to:', 'rz-file-manager')}
            <strong>{currentPath || '/'}</strong>
          </p>

          <div className="rz-file-manager__upload-area">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              style={{ display: 'none' }}
            />

            <Button
              variant="secondary"
              onClick={handleBrowseClick}
              className="rz-file-manager__browse-button"
            >
              {__('Browse Files', 'rz-file-manager')}
            </Button>

            <p className="rz-file-manager__upload-info">
              {selectedFiles.length > 0
                ? __(`${selectedFiles.length} file(s) selected`, 'rz-file-manager')
                : __('No files selected', 'rz-file-manager')
              }
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="rz-file-manager__selected-files">
              <h3>{__('Selected Files', 'rz-file-manager')}</h3>

              <ul className="rz-file-manager__file-list">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="rz-file-manager__file-item">
                    <div className="rz-file-manager__file-info">
                      <span className="rz-file-manager__file-name">{file.name}</span>
                      <span className="rz-file-manager__file-size">({formatFileSize(file.size)})</span>
                    </div>

                    {uploadProgress[file.name] !== undefined && (
                      <ProgressBar
                        value={uploadProgress[file.name]}
                        className="rz-file-manager__progress"
                      />
                    )}

                    {errors[file.name] && (
                      <div className="rz-file-manager__file-error">
                        {errors[file.name]}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rz-file-manager__modal-footer">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            {__('Cancel', 'rz-file-manager')}
          </Button>

          <Button
            variant="primary"
            type="submit"
            disabled={selectedFiles.length === 0}
          >
            {__('Upload', 'rz-file-manager')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadModal;
