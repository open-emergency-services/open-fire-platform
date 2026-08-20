# Virtual-system simulator. Zero dependencies — just Node's built-in fetch/crypto.
FROM node:20-alpine
WORKDIR /sim
COPY apps/simulator/ ./
ENV OFP_API=http://api:3000/api/v1 \
    OFP_SCENARIO=structure-fire \
    OFP_SPEED=1 \
    OFP_LOOP=1
CMD ["node", "run.mjs"]
