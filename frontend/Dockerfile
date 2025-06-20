# Use the official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose port 4173 (Vite preview default)
EXPOSE 4173

# Serve the built application
CMD ["bun", "run", "preview", "--host", "0.0.0.0"]
