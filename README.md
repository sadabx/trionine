# Current Structure: Trionine

```text
trionine/
├── assets/
│   ├── favicon.ico                          # Website favicon
│   ├── manifesthub.png                      # ManifestHub project screenshot
│   ├── mermaidresort.png                    # Mermaid Beach Resort project screenshot
│   ├── archive.png                          # Archive project screenshot
│   ├── f1dashboard.png                      # F1 Dashboard project screenshot
│   └── Screenshot_*.png                     # Legacy screenshots
├── drop/                                    # Deprecated features (legacy)
├── .gitignore                               # Git ignore rules
├── index.html                               # Homepage / Landing page
├── styles.css                               # Global website stylesheets
├── script.js                                # Main UI interactions, scroll spy, and project rendering
├── README.md                                # Project documentation
└── .vscode/                                 # (ignored) VS Code settings
```

# Old Structure: Trionine

```text
trionine/
├── assets/
│   ├── .gitignore             # Git ignore rules for assets
│   └── favicon.ico            # Website favicon
├── css/
│   ├── library.css            # Styles specific to the resource library
│   └── styles.css             # Global website stylesheets
├── js/
│   ├── library.js             # Logic for resource filtering and fetching
│   ├── script.js              # Main UI interactions and navigation
│   └── supabase-config.js     # Supabase client initialisation and auth logic
├── links/
│   └── linkconverter.html     # Google Drive direct link generator tool
├── netlify/
│   └── functions/
│       └── upload.js          # Serverless function for Cloudinary uploads
├── auth.html                  # User login and registration page
├── index.html                 # Homepage / Landing page
├── library.html               # Educational resource library interface
└── README.md                  # Project documentation
