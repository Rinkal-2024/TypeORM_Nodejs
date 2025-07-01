# CosmaBackend

## Environment Configuration Setup

Before running the application, you need to set up your environment configuration. The project includes a template configuration file (`.env.example`) that needs to be copied to create your local environment file (`.env`).

To set up your environment configuration, run the following command in your project's root directory:
``` shell
    cp .env.example .env
```

## AI Helpers
The project includes a script to set up ignore files for various AI coding assistants. These ignore files help protect sensitive information and exclude unnecessary files from AI analysis.

To create or update the ignore files, run:
``` shell
    sudo ./build_ai_ignore.sh 
```
