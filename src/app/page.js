'use client';

import { useState } from 'react';

export default function HomePage() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasteUrl('');

    try {
      const body = {
        content,
      };

      if (ttlSeconds) {
        body.ttl_seconds = parseInt(ttlSeconds, 10);
      }

      if (maxViews) {
        body.max_views = parseInt(maxViews, 10);
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        return;
      }

      setPasteUrl(data.url);

      // Reset form
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError('Failed to create paste. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pasteUrl);
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333'
      }}>
        Pastebin Lite
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="content"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}
          >
            Paste Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder="Enter your text here..."
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              fontFamily: 'monospace',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div>
            <label
              htmlFor="ttl"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}
            >
              Expiry Time (seconds)
            </label>
            <input
              id="ttl"
              type="number"
              min="1"
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              placeholder="Optional (e.g., 3600)"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label
              htmlFor="maxViews"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}
            >
              Max Views
            </label>
            <input
              id="maxViews"
              type="number"
              min="1"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="Optional (e.g., 5)"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {pasteUrl && (
          <div style={{
            background: '#efe',
            color: '#363',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <div style={{ fontWeight: '500', marginBottom: '10px' }}>
              Paste created successfully!
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <a
                href={pasteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#fff',
                  border: '1px solid #9c9',
                  borderRadius: '3px',
                  fontSize: '13px',
                  color: '#333',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}
              >
                {pasteUrl}
              </a>
              <button
                type="button"
                onClick={copyToClipboard}
                style={{
                  padding: '8px 15px',
                  background: '#363',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '5px',
        fontSize: '14px',
        color: '#666'
      }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>How to use:</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Enter your text in the content area</li>
          <li>Optionally set an expiry time in seconds</li>
          <li>Optionally set a maximum number of views</li>
          <li>Click "Create Paste" to generate a shareable link</li>
          <li>Share the link with others to view your paste</li>
        </ul>
      </div>
    </div>
  );
}