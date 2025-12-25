import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [msg, setMsg] = useState<string>("loading...");

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/hello");
      const data = await res.json();
      setMsg(data.message);
    };

    run().catch(() => setMsg("failed to fetch"));
  }, []);

  return (
    <>
      <div style={{ padding: 16 }}>
        <h1>Client</h1>
        <p>{msg}</p>

      </div>
    </>
  )
}

export default App
