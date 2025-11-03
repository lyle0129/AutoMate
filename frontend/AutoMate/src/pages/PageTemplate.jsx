import React from 'react';

/**
 * PageTemplate - A template for creating new pages
 * @returns {JSX.Element} The rendered page
 */
const PageTemplate = () => {
  return (
    <div className="page-template min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Page Title</h1>
        <div className="content">
          {/* Page content goes here */}
        </div>
      </div>
    </div>
  );
};

export default PageTemplate;