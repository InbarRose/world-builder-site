# Use Python 3.12 as base image
FROM mcr.microsoft.com/devcontainers/python:3.12-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    vim \
    nano \
    htop \
    tree \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /workspaces/world-builder-site

# Copy project files
COPY . .

# Install Python dependencies
RUN poetry install

# Install Node.js dependencies (if frontend exists)
RUN if [ -d "frontend" ]; then \
        cd frontend && npm install; \
    fi

# Set environment variables
ENV PYTHONPATH=/workspaces/world-builder-site/src
ENV PYTHONDONTWRITEBYTECODE=1

# Create non-root user
RUN useradd -m -s /bin/bash vscode
RUN usermod -aG sudo vscode
RUN echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Switch to vscode user
USER vscode
WORKDIR /workspaces/world-builder-site

# Install Poetry for vscode user
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/home/vscode/.local/bin:$PATH"

# Install Python dependencies for vscode user
RUN poetry install

# Set up bash configuration
COPY .devcontainer/bashrc /home/vscode/.bashrc

# Keep container running
CMD ["sleep", "infinity"]

