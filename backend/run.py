import os
import uvicorn

if __name__ == "__main__":
    # Safely fetch the port from Catalyst, stripping any accidental whitespace or strings
    port_str = os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT", "8000")
    
    try:
        port = int(port_str.strip())
    except (ValueError, TypeError):
        port = 8000
        
    # Start the application
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)