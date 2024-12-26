```markdown

src/
├── core/                # Core framework components and utilities
│   ├── components/      # Reusable UI building blocks
│   │   ├── fault-status-icon/  # Icons indicating fault status
│   │   └── icon/         # Generic icon components
│   ├── utils/           # General utility functions and helpers
│   │   └── loading/       # Loading screen related utilities
│   ├── hooks/           # Custom hooks for shared logic
│   │   └── modal/        # Modal hooks
│   ├── modal/           # Modal component
│   └── style/          # Global styles and shared UI elements
├── app/                 # Main application setup and viewers
│   ├── viewer/         # Components for viewing the application
│   │   └── context/      # Context for application viewing
│   ├── designer/       # Components for designing the application
│   │   ├── builder/     # Core design components
│   │   ├── panels/        # Different configuration panels
│   │   │   ├── database/  # Panels for database and tables
│   │   │   ├── design/    # Panels for design and layout
│   │   │   ├── elements/    # Panels for available elements
│   │   │   ├── errors/  # Panels for errors
│   │   │   ├── fetchers/ # Panels for fetcher configurations
│   │   │   ├── queries/  # Panels for query configurations
│   │   │   ├── pages/     # Panels for page configurations
│   │   │   ├── package/    # Panels for package operations
│   │   │   ├── properties/   # Panels for properties management
│   │   │   ├── style/ # Panels for Style configurations
│   │   │   ├── variables/   # Panels for variables management
│   │   │   └── callable/   # Panels for callables management
│   │   ├── components/  # Component specific for designer
│   │   │    └── empty-component/  # Empty component specific for designer
│   │   ├── hooks/       # Hooks specific to design functionality
│   │   ├── editor/       #  Editor functions
│   │   └── variable-initialization/ # Variable initialization logic
│   ├── data/           # Data display and handling components
│   ├── form/           # Form components
│   │   ├── input/      # Form specific input components
│   │       ├── date/   # Date and time related inputs
│   │       └──  checkbox/
│   │       └── radio/
│   │       └── select/
│   │       └── text/
│   │   └── container/   # Form layout components
│   └── button/         # Button components
├── editor/             # Editor related files
└── main.tsx         # Main app entry point

```