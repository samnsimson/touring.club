FROM oven/bun:1.2.21-debian

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates docker.io \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
