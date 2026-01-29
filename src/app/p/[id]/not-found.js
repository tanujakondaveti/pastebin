export default function NotFound() {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
            marginTop: '100px'
        }}>
            <h1 style={{ fontSize: '48px', margin: '0 0 20px 0', color: '#333' }}>404</h1>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
                Paste not found or has expired
            </p>
            <a
                href="/"
                style={{
                    display: 'inline-block',
                    textDecoration: 'none',
                    color: '#fff',
                    background: '#0070f3',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    fontSize: '14px'
                }}
            >
                Create New Paste
            </a>
        </div>
    );
}