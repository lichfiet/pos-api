FROM oven/bun:1 as base
WORKDIR /usr/src/api

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS devDependencies
RUN mkdir -p /var/dev
COPY package.json bun.lockb /var/dev/
RUN cd /var/dev && bun install --frozen-lockfile --development

FROM base as prodDependencies
RUN mkdir -p /var/prod
COPY package.json bun.lockb /var/prod/
RUN cd /var/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS dev
COPY --from=devDependencies /var/dev/node_modules node_modules
COPY . .


# copy production dependencies and source code into final image
FROM base AS prod
COPY --from=prodDependencies /var/prod/node_modules node_modules
COPY . .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]
