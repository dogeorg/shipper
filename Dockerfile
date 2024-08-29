# Use the official Node.js 21 image as a parent image
FROM node:21-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies without running scripts
RUN npm install --verbose --no-audit --ignore-scripts

# Copy the rest of your application's source code
COPY . .

# Compile app
RUN npm run build

# Expose the port your shipper runs on
EXPOSE 3000

# Command to start shipper
CMD ["npm", "start"]

# ######## NICE #########
# After this, run the container with:
# docker run -p 3000:3000 --env-file .env shipper
# #################
