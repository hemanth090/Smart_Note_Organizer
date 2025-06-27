/**
 * NotesDisplay Component
 * Renders AI-generated notes in markdown format using marked.js
 */

import React, { useMemo } from 'react';
import { marked } from 'marked';

const NotesDisplay = ({ notes }) => {
  // Configure marked options for better rendering
  const configureMarked = () => {
    marked.setOptions({
      breaks: true, // Convert \n to <br>
      gfm: true, // GitHub Flavored Markdown
      headerIds: false, // Don't add IDs to headers
      mangle: false, // Don't mangle email addresses
    });

    // Custom renderer for better styling
    const renderer = new marked.Renderer();
    
    // Custom heading renderer
    renderer.heading = (text, level) => {
      const sizes = {
        1: 'text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-6 first:mt-0',
        2: 'text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-5 first:mt-0',
        3: 'text-lg font-medium text-gray-800 dark:text-gray-100 mb-2 mt-4 first:mt-0',
        4: 'text-base font-medium text-gray-700 dark:text-gray-200 mb-2 mt-3 first:mt-0',
        5: 'text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 mt-2 first:mt-0',
        6: 'text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 mt-2 first:mt-0'
      };
      
      return `<h${level} class="${sizes[level] || sizes[6]}">${text}</h${level}>`;
    };

    // Custom paragraph renderer
    renderer.paragraph = (text) => {
      return `<p class="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">${text}</p>`;
    };

    // Custom list renderer
    renderer.list = (body, ordered) => {
      const tag = ordered ? 'ol' : 'ul';
      const classes = ordered 
        ? 'list-decimal list-inside space-y-1 mb-4 text-gray-700 dark:text-gray-300'
        : 'list-disc list-inside space-y-1 mb-4 text-gray-700 dark:text-gray-300';
      
      return `<${tag} class="${classes}">${body}</${tag}>`;
    };

    // Custom list item renderer
    renderer.listitem = (text) => {
      return `<li class="leading-relaxed">${text}</li>`;
    };

    // Custom blockquote renderer
    renderer.blockquote = (quote) => {
      return `<blockquote class="border-l-4 border-primary-500 pl-4 py-2 mb-4 bg-gray-50 dark:bg-gray-700 rounded-r-lg">
        <div class="text-gray-600 dark:text-gray-400 italic">${quote}</div>
      </blockquote>`;
    };

    // Custom code renderer
    renderer.code = (code, language) => {
      return `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 overflow-x-auto">
        <code class="text-sm text-gray-800 dark:text-gray-200 font-mono">${code}</code>
      </pre>`;
    };

    // Custom inline code renderer
    renderer.codespan = (code) => {
      return `<code class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">${code}</code>`;
    };

    // Custom strong/bold renderer
    renderer.strong = (text) => {
      return `<strong class="font-semibold text-gray-900 dark:text-white">${text}</strong>`;
    };

    // Custom emphasis/italic renderer
    renderer.em = (text) => {
      return `<em class="italic text-gray-800 dark:text-gray-200">${text}</em>`;
    };

    // Custom horizontal rule renderer
    renderer.hr = () => {
      return `<hr class="border-gray-300 dark:border-gray-600 my-6">`;
    };

    // Custom table renderer
    renderer.table = (header, body) => {
      return `<div class="overflow-x-auto mb-4">
        <table class="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg">
          <thead class="bg-gray-50 dark:bg-gray-700">${header}</thead>
          <tbody class="bg-white dark:bg-gray-800">${body}</tbody>
        </table>
      </div>`;
    };

    renderer.tablerow = (content) => {
      return `<tr class="border-b border-gray-200 dark:border-gray-600">${content}</tr>`;
    };

    renderer.tablecell = (content, flags) => {
      const tag = flags.header ? 'th' : 'td';
      const classes = flags.header 
        ? 'px-4 py-2 text-left font-medium text-gray-900 dark:text-white'
        : 'px-4 py-2 text-gray-700 dark:text-gray-300';
      
      return `<${tag} class="${classes}">${content}</${tag}>`;
    };

    return renderer;
  };

  // Memoized HTML content
  const htmlContent = useMemo(() => {
    if (!notes) return '';
    
    try {
      const renderer = configureMarked();
      marked.use({ renderer });
      return marked(notes);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return `<p class="text-red-600 dark:text-red-400">Error rendering markdown content</p>`;
    }
  }, [notes]);

  if (!notes) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No notes to display</p>
      </div>
    );
  }

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <div 
        className="markdown-content max-h-96 overflow-y-auto scrollbar-thin pr-2"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      
      {/* Custom styles for better markdown rendering */}
      <style jsx>{`
        .markdown-content h1:first-child,
        .markdown-content h2:first-child,
        .markdown-content h3:first-child,
        .markdown-content h4:first-child,
        .markdown-content h5:first-child,
        .markdown-content h6:first-child {
          margin-top: 0 !important;
        }
        
        .markdown-content ul ul,
        .markdown-content ol ol,
        .markdown-content ul ol,
        .markdown-content ol ul {
          margin-left: 1.5rem;
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
        
        .markdown-content li > p {
          margin-bottom: 0.5rem;
        }
        
        .markdown-content li:last-child > p {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default NotesDisplay;
