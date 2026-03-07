import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Top 10 Tips for First-Time Dog Owners',
    excerpt: 'Adopting a dog is exciting, but it comes with responsibilities. Here are the essential tips to get you started.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
    date: 'Feb 5, 2026',
    author: 'Dr. Sarah Smith',
    category: 'Guides'
  },
  {
    id: 2,
    title: 'Why Senior Pets Make Great Companions',
    excerpt: 'Senior pets often get overlooked, but they have so much love to give. Discover the benefits of adopting an older animal.',
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=400&q=80',
    date: 'Jan 28, 2026',
    author: 'Mark Wilson',
    category: 'Inspiration'
  },
  {
    id: 3,
    title: 'Understanding Cat Body Language',
    excerpt: 'Cats can be mysterious. Learn how to interpret their tail wags, ear positions, and vocalizations.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    date: 'Jan 15, 2026',
    author: 'Emily Chen',
    category: 'Behavior'
  },
  {
    id: 4,
    title: 'Nutrition 101: What to Feed Your Rescue',
    excerpt: 'Proper nutrition is key to rehabilitation. A guide to choosing the right food for your rescued pet.',
    image: 'https://images.unsplash.com/photo-1589924691195-41432c84c161?auto=format&fit=crop&w=400&q=80',
    date: 'Jan 10, 2026',
    author: 'Dr. Sarah Smith',
    category: 'Health'
  }
];

const BlogListPage = () => {
  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
       <Navbar />
       <div style={{ padding: '4rem 2rem' }}>
       <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div className="text-center mb-16">
             <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--dark)' }}>Rescue Blog</h1>
             <p style={{ color: 'var(--gray)', fontSize: '1.2rem' }}>Stories, tips, and news from the animal rescue community.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
             {BLOG_POSTS.map(post => (
               <article key={post.id} className="card p-0 overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
                  <div style={{ height: '240px', overflow: 'hidden' }}>
                     <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="hover:scale-105" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                     <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">
                        <span style={{ color: 'var(--primary)' }}>{post.category}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1"><Calendar size={12} /> {post.date}</div>
                     </div>
                     <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', lineHeight: '1.3' }}>
                        <Link to={`/blog/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-primary">
                          {post.title}
                        </Link>
                     </h2>
                     <p style={{ color: 'var(--gray)', marginBottom: '1.5rem', flex: 1 }}>{post.excerpt}</p>
                     
                     <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-2 text-sm font-medium">
                           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><User size={16} /></div>
                           {post.author}
                        </div>
                        <Link to={`/blog/${post.id}`} style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           Read More <ArrowRight size={16} />
                        </Link>
                     </div>
                  </div>
               </article>
             ))}
          </div>

       </div>
       </div>
    </div>
  );
};

export default BlogListPage;
