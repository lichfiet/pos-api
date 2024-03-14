# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/api

# install dependencies into var directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /var/dev
COPY package.json bun.lockb /var/dev/
RUN cd /var/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /var/prod
COPY package.json bun.lockb /var/prod/
RUN cd /var/prod && bun install --frozen-lockfile --production

# copy node_modules from var directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /var/dev/node_modules node_modules
COPY . .

# [optional] tests & build
# ENV NODE_ENV=production
# RUN bun test
# RUN bun run build

# copy production dependencies and source code into final image
# FROM base AS release
COPY --from=install /var/prod/node_modules node_modules
# COPY --from=prerelease /usr/src/app/index.ts .
# COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 8000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]
