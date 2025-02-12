import React from 'react';
import { withProtected } from '../hook/route';

function Support() {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-8 flex  items-center justify-center">
        <div className="text-3xl font-bold mb-4 mt-5">Support</div>
      </div>
    </div>
  );
}

export default withProtected(Support);
