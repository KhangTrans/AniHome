import React, { useState } from 'react';
import { FileText, Check, X, Eye } from 'lucide-react';

const ContentModerator = () => {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Top 10 Dog Treats', author: 'Mark D.', type: 'Blog', status: 'Pending' },
    { id: 2, title: 'My Rescue Journey', author: 'Sarah J.', type: 'Story', status: 'Pending' },
    { id: 3, title: 'Cat Care 101', author: 'Dr. Smith', type: 'Article', status: 'Flagged' },
  ]);

  const handleAction = (id, action) => {
    // In a real app, this would verify via API
    setPosts(posts.filter(p => p.id !== id));
    console.log(`${action} post ${id}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="mb-4">Content Moderation</h1>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {posts.map(post => (
          <div key={post.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <span className="badge badge-warning">{post.type}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{post.status}</span>
            </div>
            <h3 className="mb-2">{post.title}</h3>
            <p className="mb-4" style={{ color: 'var(--gray)' }}>By {post.author}</p>
            <div className="flex gap-2 mt-auto">
               <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}><Eye size={18} /> View</button>
               <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center', background: 'var(--success)', color: 'white' }} onClick={() => handleAction(post.id, 'Approved')}>
                 <Check size={18} />
               </button>
               <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', background: 'var(--danger)', color: 'white' }} onClick={() => handleAction(post.id, 'Rejected')}>
                 <X size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>
      {posts.length === 0 && (
          <div className="text-center p-4">
              <p style={{ color: 'var(--gray)' }}>No pending content to review.</p>
          </div>
      )}
    </div>
  );
};

export default ContentModerator;
