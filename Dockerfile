FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /var/dev
COPY package.json bun.lockb /var/dev/
RUN cd /var/dev && bun install --development

RUN mkdir -p /var/prod
COPY package.json bun.lockb /var/prod/
RUN cd /var/prod && bun install --production

# then copy all (non-ignored) project files into the image
FROM base AS dev
COPY --from=install /var/dev/node_modules node_modules
COPY . .

# run the app
USER bun
EXPOSE 8000/tcp
CMD [ "bun", "run", "dev" ]

# copy production dependencies and source code into final image
FROM base AS prod

COPY --from=install /var/prod/node_modules node_modules
COPY --from=dev /usr/src/app/index.ts index.ts
COPY --from=dev /usr/src/app/package.json package.json

# run the app
USER bun
EXPOSE 8000/tcp
CMD [ "bun", "run", "dev" ]

