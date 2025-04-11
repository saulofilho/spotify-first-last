# What happened to your sound?

## Project Description

"What happened to your sound?" is a dynamic web application designed for music enthusiasts to explore the evolution of an artist's musical journey. With a simple search, users can enter the name of a band or artist, and the app uses the Spotify API to retrieve detailed discography information. The application then randomly selects a track from both the artist’s debut album and their most recent release, allowing users to compare the beginnings and the current sound of the artist.

## Key Features

- **Intuitive Search Interface:**
    
    Easily search for your favorite band or artist to trigger a musical journey of discovery.
    
- **Spotify API Integration:**
    
    Seamlessly authenticate with Spotify to fetch artist data, albums, and track details.
    
- **Random Track Selection:**
    
    For each artist, the app randomly picks one track from the debut album and one from the latest album, showcasing the evolution of the sound.
    
- **Official Spotify Embedded Player:**
    
    The application leverages Spotify's official embed player (via iframe) to allow users to listen to track previews directly within the browser.
    
- **Responsive and Modern UI:**
    
    Developed using HTML, CSS, and JavaScript, with the build powered by Vite. The design is fully responsive and optimized for various devices.
    

## Development and Deployment

- **Bundler & Environment Variables:**
    
    The project uses Vite to manage modules, assets, and environment variables (with the prefix `VITE_`) for a smooth development workflow. Sensitive credentials, such as Spotify's API keys, are stored in a `.env` file and managed securely during the build process.
    
- **Production Deployment with Vercel:**
    
    The application is deployed on Vercel, taking advantage of its continuous deployment process. Every commit or push triggers an automatic build and deployment, ensuring the app is always up to date.
    

## Security Considerations

While the project leverages environment variables with Vite for configuration, keep in mind that performing Spotify API authentication on the client-side exposes sensitive data. For production, it is highly recommended to move the token generation and authentication process to a secure backend server to protect your API credentials.
