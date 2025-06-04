# Shipper

Postage calculation API for Dogebox pre-orders

### Setup

Requires NodeJS 18 or upwards OR docker.

Copy the example configuration file and modify it for your environment:

```bash
cp config/config.example.json config/config.development.json
```

Edit `config/config.development.json` with your settings:

```json
{
  "port": 3000,
  "auspostApiKey": "your-api-key-here",
  "dogeToAudRate": 0.15,
  "handlingCostInDoge": 30,
  "allowedOrigins": "*"
}
```

The application supports different environments through configuration files:

- `config/config.development.json` - Used when NODE_ENV=development or not set
- `config/config.production.json` - Used when NODE_ENV=production
- `config/config.test.json` - Used when NODE_ENV=test

### Running in Prod (via Docker container)

```bash
# Build the container
docker build -t shipper .

# Run the container (mount config directory)
docker run -p 3000:3000 -v $(pwd)/config:/app/config shipper

# Interact with container
http <address>:3000/shipping/calc sku=b0rk country=PT
```

### Run in Prod (bare metal)

```bash
# Install NodeJS 18 or upwards
nvm install 18

# Install project dependencies
npm install

# Compile application (Typescript -> Javascript)
npm run build

# Run app
npm start
```

### Run dev server (not suitable for prod)

```bash
# Requires NodeJS 18 or greater
npm install
npm run dev
```

---

### Interacting with API

#### On success:

_Example HTTPie Request_
```bash
http localhost:3000/shipping/calc sku="b0rk" country="PT" postcode="90210"
```

_Example JSON Payload_
```json
{
    "sku": "b0rk",
    "country": "PT", 
    "postcode": "90210"
}
```

_Response_
```json
{
  "deliveryAdviceURL": "https://auspost.com.au/sending/delivery-speeds-and-coverage/international-delivery-times",
  "options": [
    {
      "id": "INT_PARCEL_COR_OWN_PACKAGING",
      "label": "Courier",
      "price": "134.15"
    },
    {
      "id": "INT_PARCEL_EXP_OWN_PACKAGING",
      "label": "Express",
      "price": "69.15"
    },
    {
      "id": "INT_PARCEL_STD_OWN_PACKAGING",
      "label": "Standard",
      "price": "54.15"
    },
    {
      "id": "INT_PARCEL_AIR_OWN_PACKAGING",
      "label": "Economy Air",
      "price": "51.65"
    }
  ],
  "success": true
}
```

#### On error:

_Bad Example HTTPie Request_
```bash
http localhost:3000/shipping/calc sku="bL0rk" country="CHICKEN" postcode="90210"
```

_Bad Example JSON Payload_
```json
{
    "sku": "bL0rk",
    "country": "CHICKEN", 
    "postcode": "90210"
}
```

_Response:_
```json
{
  "error": "BAD_INPUT",
  "reasons": [
    "Invalid SKU. Received \"bL0rk\", expected one of standard, founders, b0rk",
    "Malformed country code. Received \"CHICKEN\", expected 2 letter A-Z"
  ],
  "success": false
}
```
